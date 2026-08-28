import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { probeLiveness, probeReadiness } from "@/lib/kernel/health/probe";
import { paymentAnomalyFingerprint } from "@/lib/kernel/payments/anomaly";
import {
  insertLabCitizen,
  creditLabWallet,
  labUserId,
  withLabPg,
  PG_LAB_URL,
} from "../helpers/pg-lab";
import { runLabBackupRestore } from "../../scripts/ops-pg-backup-restore-lib";
import { listPaymentAnomalies } from "../../scripts/ops-list-payment-anomalies-lib";

const READY_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  INNGEST_EVENT_KEY: "evt",
  INNGEST_SIGNING_KEY: "sign",
  PAYTR_MERCHANT_ID: "id",
  PAYTR_MERCHANT_KEY: "key",
  PAYTR_MERCHANT_SALT: "salt",
};

describe("pg backup/restore + readiness ping", () => {
  it("pg_dump restore ledger, idempotency ve requestId korur; lab DB ping readiness 200", async () => {
    const userId = labUserId("backup");
    const requestId = randomUUID();
    const idempotencyKey = randomUUID();
    await insertLabCitizen({ id: userId, email: `backup-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 12_345, purpose: "backup-restore-smoke" });

    await withLabPg(async (client) => {
      await client.query(
        `INSERT INTO http_idempotency_records
           (id, user_id, route, key, request_hash, status, status_code, response_json, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())`,
        [
          randomUUID(),
          userId,
          "/api/wallet/top-up",
          idempotencyKey,
          "sha256-lab-backup",
          "completed",
          200,
          JSON.stringify({ requestId, ok: true }),
        ],
      );
      const fingerprint = paymentAnomalyFingerprint({
        kind: "amount_mismatch",
        merchantOid: `oid-${userId.slice(0, 8)}`,
        expectedMinor: 1000,
        reportedMinor: 999,
      });
      await client.query(
        `INSERT INTO payment_anomalies
           (id, fingerprint, kind, merchant_oid, expected_minor, reported_minor, request_id, detail, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
        [
          randomUUID(),
          fingerprint,
          "amount_mismatch",
          `oid-${userId.slice(0, 8)}`,
          1000,
          999,
          requestId,
          JSON.stringify({ source: "pg-backup-smoke" }),
        ],
      );
    });

    const result = await runLabBackupRestore({
      sourceUrl: PG_LAB_URL,
      dumpDir: resolve(process.cwd(), ".tmp", "pg-lab", "backups"),
    });
    expect(result.source.ledgerCount).toBe(result.restored.ledgerCount);
    expect(result.restored.ledgerCount).toBeGreaterThan(0);
    expect(result.restored.ledgerIdempotencyKeys).toContain(
      `lab-open:backup-restore-smoke:${userId}`,
    );
    expect(result.restored.idempotencySlots.some((slot) => slot.includes(idempotencyKey))).toBe(true);
    expect(result.restored.anomalyRequestIds).toContain(requestId);
    expect(result.dumpMs).toBeGreaterThan(0);
    expect(result.restoreMs).toBeGreaterThan(0);

    await withLabPg(async (client) => {
      const listed = await listPaymentAnomalies(client, 50);
      expect(listed.some((row) => row.requestId === requestId)).toBe(true);
      expect(JSON.stringify(listed)).not.toMatch(/@lab\.rail/);
    });

    const live = probeLiveness();
    expect(live.statusCode).toBe(200);
    const ready = await probeReadiness({
      databaseUrl: PG_LAB_URL,
      env: READY_ENV,
      pingDb: async () => {
        await withLabPg(async (client) => {
          await client.query("SELECT 1");
        });
      },
    });
    expect(ready.statusCode).toBe(200);
    expect(ready.body.checks.db).toBe("ok");
  }, 120_000);
});

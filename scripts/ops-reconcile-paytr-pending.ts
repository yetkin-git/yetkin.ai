#!/usr/bin/env tsx
/**
 * PENDING PayTR siparişlerini mutabakata sokar (FAILED / CLEARED).
 *
 *   npm run ops:reconcile-paytr-pending             # kuru çalışma (yazma yok)
 *   npm run ops:reconcile-paytr-pending -- --apply   # PSP sorgusu + markFailed
 *   npm run ops:reconcile-paytr-pending -- --apply --min-age-hours=2
 *
 * Fail-closed: PSP "paid" + tutar eşleşmesi olmadan CREDIT yazılmaz.
 * `--apply` olmadan hiçbir satır değişmez. Inngest Cloud yokken elle çalıştırılır
 * (`.system_docs/ops/ops-inngest.md`).
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import type { Client } from "pg";
import { connectOpsDmlClient } from "./ops-pg-direct-client";
import {
  classifyPaytrPending,
  paytrPendingAgeHours,
  paytrPendingSummary,
  type PaytrPendingRow,
} from "./ops-list-paytr-pending-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

type Cli = { apply: boolean; minAgeHours: number; limit: number };

function parseCli(argv: readonly string[]): Cli {
  const minAgeRaw = argv.find((part) => part.startsWith("--min-age-hours="));
  const limitRaw = argv.find((part) => part.startsWith("--limit="));
  const minAgeHours = minAgeRaw ? Number(minAgeRaw.slice("--min-age-hours=".length)) : 2;
  const limit = limitRaw ? Number(limitRaw.slice("--limit=".length)) : 500;
  if (!Number.isFinite(minAgeHours) || minAgeHours < 0) {
    throw new Error("--min-age-hours geçersiz.");
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit geçersiz.");
  }
  return { apply: argv.includes("--apply"), minAgeHours, limit };
}

function fail(message: string): never {
  console.error(`ops:reconcile-paytr-pending BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function readPending(client: Client, limit: number): Promise<PaytrPendingRow[]> {
  const result = await client.query<{
    merchant_oid: string;
    purpose: string;
    amount_minor: number;
    currency_code: string;
    created_at: Date;
    user_id: string;
  }>(
    `SELECT merchant_oid, purpose, amount_minor, currency_code, created_at, user_id
     FROM payment_orders
     WHERE status = 'PENDING'
     ORDER BY created_at ASC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map((row) => ({
    merchantOid: row.merchant_oid,
    purpose: row.purpose,
    amountMinor: Number(row.amount_minor),
    currencyCode: row.currency_code,
    createdAt: new Date(row.created_at),
    userId: row.user_id,
  }));
}

async function main(): Promise<void> {
  const cli = parseCli(process.argv.slice(2));
  const { client, via } = await connectOpsDmlClient();
  try {
    const rows = await readPending(client, cli.limit);
    const now = new Date();
    const summary = paytrPendingSummary(rows, now);
    console.log(
      `ops:reconcile-paytr-pending — ${summary.total} PENDING · ${summary.timedOut} tavan aşımı · en yaşlı ${summary.oldestHours}h (${via}) · apply=${cli.apply}`,
    );
    if (!cli.apply) {
      for (const row of rows) {
        const age = paytrPendingAgeHours(row.createdAt, now);
        const stale = classifyPaytrPending(row.createdAt, now);
        console.log(` kuru  ${row.merchantOid} ${row.amountMinor} ${row.currencyCode} ${age}h ${stale}`);
      }
      console.log("Kuru çalışma. Yazmak için --apply ekle.");
      return;
    }

    // Gerçek kapı: reconcile.ts. PSP sorgusu + CAS markFailed.
    const { createPrismaClearingPorts } = await import("@/lib/kernel/payments/prisma-order-store");
    const { createPrismaPaymentAnomalyStore } = await import("@/lib/kernel/payments/prisma-anomaly-store");
    const { reconcilePaytrPaymentOrder } = await import("@/lib/kernel/payments/paytr/reconcile");

    const ports = {
      ...createPrismaClearingPorts(),
      anomalies: createPrismaPaymentAnomalyStore(),
    };
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const age = paytrPendingAgeHours(row.createdAt, now);
      if (age < cli.minAgeHours) {
        console.log(` atla  ${row.merchantOid} ${age}h < ${cli.minAgeHours}h`);
        continue;
      }
      const result = await reconcilePaytrPaymentOrder(ports, row.merchantOid, now);
      counts[`${result.action}:${result.reason}`] = (counts[`${result.action}:${result.reason}`] ?? 0) + 1;
      console.log(
        ` ${result.action.padEnd(7)} ${row.merchantOid} ${row.amountMinor} ${row.currencyCode} ${age}h → ${result.reason}`,
      );
    }
    console.log("Özet:");
    for (const [key, value] of Object.entries(counts).sort()) {
      console.log(` ${key} = ${value}`);
    }
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});

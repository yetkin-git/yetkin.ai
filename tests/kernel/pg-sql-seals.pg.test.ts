import { readdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import {
  CERTIFICATE_REVOCATION_MIGRATION,
  ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK,
  ESCROW_HOLD_BPS_RANGE_CHECK,
  ESCROW_HOLD_CHECKS_MIGRATION,
  ESCROW_HOLD_GROSS_SPLIT_CHECK,
  FORCE_RLS_CORE_TABLES,
  HTTP_IDEMPOTENCY_UNIQUE_INDEX,
  LEDGER_AMOUNT_CHECK,
  LEDGER_IMMUTABILITY_MIGRATION,
  WALLET_AMOUNT_CHECK,
} from "../../scripts/ops-migrate-lib";
import {
  creditLabWallet,
  insertLabCitizen,
  labPrisma,
  labUserId,
  labWalletMinor,
  pgConstraint,
  withLabPg,
} from "../helpers/pg-lab";

describe("Postgres SQL mühürleri — motor reddi", () => {
  it("EscrowHold gross ≠ hold + net CHECK'i Postgres reddeder (uygulama değil)", async () => {
    const userId = labUserId("escrow-check");
    await insertLabCitizen({ id: userId, email: `escrow-check-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 50_000, purpose: "escrow-check" });
    const wallet = await labPrisma().wallet.findUniqueOrThrow({
      where: { userId_currencyCode: { userId, currencyCode: "TRY" } },
    });

    const caught = await withLabPg(async (client) => {
      try {
        await client.query(
          `INSERT INTO escrow_holds (
             id, wallet_id, user_id, reference_key, status, currency_code,
             gross_minor, hold_minor, net_minor, hold_bps, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'PENDING', 'TRY', 10000, 1000, 8000, 1000, NOW(), NOW())`,
          [randomUUID(), wallet.id, userId, `lab-bad-split:${userId}`],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });

    expect(caught).not.toBeNull();
    expect(caught?.code).toBe("23514");
    expect(caught?.constraint).toBe(ESCROW_HOLD_GROSS_SPLIT_CHECK);
    expect(await labPrisma().escrowHold.findUnique({ where: { referenceKey: `lab-bad-split:${userId}` } })).toBeNull();
  });

  it("EscrowHold negatif/sıfır tutar ve hold_bps aralığı DB CHECK ile düşer", async () => {
    const userId = labUserId("escrow-range");
    await insertLabCitizen({ id: userId, email: `escrow-range-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 50_000, purpose: "escrow-range" });
    const wallet = await labPrisma().wallet.findUniqueOrThrow({
      where: { userId_currencyCode: { userId, currencyCode: "TRY" } },
    });

    const zeroGross = await withLabPg(async (client) => {
      try {
        await client.query(
          `INSERT INTO escrow_holds (
             id, wallet_id, user_id, reference_key, status, currency_code,
             gross_minor, hold_minor, net_minor, hold_bps, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'PENDING', 'TRY', 0, 0, 0, 1000, NOW(), NOW())`,
          [randomUUID(), wallet.id, userId, `lab-zero-gross:${userId}`],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(zeroGross?.code).toBe("23514");
    expect(zeroGross?.constraint).toBe(ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK);

    const badBps = await withLabPg(async (client) => {
      try {
        await client.query(
          `INSERT INTO escrow_holds (
             id, wallet_id, user_id, reference_key, status, currency_code,
             gross_minor, hold_minor, net_minor, hold_bps, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'PENDING', 'TRY', 10000, 1000, 9000, 10001, NOW(), NOW())`,
          [randomUUID(), wallet.id, userId, `lab-bad-bps:${userId}`],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(badBps?.code).toBe("23514");
    expect(badBps?.constraint).toBe(ESCROW_HOLD_BPS_RANGE_CHECK);
  });

  it("Prisma ORM EscrowHold yazımı da aynı CHECK'e çarpar; client-side hesap kalkanı değildir", async () => {
    const userId = labUserId("escrow-orm");
    await insertLabCitizen({ id: userId, email: `escrow-orm-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 50_000, purpose: "escrow-orm" });
    const wallet = await labPrisma().wallet.findUniqueOrThrow({
      where: { userId_currencyCode: { userId, currencyCode: "TRY" } },
    });

    let caught: ReturnType<typeof pgConstraint> | null = null;
    try {
      await labPrisma().escrowHold.create({
        data: {
          walletId: wallet.id,
          userId,
          referenceKey: `lab-orm-split:${userId}`,
          currencyCode: "TRY",
          grossMinor: 10_000,
          holdMinor: 1_000,
          netMinor: 8_000,
          holdBps: 1_000,
        },
      });
    } catch (error) {
      caught = pgConstraint(error);
    }
    expect(caught).not.toBeNull();
    expect(caught?.code === "23514" || caught?.message.includes(ESCROW_HOLD_GROSS_SPLIT_CHECK)).toBe(
      true,
    );
  });

  it("cüzdan negatif bakiye CHECK ve defter append-only trigger Postgres'tedir", async () => {
    const userId = labUserId("ledger-seal");
    await insertLabCitizen({ id: userId, email: `ledger-seal-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 5_000, purpose: "ledger-seal" });
    const wallet = await labPrisma().wallet.findUniqueOrThrow({
      where: { userId_currencyCode: { userId, currencyCode: "TRY" } },
    });
    expect(await labWalletMinor(userId)).toBe(5_000);

    const negative = await withLabPg(async (client) => {
      try {
        await client.query(`UPDATE wallets SET amount_minor = -1 WHERE id = $1`, [wallet.id]);
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(negative?.code).toBe("23514");
    expect(negative?.constraint).toBe(WALLET_AMOUNT_CHECK);
    expect(await labWalletMinor(userId)).toBe(5_000);

    const entry = await labPrisma().ledgerEntry.findFirstOrThrow({ where: { userId } });
    const mutated = await withLabPg(async (client) => {
      try {
        await client.query(`UPDATE ledger_entries SET label = 'mutated' WHERE id = $1`, [entry.id]);
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(mutated?.message).toMatch(/ledger_entries is append-only/);
    const after = await labPrisma().ledgerEntry.findFirstOrThrow({ where: { id: entry.id } });
    expect(after.label).toBe("lab opening");

    const deleted = await withLabPg(async (client) => {
      try {
        await client.query(`DELETE FROM ledger_entries WHERE id = $1`, [entry.id]);
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(deleted?.message).toMatch(/ledger_entries is append-only/);

    const zeroLedger = await withLabPg(async (client) => {
      try {
        await client.query(
          `INSERT INTO ledger_entries (
             id, wallet_id, user_id, amount_minor, currency_code, direction, label, purpose, idempotency_key, created_at
           ) VALUES ($1, $2, $3, 0, 'TRY', 'CREDIT', 'zero', 'lab-zero', $4, NOW())`,
          [randomUUID(), wallet.id, userId, `lab-zero-ledger:${userId}`],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(zeroLedger?.code).toBe("23514");
    expect(zeroLedger?.constraint).toBe(LEDGER_AMOUNT_CHECK);
  });

  it("boş şema apply: Prisma zinciri, FORCE RLS, iptal kolonları ve akademi tohumu durur", async () => {
    const diskMigrations = readdirSync(join(process.cwd(), "prisma", "migrations")).filter((name) =>
      /^\d{14}_/.test(name),
    );
    const evidence = await withLabPg(async (client) => {
      const migrations = await client.query<{ migration_name: string }>(
        `SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY started_at`,
      );
      const rls = await client.query<{ relname: string }>(
        `SELECT c.relname
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'
           AND c.relkind = 'r'
           AND c.relforcerowsecurity
           AND c.relname = ANY($1::text[])`,
        [[...FORCE_RLS_CORE_TABLES]],
      );
      const cols = await client.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'academy_certificates'
           AND column_name IN ('revoked_at', 'revoke_reason')`,
      );
      const course = await client.query<{ id: string }>(
        `SELECT id FROM academy_courses WHERE id = 'ac_rail_temel'`,
      );
      const catalog = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM price_catalog_entries WHERE module_key = $1`,
        [ACADEMY_MODULE_KEY],
      );
      return {
        migrations: migrations.rows.map((row) => row.migration_name),
        rls: rls.rows.map((row) => row.relname).sort(),
        cols: cols.rows.map((row) => row.column_name).sort(),
        course: course.rows.length,
        catalog: Number(catalog.rows[0]?.n ?? 0),
      };
    });

    expect(evidence.migrations.sort()).toEqual([...diskMigrations].sort());
    expect(evidence.migrations).toContain(CERTIFICATE_REVOCATION_MIGRATION);
    expect(evidence.migrations).toContain(ESCROW_HOLD_CHECKS_MIGRATION);
    expect(evidence.migrations).toContain(LEDGER_IMMUTABILITY_MIGRATION);
    expect(evidence.rls).toEqual([...FORCE_RLS_CORE_TABLES].sort());
    expect(evidence.cols).toEqual(["revoke_reason", "revoked_at"]);
    expect(evidence.course).toBe(1);
    expect(evidence.catalog).toBeGreaterThanOrEqual(3);
  });

  it("aynı Idempotency-Key satırına ikinci INSERT unique index 23505 basar", async () => {
    const userId = labUserId("idem-unique");
    await insertLabCitizen({ id: userId, email: `idem-unique-${userId}@lab.rail` });
    const route = "/api/freelancer/jobs/[id]/accept";
    const key = `lab-unique:${userId}`;
    const caught = await withLabPg(async (client) => {
      await client.query(
        `INSERT INTO http_idempotency_records (
           id, user_id, route, key, request_hash, status, status_code, response_json, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 'hash', 'started', 0, '{}', NOW(), NOW())`,
        [randomUUID(), userId, route, key],
      );
      try {
        await client.query(
          `INSERT INTO http_idempotency_records (
             id, user_id, route, key, request_hash, status, status_code, response_json, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'hash-2', 'started', 0, '{}', NOW(), NOW())`,
          [randomUUID(), userId, route, key],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(caught).not.toBeNull();
    expect(caught?.code).toBe("23505");
    expect(caught?.constraint).toBe(HTTP_IDEMPOTENCY_UNIQUE_INDEX);
  });

  it("FORCE RLS authenticated JWT'siz cüzdan görmez; sub eşleşince kendi satırını görür", async () => {
    const userId = labUserId("rls");
    await insertLabCitizen({ id: userId, email: `rls-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 4_000, purpose: "rls-open" });
    expect(await labWalletMinor(userId)).toBe(4_000);

    const counts = await withLabPg(async (client) => {
      const asPostgres = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM wallets WHERE user_id = $1`,
        [userId],
      );
      await client.query("SET ROLE authenticated");
      const blind = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM wallets WHERE user_id = $1`,
        [userId],
      );
      await client.query("RESET ROLE");
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [userId]);
      await client.query("SET ROLE authenticated");
      const asSelf = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM wallets WHERE user_id = $1`,
        [userId],
      );
      await client.query("RESET ROLE");
      return {
        asPostgres: Number(asPostgres.rows[0]?.n ?? -1),
        blind: Number(blind.rows[0]?.n ?? -1),
        asSelf: Number(asSelf.rows[0]?.n ?? -1),
      };
    });

    expect(counts.asPostgres).toBe(1);
    expect(counts.blind).toBe(0);
    expect(counts.asSelf).toBe(1);
  });
});

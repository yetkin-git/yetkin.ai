#!/usr/bin/env tsx
/**
 * Kapalı lab Postgres — boş şema + Auth stub + ops:migrate.
 * Hosted Supabase Auth değildir. Yalnız loopback :5432.
 * Hosted DIRECT_URL bu betikte kullanılmaz (üretim Auth şemasına stub basılmaz).
 *
 *   docker compose -f docker-compose.postgres.yml up -d
 *   npm run ops:lab-postgres
 *   npm run test:pg
 */

import { spawnSync } from "node:child_process";
import dns from "node:dns";
import net from "node:net";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { ensureLabPostgresRuntime } from "./ops-lab-pg-runtime";
import {
  DIRECT_POSTGRES_PORT,
  LAB_POSTGRES_DEFAULT_URL,
  ensureLabAuthSchema,
  isForbiddenPoolerUrl,
  isLabLoopbackUrl,
  parseDirectConnectionUrl,
  resetLabPublicSchema,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

dns.setDefaultResultOrder("ipv6first");

function fail(message: string): never {
  console.error(`ops:lab-postgres BAŞARISIZ: ${message}`);
  process.exit(1);
}

function resolveLabUrl(): string {
  const candidates = [
    process.env.RAIL_PG_LAB_URL,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
  ];
  for (const raw of candidates) {
    const url = raw?.trim();
    if (!url) {
      continue;
    }
    if (isForbiddenPoolerUrl(url)) {
      fail("Lab Postgres işlem havuzu üzerinden çalışmaz. Loopback :5432 kullanın.");
    }
    if (isLabLoopbackUrl(url)) {
      return url;
    }
  }
  return LAB_POSTGRES_DEFAULT_URL;
}

function probeDirectTcp(hostname: string, port: number, timeoutMs = 8000): Promise<void> {
  return new Promise((resolveProbe, rejectProbe) => {
    const socket = net.connect({ host: hostname, port });
    const timer = setTimeout(() => {
      socket.destroy();
      rejectProbe(new Error("timeout"));
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolveProbe();
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      socket.destroy();
      rejectProbe(error);
    });
  });
}

async function main(): Promise<void> {
  const url = resolveLabUrl();
  if (!isLabLoopbackUrl(url)) {
    fail(
      `Lab Postgres yalnız loopback :${DIRECT_POSTGRES_PORT}. Hosted Auth şemasına stub basılmaz. docker compose -f docker-compose.postgres.yml up -d`,
    );
  }
  const shape = parseDirectConnectionUrl(url);
  if (!shape) {
    fail("Lab bağlantı URL'si çözülemedi.");
  }
  console.log("ops:lab-postgres — loopback Auth stub, sonra ops:migrate.");
  console.log("   auth.users stub'dur; hosted Supabase Auth değildir.");
  console.log(`→ Direct Port ön kontrol: ${shape.hostname}:${shape.port}`);
  try {
    await ensureLabPostgresRuntime();
    await probeDirectTcp(shape.hostname, shape.port);
    console.log("   TCP :5432 açık.");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(
      `Lab :5432 erişilemedi (${shape.hostname}:${shape.port} — ${detail}). docker compose -f docker-compose.postgres.yml up -d`,
    );
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const query = async (text: string, params?: unknown[]) => {
      const result = params
        ? await client.query(text, params as never)
        : await client.query(text);
      return { rows: result.rows as Array<Record<string, unknown>> };
    };
    await resetLabPublicSchema(query);
    console.log("   public şema sıfırlandı — DROP SCHEMA public CASCADE (yalnız yetkin_rail_lab).");
    await ensureLabAuthSchema(query);
    console.log("   auth.users stub OK — CREATE SCHEMA auth + uuid id.");
  } finally {
    await client.end();
  }

  process.env.DIRECT_URL = url;
  process.env.DATABASE_URL = url;
  const result = spawnSync("npx", ["tsx", "scripts/ops-migrate.ts"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    fail(`ops:migrate çıktı kodu ${result.status ?? "null"}`);
  }

  const evidence = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await evidence.connect();
  try {
    const migrations = await evidence.query<{ migration_name: string }>(
      `SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY started_at`,
    );
    console.log(`   Prisma finished: ${migrations.rows.length} klasör`);
    for (const row of migrations.rows) {
      console.log(`     - ${row.migration_name}`);
    }
    const checks = await evidence.query<{ conname: string }>(
      `SELECT conname FROM pg_constraint
       WHERE conname IN (
         'escrow_holds_amounts_positive',
         'escrow_holds_gross_equals_hold_plus_net',
         'escrow_holds_hold_bps_range',
         'wallets_amount_minor_non_negative',
         'ledger_entries_amount_minor_positive'
       )
       ORDER BY conname`,
    );
    console.log(`   CHECK mühür: ${checks.rows.map((row) => row.conname).join(", ")}`);
    const trigger = await evidence.query<{ tgname: string }>(
      `SELECT t.tgname FROM pg_trigger t
       JOIN pg_class c ON c.oid = t.tgrelid
       WHERE c.relname = 'ledger_entries' AND t.tgname = 'ledger_entries_append_only'`,
    );
    console.log(
      trigger.rows.length > 0
        ? "   ledger_entries_append_only trigger OK"
        : "   ledger_entries_append_only EKSİK",
    );
    if (trigger.rows.length === 0) {
      fail("ledger_entries_append_only apply sonrası yok");
    }
    if (checks.rows.length !== 5) {
      fail(`CHECK mühür sayısı ${checks.rows.length}, beklenen 5`);
    }
  } finally {
    await evidence.end();
  }

  console.log("ops:lab-postgres OK — boş şema + sekiz SQL mühür + Prisma zinciri (iptal dahil).");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});

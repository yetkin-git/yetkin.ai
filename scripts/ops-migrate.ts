#!/usr/bin/env tsx
/**
 * Ops omurgası — prisma migrate deploy + supabase/migrations SQL sırası.
 * Tablolar Prisma'dan gelir. Auth trigger / FORCE RLS / katalog / akademi tohumu /
 * e-posta senkronu / freelancer ilan tohumu sonra uygulanır.
 * Prisma deploy Studio data_base64 CHECK ve http_idempotency_records basar;
 * post-apply mühür yoksa fail-closed çıkar. Yeni tablo icat etmez; SQL dosyaları
 * idempotenttir. Canlı DB ister.
 *
 * Sıra (kilitli):
 *   1) prisma migrate deploy (D2.1 academy_lesson_completions, D2.2 curriculum_seal,
 *      D2.3 corporate_job_offers dahil — Direct :5432)
 *   2) 20260814010000_handle_new_user_auth_sync.sql
 *   3) 20260814020000_enforce_rls_all_tables.sql
 *   4) 20260814030000_rls_user_scoped_policies.sql
 *   5) 20260814040000_price_catalog_definitions.sql
 *   6) 20260814090000_academy_course_seed.sql
 *   7) 20260814100000_handle_user_email_update.sql
 *   8) 20260814110000_freelancer_job_seed.sql
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import dns from "node:dns";
import net from "node:net";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import {
  ACADEMY_SEED_COURSE_IDS,
  DIRECT_PORT_OPERATOR_PROTOCOL,
  DIRECT_POSTGRES_PORT,
  EXPECTED_SQL,
  FREELANCER_SEED_JOB_IDS,
  PRISMA_RING_MIGRATIONS,
  assertAuthUsers,
  assertPublicUsers,
  assertPrismaRingMigrationsPresent,
  assertSqlSealPlanComplete,
  inspectSqlSealPlan,
  isForbiddenPoolerUrl,
  parseDirectConnectionUrl,
  resolveMigratorConnectionUrl,
  runPostApplySeals,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

dns.setDefaultResultOrder("ipv6first");

function fail(message: string): never {
  console.error(`ops:migrate BAŞARISIZ: ${message}`);
  process.exit(1);
}

function connectionUrl(): string {
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL tanımlı değil. .system_docs/OPS_RUNBOOK.md");
  }
  return url;
}

function assertDirectConnection(url: string): void {
  if (isForbiddenPoolerUrl(url)) {
    fail(
      `Migrasyon işlem havuzu üzerinden çalışmaz. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }
  const shape = parseDirectConnectionUrl(url);
  if (!shape) {
    fail(`DIRECT_URL çözülemedi. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  if (!shape.ok) {
    fail(
      `Direct host/port mühürü kırıldı (host=${shape.hostname} port=${shape.port}). ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }
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

async function assertDirectPortReachable(url: string): Promise<void> {
  const shape = parseDirectConnectionUrl(url);
  if (!shape) {
    fail(`DIRECT_URL çözülemedi. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  console.log(
    `→ Direct Port ön kontrol: ${shape.hostname}:${shape.port} (beklenen ${DIRECT_POSTGRES_PORT})`,
  );
  try {
    await probeDirectTcp(shape.hostname, shape.port);
    console.log("   TCP :5432 açık.");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(
      `Direct :5432 erişilemedi (${shape.hostname}:${shape.port} — ${detail}). ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }
}

function listPrismaMigrationFolders(): string[] {
  const dir = resolve(ROOT, "prisma", "migrations");
  if (!existsSync(dir)) {
    fail("prisma/migrations dizini yok.");
  }
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{14}_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function listSqlFiles(): string[] {
  const dir = resolve(ROOT, "supabase", "migrations");
  if (!existsSync(dir)) {
    fail("supabase/migrations dizini yok.");
  }
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    fail("supabase/migrations altında SQL yok.");
  }
  if (files.length !== EXPECTED_SQL.length) {
    fail(
      `SQL sayısı kilitli yedi değil (${files.length}). Ek dosya veya eksik: ${files.join(", ")}`,
    );
  }
  for (let index = 0; index < EXPECTED_SQL.length; index += 1) {
    if (files[index] !== EXPECTED_SQL[index]) {
      fail(`Beklenen SQL sırası bozuldu: ${EXPECTED_SQL[index]} ≠ ${files[index]}`);
    }
  }
  return [...EXPECTED_SQL];
}

function runPrismaDeploy(): void {
  console.log("→ prisma migrate deploy");
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    fail(`prisma migrate deploy çıktı kodu ${result.status ?? "null"}`);
  }
}

async function applySql(client: Client, files: string[]): Promise<void> {
  const dir = resolve(ROOT, "supabase", "migrations");
  console.log("→ Supabase SQL sırası:");
  for (const file of files) {
    console.log(`   ${file}`);
  }
  for (const file of files) {
    const sql = readFileSync(resolve(dir, file), "utf8");
    console.log(`→ uygulanıyor: ${file}`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("COMMIT");
      console.log(`   tamam: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      const message = error instanceof Error ? error.message : String(error);
      fail(`${file}: ${message}`);
    }
  }
}

async function main(): Promise<void> {
  const url = connectionUrl();
  assertDirectConnection(url);
  await assertDirectPortReachable(url);
  const files = listSqlFiles();
  const prismaFolders = listPrismaMigrationFolders();
  const prismaRingIssues = assertPrismaRingMigrationsPresent(prismaFolders);
  if (prismaRingIssues.length > 0) {
    fail(`Prisma D2 halka migrasyonu eksik: ${prismaRingIssues.join("; ")}`);
  }
  const sqlByFile: Record<string, string> = {};
  const dir = resolve(ROOT, "supabase", "migrations");
  for (const file of files) {
    sqlByFile[file] = readFileSync(resolve(dir, file), "utf8");
  }
  const planIssues = assertSqlSealPlanComplete(inspectSqlSealPlan(sqlByFile));
  if (planIssues.length > 0) {
    fail(`SQL mühür planı eksik: ${planIssues.join("; ")}`);
  }

  console.log("ops:migrate — Prisma şema (D2.1 ders sicili, D2.2 curriculum_seal, D2.3 corporate_job_offers), sonra yedi SQL.");
  console.log(`   Prisma halka: ${PRISMA_RING_MIGRATIONS.join(" → ")}`);
  runPrismaDeploy();

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const query = async (text: string, params?: unknown[]) => {
      const result = params
        ? await client.query(text, params as never)
        : await client.query(text);
      return { rows: result.rows as Array<Record<string, unknown>> };
    };
    await assertPublicUsers(query);
    await assertAuthUsers(query);
    await applySql(client, files);
    await runPostApplySeals(query);
    console.log(
      `   akademi tohumu OK — ${ACADEMY_SEED_COURSE_IDS.length} yayında kurs, katalog + sınav bağlı.`,
    );
    console.log("   auth sync OK — handle_new_user AFTER INSERT + handle_user_email_update AFTER UPDATE.");
    console.log("   FORCE RLS OK — çekirdek tablolar relforcerowsecurity.");
    console.log("   Studio CHECK OK — studio_digital_assets data_base64 tavanı 2097152.");
    console.log("   http_idempotency_records OK — unique user_id+route+key.");
    console.log("   D2.1 academy_lesson_completions OK.");
    console.log("   D2.2 curriculum_seal + certificate_hash OK.");
    console.log("   D2.3 corporate_job_offers OK.");
    console.log(
      `   freelancer tohumu OK — ${FREELANCER_SEED_JOB_IDS.length} OPEN ilan, katalog taban + hold bağlı.`,
    );
  } finally {
    await client.end();
  }

  console.log(
    "ops:migrate OK — Prisma şema + Auth sync + e-posta senkronu + FORCE RLS + Studio data_base64 CHECK + http_idempotency_records + katalog tohumu + akademi kurs tohumu + freelancer ilan tohumu.",
  );
  console.log(
    "Sonraki: /register ile ilk kullanıcıyı aç, UUID'yi SUPER_ADMIN_USER_ID yaz (.system_docs/OPS_RUNBOOK.md).",
  );
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});

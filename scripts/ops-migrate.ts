#!/usr/bin/env tsx
/**
 * Ops omurgası — prisma migrate deploy + supabase/migrations SQL sırası.
 * Tablolar Prisma'dan gelir. Auth trigger / FORCE RLS / katalog / akademi tohumu /
 * e-posta senkronu / freelancer ilan tohumu sonra uygulanır.
 * Prisma deploy http_idempotency_records ve defter mühürlerini basar;
 * P3 donmuş 23 tabloyu DROP eder. Post-apply mühür yoksa fail-closed çıkar.
 * Yeni tablo icat etmez; SQL dosyaları idempotenttir. Canlı DB ister.
 *
 * Sıra (kilitli):
 *   1) prisma migrate deploy (D2.1 academy_lesson_completions, D2.2 curriculum_seal,
 *      D2.3 corporate_job_offers (tarihsel), defter immutability + paid_command_reservations,
 *      P3 drop_frozen_room_tables — Direct :5432; Windows IPv6/P1001 ise pooler session)
 *   2) 20260814010000_handle_new_user_auth_sync.sql
 *   3) 20260814020000_enforce_rls_all_tables.sql
 *   4) 20260814030000_rls_user_scoped_policies.sql
 *   5) 20260814040000_price_catalog_definitions.sql
 *   6) 20260814090000_academy_course_seed.sql
 *   7) 20260814100000_handle_user_email_update.sql
 *   8) 20260814110000_freelancer_job_seed.sql
 *   9) 20260823220000_freelancer_job_visa_pathway.sql
 *  10) 20260912220000_academy_sterile_vitrine.sql
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import dns from "node:dns";
import net from "node:net";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";
import {
  ACADEMY_SEED_COURSE_IDS,
  DIRECT_PORT_OPERATOR_PROTOCOL,
  DIRECT_POSTGRES_PORT,
  EXPECTED_SQL,
  FREELANCER_SEED_JOB_IDS,
  LEDGER_IMMUTABILITY_MIGRATION,
  ESCROW_HOLD_CHECKS_MIGRATION,
  CERTIFICATE_REVOCATION_MIGRATION,
  FROZEN_ROOM_DROP_MIGRATION,
  PRISMA_RING_MIGRATIONS,
  assertAuthUsers,
  assertLedgerImmutabilityMigrationPresent,
  assertEscrowHoldChecksMigrationPresent,
  assertCertificateRevocationMigrationPresent,
  assertFrozenRoomDropMigrationPresent,
  assertPublicUsers,
  assertPrismaRingMigrationsPresent,
  applyAcademyCatalogPriceMap,
  assertSqlSealPlanComplete,
  fallbackPoolerApplyTarget,
  inspectLedgerMigrationSql,
  inspectEscrowHoldMigrationSql,
  inspectCertificateRevocationSql,
  inspectFrozenRoomDropSql,
  inspectSqlSealPlan,
  isIpv6OrDnsUnreachable,
  listPrismaMigrationFolders as listDiskPrismaMigrationFolders,
  resolveMigrateApplyTarget,
  runPostApplySeals,
  type MigrateApplyTarget,
} from "./ops-migrate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

dns.setDefaultResultOrder("ipv4first");

function fail(message: string): never {
  console.error(`ops:migrate BAŞARISIZ: ${message}`);
  process.exit(1);
}

function probeTcp(hostname: string, port: number, timeoutMs = 8000): Promise<void> {
  return new Promise((resolveProbe, rejectProbe) => {
    const socket = net.connect({ host: hostname, port, family: 4 });
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

function applyHostPort(url: string): { hostname: string; port: number } | null {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.trim();
    if (!hostname) {
      return null;
    }
    const port = parsed.port ? Number(parsed.port) : DIRECT_POSTGRES_PORT;
    if (!Number.isInteger(port) || port <= 0) {
      return null;
    }
    return { hostname, port };
  } catch {
    return null;
  }
}

async function assertApplyPortReachable(target: MigrateApplyTarget): Promise<void> {
  const shape = applyHostPort(target.url);
  if (!shape) {
    fail(`DIRECT_URL çözülemedi. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  const label = target.via === "pooler" ? "Pooler" : "Direct";
  console.log(`→ ${label} Port ön kontrol: ${shape.hostname}:${shape.port}`);
  try {
    await probeTcp(shape.hostname, shape.port);
    console.log(`   TCP :${shape.port} açık (${target.via}).`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const unreachable = new Error(
      `${label} :${shape.port} erişilemedi (${shape.hostname}:${shape.port} — ${detail})`,
    );
    (unreachable as { code?: string }).code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
    throw unreachable;
  }
}

async function resolveApplyConnection(): Promise<MigrateApplyTarget> {
  const env = {
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  };
  let target = resolveMigrateApplyTarget(env);
  if (!target) {
    fail("DIRECT_URL veya DATABASE_URL tanımlı değil. .system_docs/OPS_RUNBOOK.md");
  }

  if (target.via === "pooler") {
    try {
      await assertApplyPortReachable(target);
      return target;
    } catch (error) {
      fail(
        `${error instanceof Error ? error.message : String(error)}. Windows IPv4 pooler :5432/:6543.`,
      );
    }
  }

  try {
    await assertApplyPortReachable(target);
    return target;
  } catch (error) {
    const fallback = fallbackPoolerApplyTarget(env);
    if (!fallback || !isIpv6OrDnsUnreachable(error)) {
      fail(
        `${error instanceof Error ? error.message : String(error)}. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
      );
    }
    console.warn(
      "   Direct :5432 IPv6/DNS (ENOTFOUND/P1001) — DATABASE_URL pooler session kullanılacak.",
    );
    try {
      await assertApplyPortReachable(fallback);
      return fallback;
    } catch (fallbackError) {
      fail(
        `${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
      );
    }
  }
}

function listPrismaMigrationFolders(): string[] {
  const dir = resolve(ROOT, "prisma", "migrations");
  if (!existsSync(dir)) {
    fail("prisma/migrations dizini yok.");
  }
  const folders = listDiskPrismaMigrationFolders(dir);
  if (folders.length === 0) {
    fail("prisma/migrations altında klasör yok.");
  }
  return folders;
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
      `SQL sayısı kilitli ${EXPECTED_SQL.length} değil (${files.length}). Ek dosya veya eksik: ${files.join(", ")}`,
    );
  }
  for (let index = 0; index < EXPECTED_SQL.length; index += 1) {
    if (files[index] !== EXPECTED_SQL[index]) {
      fail(`Beklenen SQL sırası bozuldu: ${EXPECTED_SQL[index]} ≠ ${files[index]}`);
    }
  }
  return [...EXPECTED_SQL];
}

function runPrismaDeploy(url: string): void {
  console.log("→ prisma migrate deploy");
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      DIRECT_URL: url,
    },
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
  const target = await resolveApplyConnection();
  process.env.DIRECT_URL = target.url;
  const url = target.url;
  if (target.via === "pooler") {
    console.log("   apply via=pooler (Windows Direct IPv6/DNS atlandı).");
  }
  const files = listSqlFiles();
  const prismaFolders = listPrismaMigrationFolders();
  const prismaRingIssues = assertPrismaRingMigrationsPresent(prismaFolders);
  if (prismaRingIssues.length > 0) {
    fail(`Prisma D2 halka migrasyonu eksik: ${prismaRingIssues.join("; ")}`);
  }
  const ledgerFolderIssues = assertLedgerImmutabilityMigrationPresent(prismaFolders);
  if (ledgerFolderIssues.length > 0) {
    fail(ledgerFolderIssues.join("; "));
  }
  const ledgerSqlPath = resolve(
    ROOT,
    "prisma",
    "migrations",
    LEDGER_IMMUTABILITY_MIGRATION,
    "migration.sql",
  );
  if (!existsSync(ledgerSqlPath)) {
    fail(`Defter migrasyon SQL yok: ${LEDGER_IMMUTABILITY_MIGRATION}/migration.sql`);
  }
  const ledgerSqlIssues = inspectLedgerMigrationSql(readFileSync(ledgerSqlPath, "utf8"));
  if (ledgerSqlIssues.length > 0) {
    fail(`Defter migrasyon SQL mühürü eksik: ${ledgerSqlIssues.join("; ")}`);
  }
  const escrowFolderIssues = assertEscrowHoldChecksMigrationPresent(prismaFolders);
  if (escrowFolderIssues.length > 0) {
    fail(escrowFolderIssues.join("; "));
  }
  const escrowSqlPath = resolve(
    ROOT,
    "prisma",
    "migrations",
    ESCROW_HOLD_CHECKS_MIGRATION,
    "migration.sql",
  );
  if (!existsSync(escrowSqlPath)) {
    fail(`Emanet CHECK migrasyon SQL yok: ${ESCROW_HOLD_CHECKS_MIGRATION}/migration.sql`);
  }
  const escrowSqlIssues = inspectEscrowHoldMigrationSql(readFileSync(escrowSqlPath, "utf8"));
  if (escrowSqlIssues.length > 0) {
    fail(`Emanet CHECK migrasyon SQL mühürü eksik: ${escrowSqlIssues.join("; ")}`);
  }
  const revocationFolderIssues = assertCertificateRevocationMigrationPresent(prismaFolders);
  if (revocationFolderIssues.length > 0) {
    fail(revocationFolderIssues.join("; "));
  }
  const revocationSqlPath = resolve(
    ROOT,
    "prisma",
    "migrations",
    CERTIFICATE_REVOCATION_MIGRATION,
    "migration.sql",
  );
  if (!existsSync(revocationSqlPath)) {
    fail(`Sertifika iptal migrasyon SQL yok: ${CERTIFICATE_REVOCATION_MIGRATION}/migration.sql`);
  }
  const revocationSqlIssues = inspectCertificateRevocationSql(
    readFileSync(revocationSqlPath, "utf8"),
  );
  if (revocationSqlIssues.length > 0) {
    fail(`Sertifika iptal SQL mühürü eksik: ${revocationSqlIssues.join("; ")}`);
  }
  const frozenDropFolderIssues = assertFrozenRoomDropMigrationPresent(prismaFolders);
  if (frozenDropFolderIssues.length > 0) {
    fail(frozenDropFolderIssues.join("; "));
  }
  const frozenDropSqlPath = resolve(
    ROOT,
    "prisma",
    "migrations",
    FROZEN_ROOM_DROP_MIGRATION,
    "migration.sql",
  );
  if (!existsSync(frozenDropSqlPath)) {
    fail(`Donmuş oda DROP SQL yok: ${FROZEN_ROOM_DROP_MIGRATION}/migration.sql`);
  }
  const frozenDropSqlIssues = inspectFrozenRoomDropSql(readFileSync(frozenDropSqlPath, "utf8"));
  if (frozenDropSqlIssues.length > 0) {
    fail(`Donmuş oda DROP SQL mühürü eksik: ${frozenDropSqlIssues.join("; ")}`);
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

  console.log(
    "ops:migrate — Prisma şema (D2 halkası, defter immutability, sertifika iptal, P3 donmuş DROP), sonra on SQL.",
  );
  console.log(`   Prisma halka: ${PRISMA_RING_MIGRATIONS.join(" → ")}`);
  console.log(`   Defter mührü: ${LEDGER_IMMUTABILITY_MIGRATION}`);
  console.log(`   İptal mührü: ${CERTIFICATE_REVOCATION_MIGRATION}`);
  console.log(`   Donmuş DROP: ${FROZEN_ROOM_DROP_MIGRATION}`);
  runPrismaDeploy(url);

  const client = new Client({ connectionString: normalizeRuntimeDatabaseUrl(url) });
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
    await applyAcademyCatalogPriceMap(query);
    await runPostApplySeals(query);
    console.log(
      `   akademi tohumu OK — ${ACADEMY_SEED_COURSE_IDS.length} yayında kurs, katalog + sınav bağlı.`,
    );
    console.log(
      `   akademi fiyat haritası OK — ${ACADEMY_SEED_COURSE_IDS.length} PriceCatalogEntry amountMinor catalog-pricing.ts ile hizalı.`,
    );
    console.log("   auth sync OK — handle_new_user AFTER INSERT + handle_user_email_update AFTER UPDATE.");
    console.log("   FORCE RLS OK — çekirdek tablolar relforcerowsecurity + SELECT politikası.");
    console.log("   Donmuş 23 tablo DROP OK.");
    console.log("   http_idempotency_records OK — unique user_id+route+key.");
    console.log("   D2.1 academy_lesson_completions OK.");
    console.log("   D2.2 curriculum_seal + certificate_hash OK.");
    console.log("   D2.3 corporate_job_offers tarihsel migrasyon durur; tablo DROP.");
    console.log(
      "   defter immutability OK — append-only trigger, CHECK tanımları, iki RESTRICT FK.",
    );
    console.log(
      "   paid_command_reservations OK — unique (user_id, scope, command_key) + estimated_minor CHECK.",
    );
    console.log(
      `   freelancer tohumu OK — ${FREELANCER_SEED_JOB_IDS.length} OPEN ilan, katalog taban + hold bağlı.`,
    );
    console.log("   sertifika iptal OK — academy_certificates.revoked_at + revoke_reason.");
  } finally {
    await client.end();
  }

  console.log(
    "ops:migrate OK — Prisma şema + Auth sync + e-posta senkronu + FORCE RLS + donmuş 23 tablo DROP + http_idempotency_records + defter immutability + paid_command_reservations + katalog tohumu + akademi kurs tohumu + freelancer ilan tohumu.",
  );
  console.log(
    "Sonraki: /register ile ilk kullanıcıyı aç, UUID'yi SUPER_ADMIN_USER_ID yaz (.system_docs/OPS_RUNBOOK.md).",
  );
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});

/**
 * Ops migrate — kilitli sıra, havuz yasağı, SQL mühür planı, uygulama sonrası okuyucu.
 * Yeni tablo icat etmez. CLI: scripts/ops-migrate.ts
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ACADEMY_CATALOG_SEEDS,
  ACADEMY_SEED_CATALOG_UNITS,
  ACADEMY_SEED_COURSE_IDS,
} from "@/lib/academy/catalog-seed";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/kernel/storage/byte-ceilings";

/** Akademi tohum kimlikleri lib/academy/catalog-seed.ts (20 büyüme SKU). Eski ac_rail_temel HARD RESET. */
export { ACADEMY_SEED_CATALOG_UNITS, ACADEMY_SEED_COURSE_IDS };

export const EXPECTED_SQL = [
  "20260814010000_handle_new_user_auth_sync.sql",
  "20260814020000_enforce_rls_all_tables.sql",
  "20260814030000_rls_user_scoped_policies.sql",
  "20260814040000_price_catalog_definitions.sql",
  "20260814090000_academy_course_seed.sql",
  "20260814100000_handle_user_email_update.sql",
  "20260814110000_freelancer_job_seed.sql",
  "20260823220000_freelancer_job_visa_pathway.sql",
] as const;

export const FREELANCER_SEED_JOB_IDS = [
  "fj_rail_icon_set",
  "fj_rail_ql_banners",
  "fj_rail_academy_copy",
  "fj_rail_devlabs_prompts",
  "fj_rail_seal_social",
] as const;
export const FREELANCER_SEED_CLIENT_ID = PLATFORM_TREASURY_USER_ID;

export const FORCE_RLS_CORE_TABLES = RLS_FORCE_TABLES;

/**
 * Prisma migrate deploy — D2.1 ders sicili, D2.2 mühür kolonları, D2.3 tarihsel kurumsal teklif (P3 DROP).
 * Yedi SQL'e ek dosya yazılmaz. Sıra klasör zaman damgasıdır; havuz :6543 ile geçilmez.
 */
export const PRISMA_RING_MIGRATIONS = [
  "20260816020000_academy_lesson_completions",
  "20260816030000_d2_2_curriculum_seal_certificate_hash",
  "20260816040000_d2_3_corporate_job_offers",
] as const;

export const ACADEMY_LESSON_COMPLETIONS_TABLE = "academy_lesson_completions";
export const ACADEMY_CERTIFICATES_TABLE = "academy_certificates";
export const ACADEMY_EXAM_SITTINGS_TABLE = "academy_exam_sittings";
export const ACADEMY_EXAM_SITTINGS_MIGRATION = "20260829100000_academy_exam_sittings";
export const ACADEMY_AUDIO_MEDIA_RELEASE_SEAL_MIGRATION =
  "20260830180000_academy_audio_media_release_seal";
export const USER_BILLING_INFO_TABLE = "user_billing_info";
export const USER_BILLING_INFO_MIGRATION = "20260831140000_user_billing_info";
export const USER_BILLING_PHONE_COLUMN = "phone";
export const USER_BILLING_PHONE_MIGRATION = "20260831190000_user_billing_phone";
export const CURRICULUM_SEAL_COLUMN = "curriculum_seal";
export const CAREER_VISA_STAMPS_TABLE = "career_visa_stamps";
export const CERTIFICATE_HASH_COLUMN = "certificate_hash";
export const CORPORATE_JOB_OFFERS_TABLE = "corporate_job_offers";

/** Prisma migrate deploy — Studio TEXT tavanı (CHECK). Yedi SQL'e ek dosya yazılmaz. */
export const STUDIO_DATA_BASE64_CHECK_NAME = "studio_digital_assets_data_base64_max_chars";
export const STUDIO_DATA_BASE64_TABLE = "studio_digital_assets";
export const HTTP_IDEMPOTENCY_TABLE = "http_idempotency_records";
export const HTTP_IDEMPOTENCY_UNIQUE_INDEX = "http_idempotency_records_user_id_route_key_key";
export const LEDGER_ENTRIES_TABLE = "ledger_entries";
export const LEDGER_APPEND_ONLY_TRIGGER = "ledger_entries_append_only";
export const LEDGER_FORBID_FUNCTION = "yetkin_forbid_ledger_mutation";
export const LEDGER_AMOUNT_CHECK = "ledger_entries_amount_minor_positive";
export const WALLET_AMOUNT_CHECK = "wallets_amount_minor_non_negative";
export const LEDGER_WALLET_RESTRICT_FK = "ledger_entries_wallet_user_currency_fkey";
export const LEDGER_USER_RESTRICT_FK = "ledger_entries_user_id_fkey";
export const WALLET_COMPOSITE_UNIQUE = "wallets_id_user_id_currency_code_key";
export const PAID_COMMAND_TABLE = "paid_command_reservations";
export const PAID_COMMAND_UNIQUE_INDEX = "paid_command_reservations_user_id_scope_command_key_key";
export const PAID_COMMAND_AMOUNT_CHECK = "paid_command_reservations_estimated_minor_non_negative";
export const LEDGER_IMMUTABILITY_MIGRATION = "20260819030000_ledger_immutability_paid_commands";
export const ESCROW_HOLD_CHECKS_MIGRATION = "20260819040000_escrow_hold_checks";
export const CERTIFICATE_REVOCATION_MIGRATION = "20260820010000_certificate_revocation";
export const FROZEN_ROOM_DROP_MIGRATION = "20260822010000_drop_frozen_room_tables";

/** P3 DROP — 23 donmuş oda tablosu. Post-apply bu isimler information_schema’da yok. */
export const FROZEN_ROOM_TABLES = [
  "proof_feed_interactions",
  "proof_feed_items",
  "junior_allowances",
  "junior_guardian_invites",
  "junior_profiles",
  "marketplace_dopings",
  "marketplace_offers",
  "marketplace_orders",
  "marketplace_products",
  "arena_awards",
  "arena_submissions",
  "arena_tenders",
  "grant_applications",
  "grant_programs",
  "corporate_job_offers",
  "corporate_job_postings",
  "corporate_companies",
  "studio_digital_assets",
  "studio_generations",
  "studio_drafts",
  "devlabs_artifacts",
  "devlabs_api_keys",
  "devlabs_projects",
] as const;

/**
 * Hosted / lab Prisma zinciri — disk klasör adları kilitli 31. Yeni klasör sessiz eklenmez.
 * `ops:hosted-apply-preflight` ve `ops:migrate` aynı listeyi okur.
 */
export const EXPECTED_PRISMA_MIGRATIONS = [
  "20260814050000_faz5_init",
  "20260814060000_faz6_init",
  "20260814070000_faz7_init",
  "20260814080000_faz8_freelancer_depth",
  "20260814120000_faz9_studio_academy_devlabs_depth",
  "20260814140000_faz10_yetkinilan_pazaryeri",
  "20260815160000_studio_data_base64_max_chars",
  "20260815180000_http_idempotency_records",
  "20260815221500_studio_generation_image_catalog",
  "20260816010000_studio_digital_asset_object_store",
  "20260816020000_academy_lesson_completions",
  "20260816030000_d2_2_curriculum_seal_certificate_hash",
  "20260816040000_d2_3_corporate_job_offers",
  "20260817010000_devlabs_generation_code_catalog",
  "20260819010000_payment_anomalies",
  "20260819020000_junior_guardian_invites",
  "20260819030000_ledger_immutability_paid_commands",
  "20260819040000_escrow_hold_checks",
  "20260820010000_certificate_revocation",
  "20260822010000_drop_frozen_room_tables",
  "20260822020000_academy_lesson_proof_hash",
  "20260823010000_academy_trend_score",
  "20260823220000_freelancer_job_visa_pathway",
  "20260824030000_freelancer_direct_job_offer",
  "20260824040000_price_catalog_decision_ledger",
  "20260824120000_escrow_hold_psp_decouple",
  "20260826100000_academy_audio_cache",
  "20260829100000_academy_exam_sittings",
  "20260830180000_academy_audio_media_release_seal",
  "20260831140000_user_billing_info",
  "20260831190000_user_billing_phone",
] as const;

export const LAB_RESTORE_DATABASE = "yetkin_rail_lab_restore";
export const ESCROW_HOLDS_TABLE = "escrow_holds";
export const ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK = "escrow_holds_amounts_positive";
export const ESCROW_HOLD_GROSS_SPLIT_CHECK = "escrow_holds_gross_equals_hold_plus_net";
export const ESCROW_HOLD_BPS_RANGE_CHECK = "escrow_holds_hold_bps_range";
export const CERTIFICATE_REVOKED_AT_COLUMN = "revoked_at";
export const CERTIFICATE_REVOKE_REASON_COLUMN = "revoke_reason";

/** Lab Postgres — hosted Auth şeması değildir. Yalnız loopback. */
export const LAB_POSTGRES_DATABASE = "yetkin_rail_lab";
export const LAB_POSTGRES_DEFAULT_URL =
  `postgresql://postgres:postgres@127.0.0.1:5432/${LAB_POSTGRES_DATABASE}?sslmode=disable`;
export const LAB_PUBLIC_SCHEMA_RESET_STATEMENTS = [
  "DROP SCHEMA IF EXISTS public CASCADE",
  "CREATE SCHEMA public",
  "GRANT ALL ON SCHEMA public TO postgres",
  "GRANT ALL ON SCHEMA public TO public",
] as const;
export const LAB_AUTH_SCHEMA_STUB_STATEMENTS = [
  "CREATE EXTENSION IF NOT EXISTS pgcrypto",
  `DO $$
BEGIN
  -- GRANT/POLICY hedefleri (JS anahtarı değil). Hosted Auth değildir.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$`,
  "CREATE SCHEMA IF NOT EXISTS auth",
  `CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`,
] as const;
export const LAB_AUTH_SCHEMA_STUB_SQL = LAB_AUTH_SCHEMA_STUB_STATEMENTS.join(";\n") + ";";

export const DIRECT_POSTGRES_PORT = 5432;
export const FORBIDDEN_POOLER_PORT = 6543;
export const SUPABASE_DIRECT_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;

/** Operatör sıfır-hata metni — `.system_docs/OPS_RUNBOOK.md` §2.1 ile birebir kilit. */
export const DIRECT_PORT_OPERATOR_PROTOCOL = [
  "Direct Port protokolü fail-closed: db.<ref>.supabase.co:5432.",
  "Havuz pooler.supabase.com ve port 6543 migrasyonda geçilmez (P1001 yeşil boyanmaz).",
  "Direct host çoğu projede yalnız AAAA (IPv6) yayınlar.",
  "Operatör makinesinde IPv6 varsayılan rota yoksa getaddrinfo ENOENT / P1001 durur.",
  "Yol A: Supabase IPv4 add-on (Direct host A kaydı).",
  "Yol B: makinede IPv6 bağını ve ::/0 rotasını aç; Test-NetConnection db.<ref>.supabase.co -Port 5432.",
  "Yol C yasak: DIRECT_URL = *.pooler.supabase.com:6543. Runtime DATABASE_URL Vercel'de transaction pooler :6543 kullanır.",
].join(" ");

export type DirectConnectionShape = {
  hostname: string;
  port: number;
  isForbiddenPooler: boolean;
  isSupabaseDirectHost: boolean;
  isLoopback: boolean;
  isDirectPort: boolean;
  ok: boolean;
};

function isLoopbackHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/**
 * pg 8.22 `sslmode=require`'ı `verify-full` sayar. Supabase Direct özel Root 2021 CA
 * kullanır; Prisma CLI (libpq) `require` = şifrele, CA doğrulama. Bu parametre
 * Node `pg` istemcisini aynı libpq semantiğine çeker. Host/port/şifre değişmez.
 */
export { withPgLibpqSslCompat } from "@/lib/kernel/postgres-url";

export function parseDirectConnectionUrl(url: string): DirectConnectionShape | null {
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
    const isForbiddenPooler = isForbiddenPoolerUrl(url);
    const isSupabaseDirectHost = SUPABASE_DIRECT_HOST_RE.test(hostname);
    const isLoopback = isLoopbackHostname(hostname);
    const isDirectPort = port === DIRECT_POSTGRES_PORT;
    const ok =
      !isForbiddenPooler && isDirectPort && (isSupabaseDirectHost || isLoopback);
    return {
      hostname,
      port,
      isForbiddenPooler,
      isSupabaseDirectHost,
      isLoopback,
      isDirectPort,
      ok,
    };
  } catch {
    return null;
  }
}

export function isForbiddenPoolerUrl(url: string): boolean {
  const trimmed = url.trim();
  if (/pooler\.supabase\.com/i.test(trimmed)) {
    return true;
  }
  if (/:6543(?:[/?#]|$)/.test(trimmed)) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.port === "6543") {
      return true;
    }
    if (parsed.hostname.includes("pooler.supabase.com")) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function resolveMigratorConnectionUrl(env: {
  DIRECT_URL?: string;
  DATABASE_URL?: string;
}): string | null {
  const direct = env.DIRECT_URL?.trim();
  const database = env.DATABASE_URL?.trim();
  const url = direct || database;
  return url && url.length > 0 ? url : null;
}

/** Disk: D2.1 / D2.2 / D2.3 Prisma klasörleri zaman damgası sırasıyla durur. */
export function assertPrismaRingMigrationsPresent(folders: readonly string[]): string[] {
  const issues: string[] = [];
  let lastIndex = -1;
  for (const name of PRISMA_RING_MIGRATIONS) {
    const index = folders.indexOf(name);
    if (index < 0) {
      issues.push(`Prisma halka migrasyonu yok: ${name}`);
      continue;
    }
    if (index <= lastIndex) {
      issues.push(`Prisma halka sırası bozuldu: ${name}`);
    }
    lastIndex = index;
  }
  return issues;
}

/** Disk: defter immutability Prisma klasörü `migrate deploy` listesinde durur. */
export function assertLedgerImmutabilityMigrationPresent(folders: readonly string[]): string[] {
  if (!folders.includes(LEDGER_IMMUTABILITY_MIGRATION)) {
    return [`Prisma defter mührü yok: ${LEDGER_IMMUTABILITY_MIGRATION}`];
  }
  return [];
}

export function assertEscrowHoldChecksMigrationPresent(folders: readonly string[]): string[] {
  if (!folders.includes(ESCROW_HOLD_CHECKS_MIGRATION)) {
    return [`Prisma emanet CHECK mührü yok: ${ESCROW_HOLD_CHECKS_MIGRATION}`];
  }
  return [];
}

export function assertCertificateRevocationMigrationPresent(folders: readonly string[]): string[] {
  if (!folders.includes(CERTIFICATE_REVOCATION_MIGRATION)) {
    return [`Prisma sertifika iptal mührü yok: ${CERTIFICATE_REVOCATION_MIGRATION}`];
  }
  return [];
}

export function assertFrozenRoomDropMigrationPresent(folders: readonly string[]): string[] {
  if (!folders.includes(FROZEN_ROOM_DROP_MIGRATION)) {
    return [`Prisma donmuş oda DROP mührü yok: ${FROZEN_ROOM_DROP_MIGRATION}`];
  }
  return [];
}

export function inspectFrozenRoomDropSql(sql: string): string[] {
  const issues: string[] = [];
  if (!/DROP TABLE/i.test(sql)) {
    issues.push("P3 DROP TABLE yok");
  }
  for (const table of FROZEN_ROOM_TABLES) {
    if (!sql.includes(`"${table}"`)) {
      issues.push(`P3 DROP ${table} yok`);
    }
  }
  return issues;
}

export function inspectCertificateRevocationSql(sql: string): string[] {
  const issues: string[] = [];
  if (!sql.includes("revoked_at") || !sql.includes('"revoked_at"')) {
    issues.push("academy_certificates.revoked_at yok");
  }
  if (!sql.includes("revoke_reason") || !sql.includes('"revoke_reason"')) {
    issues.push("academy_certificates.revoke_reason yok");
  }
  return issues;
}

export function escrowHoldGrossSplitCheckDefMatches(def: string): boolean {
  return /gross_minor.*=.*hold_minor.*\+.*net_minor/i.test(def);
}

export function escrowHoldAmountsPositiveCheckDefMatches(def: string): boolean {
  return /gross_minor["\s]*>\s*0/i.test(def) && /net_minor["\s]*>\s*0/i.test(def);
}

export function escrowHoldBpsRangeCheckDefMatches(def: string): boolean {
  return /hold_bps["\s]*>=\s*0/i.test(def) && /hold_bps["\s]*<=\s*10000/i.test(def);
}

export function inspectEscrowHoldMigrationSql(sql: string): string[] {
  const issues: string[] = [];
  if (!sql.includes(ESCROW_HOLD_GROSS_SPLIT_CHECK)) {
    issues.push(`${ESCROW_HOLD_GROSS_SPLIT_CHECK} yok`);
  }
  if (!sql.includes(ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK)) {
    issues.push(`${ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK} yok`);
  }
  if (!sql.includes(ESCROW_HOLD_BPS_RANGE_CHECK)) {
    issues.push(`${ESCROW_HOLD_BPS_RANGE_CHECK} yok`);
  }
  if (
    !sql.includes("gross_minor") ||
    (!sql.includes("hold_minor + net_minor") && !sql.includes('"hold_minor" + "net_minor"'))
  ) {
    issues.push("gross = hold + net CHECK tanımı yok");
  }
  return issues;
}

export function ledgerAppendOnlyTriggerDefMatches(def: string): boolean {
  return /BEFORE\s+(UPDATE\s+OR\s+DELETE|DELETE\s+OR\s+UPDATE)/i.test(def);
}

export function walletNonNegativeCheckDefMatches(def: string): boolean {
  return /amount_minor["\s]*>=\s*0/i.test(def);
}

export function ledgerPositiveCheckDefMatches(def: string): boolean {
  return /amount_minor["\s]*>\s*0/i.test(def) && !/amount_minor["\s]*>=\s*0/i.test(def);
}

export function paidCommandNonNegativeCheckDefMatches(def: string): boolean {
  return /estimated_minor["\s]*>=\s*0/i.test(def);
}

export function ledgerForbidFunctionDefMatches(def: string): boolean {
  return def.includes("ledger_entries is append-only");
}

/** Disk SQL: trigger olayları, CHECK tanımları, iki RESTRICT FK, rezerv tablosu. */
export function inspectLedgerMigrationSql(sql: string): string[] {
  const issues: string[] = [];
  if (!sql.includes(WALLET_AMOUNT_CHECK)) {
    issues.push(`CHECK adı yok: ${WALLET_AMOUNT_CHECK}`);
  }
  if (
    !new RegExp(
      `${WALLET_AMOUNT_CHECK}[\\s\\S]{0,120}CHECK\\s*\\(\\s*"amount_minor"\\s*>=\\s*0\\s*\\)`,
    ).test(sql)
  ) {
    issues.push("cüzdan CHECK tanımı amount_minor >= 0 değil");
  }
  if (!sql.includes(LEDGER_AMOUNT_CHECK)) {
    issues.push(`CHECK adı yok: ${LEDGER_AMOUNT_CHECK}`);
  }
  if (
    !new RegExp(
      `${LEDGER_AMOUNT_CHECK}[\\s\\S]{0,120}CHECK\\s*\\(\\s*"amount_minor"\\s*>\\s*0\\s*\\)`,
    ).test(sql)
  ) {
    issues.push("defter CHECK tanımı amount_minor > 0 değil");
  }
  if (!sql.includes("BEFORE UPDATE OR DELETE ON ledger_entries")) {
    issues.push("append-only trigger olayları yok");
  }
  if (!sql.includes("ledger_entries is append-only")) {
    issues.push("append-only istisna metni yok");
  }
  if (!sql.includes(LEDGER_FORBID_FUNCTION)) {
    issues.push(`forbid fonksiyonu yok: ${LEDGER_FORBID_FUNCTION}`);
  }
  if (!sql.includes(LEDGER_APPEND_ONLY_TRIGGER)) {
    issues.push(`trigger adı yok: ${LEDGER_APPEND_ONLY_TRIGGER}`);
  }
  if (!sql.includes(LEDGER_WALLET_RESTRICT_FK)) {
    issues.push(`composite wallet FK yok: ${LEDGER_WALLET_RESTRICT_FK}`);
  }
  if (!sql.includes(LEDGER_USER_RESTRICT_FK)) {
    issues.push(`user FK yok: ${LEDGER_USER_RESTRICT_FK}`);
  }
  if ((sql.match(/ON DELETE RESTRICT/g) ?? []).length < 2) {
    issues.push("ON DELETE RESTRICT en az iki defter FK değil");
  }
  if (!sql.includes(WALLET_COMPOSITE_UNIQUE)) {
    issues.push(`cüzdan composite unique yok: ${WALLET_COMPOSITE_UNIQUE}`);
  }
  if (!sql.includes(PAID_COMMAND_TABLE)) {
    issues.push(`rezerv tablosu yok: ${PAID_COMMAND_TABLE}`);
  }
  if (!sql.includes(PAID_COMMAND_AMOUNT_CHECK)) {
    issues.push(`rezerv CHECK yok: ${PAID_COMMAND_AMOUNT_CHECK}`);
  }
  if (!sql.includes(PAID_COMMAND_UNIQUE_INDEX)) {
    issues.push(`rezerv unique indeks yok: ${PAID_COMMAND_UNIQUE_INDEX}`);
  }
  return issues;
}

export type SqlSealPlan = {
  handleNewUser: boolean;
  onAuthUserCreated: boolean;
  forceRls: boolean;
  ownerSelectPolicy: boolean;
  unscopedDenyPolicy: boolean;
  academyCourseIds: string[];
  academyCatalogUnits: boolean;
  handleUserEmailUpdate: boolean;
  onAuthUserEmailUpdated: boolean;
  freelancerJobIds: string[];
  freelancerCatalogUnits: boolean;
  treasuryUser: boolean;
  postgrestWritePolicy: boolean;
  catalogOperatorPricePreserve: boolean;
};

/** Super Admin PATCH tutarı yeniden ops:migrate ile kör EXCLUDED yazılmaz. */
export function catalogSqlPreservesOperatorPrice(sql: string): boolean {
  if (!/ON CONFLICT \(module_key, unit_key\) DO UPDATE/.test(sql)) {
    return false;
  }
  if (!/amount_minor = CASE/.test(sql)) {
    return false;
  }
  if (!/price_catalog_entries\.updated_by IS NOT NULL/.test(sql)) {
    return false;
  }
  if (!/THEN price_catalog_entries\.amount_minor/.test(sql)) {
    return false;
  }
  if (!/updated_by = price_catalog_entries\.updated_by/.test(sql)) {
    return false;
  }
  if (/^\s*amount_minor\s*=\s*EXCLUDED\.amount_minor\s*,?\s*$/m.test(sql)) {
    return false;
  }
  return true;
}

export function inspectSqlSealPlan(sqlByFile: Record<string, string>): SqlSealPlan {
  const academy = sqlByFile["20260814090000_academy_course_seed.sql"] ?? "";
  const freelancer = sqlByFile["20260814110000_freelancer_job_seed.sql"] ?? "";
  const catalog = sqlByFile["20260814040000_price_catalog_definitions.sql"] ?? "";
  const authSync = sqlByFile["20260814010000_handle_new_user_auth_sync.sql"] ?? "";
  const email = sqlByFile["20260814100000_handle_user_email_update.sql"] ?? "";
  const rls = sqlByFile["20260814020000_enforce_rls_all_tables.sql"] ?? "";
  const policies = sqlByFile["20260814030000_rls_user_scoped_policies.sql"] ?? "";

  return {
    handleNewUser: /FUNCTION public\.handle_new_user\(\)/.test(authSync),
    onAuthUserCreated: /CREATE TRIGGER on_auth_user_created/.test(authSync),
    forceRls: /FORCE ROW LEVEL SECURITY/.test(rls),
    ownerSelectPolicy: /FOR SELECT TO authenticated/.test(policies),
    unscopedDenyPolicy:
      /FUNCTION public\.yetkin_apply_rls_unscoped_deny\(/.test(policies) &&
      /rls_deny_unscoped/.test(policies) &&
      /USING \(false\)/.test(policies),
    academyCourseIds: ACADEMY_SEED_COURSE_IDS.filter((id) => academy.includes(id)),
    academyCatalogUnits: ACADEMY_SEED_CATALOG_UNITS.every((unit) => academy.includes(unit)),
    handleUserEmailUpdate: /FUNCTION public\.handle_user_email_update\(\)/.test(email),
    onAuthUserEmailUpdated: /CREATE TRIGGER on_auth_user_email_updated/.test(email),
    freelancerJobIds: FREELANCER_SEED_JOB_IDS.filter((id) => freelancer.includes(id)),
    freelancerCatalogUnits:
      freelancer.includes("job-posting:floor") && freelancer.includes("escrow:hold"),
    treasuryUser: authSync.includes(PLATFORM_TREASURY_USER_ID),
    postgrestWritePolicy:
      /FOR INSERT/.test(policies) || /FOR UPDATE/.test(policies) || /FOR DELETE/.test(policies),
    catalogOperatorPricePreserve:
      catalogSqlPreservesOperatorPrice(catalog) &&
      catalogSqlPreservesOperatorPrice(academy) &&
      catalogSqlPreservesOperatorPrice(freelancer),
  };
}

export function assertSqlSealPlanComplete(plan: SqlSealPlan): string[] {
  const issues: string[] = [];
  if (!plan.handleNewUser) issues.push("handle_new_user yok");
  if (!plan.onAuthUserCreated) issues.push("on_auth_user_created yok");
  if (!plan.forceRls) issues.push("FORCE RLS yok");
  if (!plan.ownerSelectPolicy) issues.push("owner SELECT politikası yok");
  if (!plan.unscopedDenyPolicy) issues.push("kapsamsız tablo deny SELECT yok");
  if (plan.academyCourseIds.length !== ACADEMY_SEED_COURSE_IDS.length) {
    issues.push("akademi kurs tohumu eksik");
  }
  if (!plan.academyCatalogUnits) issues.push("akademi katalog birimi eksik");
  if (!plan.handleUserEmailUpdate) issues.push("handle_user_email_update yok");
  if (!plan.onAuthUserEmailUpdated) issues.push("on_auth_user_email_updated yok");
  if (plan.freelancerJobIds.length !== FREELANCER_SEED_JOB_IDS.length) {
    issues.push("freelancer ilan tohumu eksik");
  }
  if (!plan.freelancerCatalogUnits) issues.push("freelancer katalog birimi eksik");
  if (!plan.treasuryUser) issues.push("hazine sentinel tohumu yok");
  if (plan.postgrestWritePolicy) issues.push("PostgREST yazma politikası yasaktır");
  if (!plan.catalogOperatorPricePreserve) {
    issues.push("katalog tohumu Super Admin amount_minor/updated_by korumuyor");
  }
  return issues;
}

export type OpsSealQuery = (
  text: string,
  params?: unknown[],
) => Promise<{ rows: Array<Record<string, unknown>> }>;

export async function assertPublicUsers(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'
     ) AS exists`,
  );
  if (!rows[0]?.exists) {
    throw new Error("public.users yok. prisma migrate deploy tabloları yaratmamış.");
  }
}

export async function assertAuthUsers(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'auth' AND table_name = 'users'
     ) AS exists`,
  );
  if (!rows[0]?.exists) {
    throw new Error(
      "auth.users yok. Bu SQL yalnız Supabase Auth şemasında çalışır (hosted proje veya supabase start). Ham Postgres yetmez.",
    );
  }
}

export async function assertNewUserTrigger(query: OpsSealQuery): Promise<void> {
  const fn = await query(
    `SELECT count(*)::int AS n
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = 'handle_new_user'
       AND p.prosecdef = true`,
  );
  if (Number(fn.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      "handle_new_user SECURITY DEFINER fonksiyonu yok. 20260814010000_handle_new_user_auth_sync.sql",
    );
  }
  const trg = await query(
    `SELECT count(*)::int AS n
     FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'auth'
       AND c.relname = 'users'
       AND NOT t.tgisinternal
       AND t.tgname = 'on_auth_user_created'`,
  );
  if (Number(trg.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      "on_auth_user_created tetikleyicisi yok. 20260814010000_handle_new_user_auth_sync.sql",
    );
  }
}

export async function assertForceRls(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT c.relname AS name
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relkind = 'r'
       AND c.relname = ANY($1::text[])
       AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)`,
    [[...FORCE_RLS_CORE_TABLES]],
  );
  if (rows.length > 0) {
    const names = rows.map((row) => String(row.name)).join(", ");
    throw new Error(`FORCE RLS eksik: ${names}. 20260814020000_enforce_rls_all_tables.sql`);
  }
}

export async function assertPublicRlsPolicies(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT c.relname AS name
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relkind = 'r'
       AND c.relname = ANY($1::text[])
       AND NOT EXISTS (
         SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid
       )`,
    [[...FORCE_RLS_CORE_TABLES]],
  );
  if (rows.length > 0) {
    const names = rows.map((row) => String(row.name)).join(", ");
    throw new Error(
      `RLS politikası eksik (Supabase RLS Enabled No Policy): ${names}. 20260814030000_rls_user_scoped_policies.sql`,
    );
  }
}

export async function assertAcademySeed(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT id FROM public.academy_courses
     WHERE id = ANY($1::text[]) AND is_published = true`,
    [[...ACADEMY_SEED_COURSE_IDS]],
  );
  const found = new Set(rows.map((row) => String(row.id)));
  for (const id of ACADEMY_SEED_COURSE_IDS) {
    if (!found.has(id)) {
      throw new Error(`Akademi kurs tohumu eksik: ${id}. 20260814090000_academy_course_seed.sql`);
    }
  }
  const catalog = await query(
    `SELECT count(*)::int AS n FROM public.price_catalog_entries
     WHERE module_key = 'academy' AND is_active = true
       AND unit_key = ANY($1::text[])`,
    [[...ACADEMY_SEED_CATALOG_UNITS]],
  );
  if (Number(catalog.rows[0]?.n ?? 0) < ACADEMY_SEED_COURSE_IDS.length) {
    throw new Error("Akademi kurs katalog birimi eksik. PriceCatalogEntry tohumu uygulanmamış.");
  }
  const exams = await query(
    `SELECT count(*)::int AS n FROM public.academy_exams
     WHERE course_id = ANY($1::text[])`,
    [[...ACADEMY_SEED_COURSE_IDS]],
  );
  if (Number(exams.rows[0]?.n ?? 0) < ACADEMY_SEED_COURSE_IDS.length) {
    throw new Error("Akademi müfredat sınavı tohumu eksik.");
  }
}

/** SQL yorum mührü — bellek katalog bu metni tanır. */
export const ACADEMY_CATALOG_PRICE_MAP_APPLY = "academy-catalog-price-map-apply";
export const ACADEMY_CATALOG_PRICE_MAP_SEAL = "academy-catalog-price-map-seal";

/**
 * 20 SKU vitrin tutarı — `lib/academy/catalog-pricing.ts` → PriceCatalogEntry.
 * SQL ON CONFLICT Super Admin `updated_by` satırını korur; bu adım haritayı yazar.
 * Akademi course:* birimleri SSOT tohumdur; freelancer/studio satırına dokunmaz.
 */
export async function applyAcademyCatalogPriceMap(query: OpsSealQuery): Promise<void> {
  for (const row of ACADEMY_CATALOG_SEEDS) {
    await query(
      `/* ${ACADEMY_CATALOG_PRICE_MAP_APPLY} */
       UPDATE public.price_catalog_entries
       SET
         amount_minor = $1,
         min_minor = $2,
         max_minor = $3,
         is_active = true,
         updated_at = now()
       WHERE module_key = 'academy'
         AND unit_key = $4`,
      [row.seedAmountMinor, row.seedMinMinor, row.seedMaxMinor, row.catalogUnitKey],
    );
  }
}

export async function assertAcademyCatalogPriceMap(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `/* ${ACADEMY_CATALOG_PRICE_MAP_SEAL} */
     SELECT unit_key, amount_minor, min_minor, max_minor, is_active
     FROM public.price_catalog_entries
     WHERE module_key = 'academy'
       AND unit_key = ANY($1::text[])`,
    [[...ACADEMY_SEED_CATALOG_UNITS]],
  );
  const byUnit = new Map(
    rows.map((row) => [String(row.unit_key), row] as const),
  );
  for (const seed of ACADEMY_CATALOG_SEEDS) {
    const live = byUnit.get(seed.catalogUnitKey);
    if (!live) {
      throw new Error(
        `Akademi katalog fiyatı eksik: ${seed.catalogUnitKey}. PriceCatalogEntry tohumu uygulanmamış.`,
      );
    }
    if (Number(live.amount_minor) !== seed.seedAmountMinor) {
      throw new Error(
        `Akademi katalog fiyatı tohumla uyumsuz: ${seed.catalogUnitKey} ${String(live.amount_minor)} ≠ ${seed.seedAmountMinor}`,
      );
    }
    if (Number(live.min_minor) !== seed.seedMinMinor) {
      throw new Error(
        `Akademi katalog minMinor tohumla uyumsuz: ${seed.catalogUnitKey}`,
      );
    }
    if (Number(live.max_minor) !== seed.seedMaxMinor) {
      throw new Error(
        `Akademi katalog maxMinor tohumla uyumsuz: ${seed.catalogUnitKey}`,
      );
    }
    if (live.is_active !== true && Number(live.is_active) !== 1) {
      throw new Error(`Akademi katalog satırı pasif: ${seed.catalogUnitKey}`);
    }
  }
}

export async function assertEmailUpdateTrigger(query: OpsSealQuery): Promise<void> {
  const fn = await query(
    `SELECT count(*)::int AS n
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = 'handle_user_email_update'
       AND p.prosecdef = true`,
  );
  if (Number(fn.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      "handle_user_email_update SECURITY DEFINER fonksiyonu yok. 20260814100000_handle_user_email_update.sql",
    );
  }

  const trg = await query(
    `SELECT count(*)::int AS n
     FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'auth'
       AND c.relname = 'users'
       AND NOT t.tgisinternal
       AND t.tgname = 'on_auth_user_email_updated'`,
  );
  if (Number(trg.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      "on_auth_user_email_updated tetikleyicisi yok. 20260814100000_handle_user_email_update.sql",
    );
  }
}

export async function assertFreelancerSeed(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT id FROM public.freelancer_jobs
     WHERE id = ANY($1::text[])
       AND status = 'OPEN'
       AND client_id = $2`,
    [[...FREELANCER_SEED_JOB_IDS], FREELANCER_SEED_CLIENT_ID],
  );
  const found = new Set(rows.map((row) => String(row.id)));
  for (const id of FREELANCER_SEED_JOB_IDS) {
    if (!found.has(id)) {
      throw new Error(`Freelancer ilan tohumu eksik: ${id}. 20260814110000_freelancer_job_seed.sql`);
    }
  }
  const catalog = await query(
    `SELECT count(*)::int AS n FROM public.price_catalog_entries
     WHERE module_key = 'freelancer' AND is_active = true
       AND unit_key IN ('job-posting:floor', 'escrow:hold')`,
  );
  if (Number(catalog.rows[0]?.n ?? 0) < 2) {
    throw new Error("Freelancer bütçe/emanet katalog birimi eksik. PriceCatalogEntry tohumu uygulanmamış.");
  }
}

export async function assertTreasurySentinel(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT count(*)::int AS n FROM public.users WHERE id = $1`,
    [PLATFORM_TREASURY_USER_ID],
  );
  if (Number(rows[0]?.n ?? 0) < 1) {
    throw new Error(
      "Hazine sentinel kullanıcısı yok. 20260814010000_handle_new_user_auth_sync.sql",
    );
  }
}

function studioDataBase64CheckDefMatches(def: string): boolean {
  const ceiling = String(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS);
  return new RegExp(
    String.raw`char_length\(\s*"?data_base64"?\s*\)\s*<=\s*${ceiling}`,
    "i",
  ).test(def);
}

/** P3: 23 donmuş tablo information_schema’da yok. */
export async function assertFrozenRoomTablesDropped(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `-- p3-frozen-room-drop-seal
     SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [FROZEN_ROOM_TABLES],
  );
  if (rows.length > 0) {
    const leftover = rows.map((row) => String(row.table_name ?? "")).filter(Boolean).join(", ");
    throw new Error(
      `Donmuş oda tabloları duruyor: ${leftover}. prisma migrate deploy ${FROZEN_ROOM_DROP_MIGRATION}`,
    );
  }
}

/** Grep mührü — P3’te Studio CHECK yerine DROP. */
export async function assertStudioDataBase64Check(query: OpsSealQuery): Promise<void> {
  await assertFrozenRoomTablesDropped(query);
}

/** Prisma deploy sonrası: D2.1 academy_lesson_completions. */
export async function assertAcademyLessonCompletions(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${ACADEMY_LESSON_COMPLETIONS_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${ACADEMY_LESSON_COMPLETIONS_TABLE} yok. prisma migrate deploy ${PRISMA_RING_MIGRATIONS[0]}`,
    );
  }
}

/** Prisma deploy sonrası: sınav oturumu mühür sicili (Sitting Seal). */
export async function assertAcademyExamSittings(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${ACADEMY_EXAM_SITTINGS_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${ACADEMY_EXAM_SITTINGS_TABLE} yok. prisma migrate deploy ${ACADEMY_EXAM_SITTINGS_MIGRATION}`,
    );
  }
}

/** Prisma deploy sonrası: fatura künyesi + PayTR user_phone kolonu. Checkout tıkamaz. */
export async function assertUserBillingPhone(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${USER_BILLING_INFO_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${USER_BILLING_INFO_TABLE} yok. prisma migrate deploy ${USER_BILLING_INFO_MIGRATION}`,
    );
  }
  const phone = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = '${USER_BILLING_INFO_TABLE}'
         AND column_name = '${USER_BILLING_PHONE_COLUMN}'
     ) AS exists`,
  );
  if (!phone.rows[0]?.exists) {
    throw new Error(
      `${USER_BILLING_INFO_TABLE}.${USER_BILLING_PHONE_COLUMN} yok. prisma migrate deploy ${USER_BILLING_PHONE_MIGRATION}`,
    );
  }
}

/** Prisma deploy sonrası: D2.2 curriculum_seal + certificate_hash kolonları. */
export async function assertCurriculumSealColumns(query: OpsSealQuery): Promise<void> {
  const seal = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = '${ACADEMY_CERTIFICATES_TABLE}'
         AND column_name = '${CURRICULUM_SEAL_COLUMN}'
     ) AS exists`,
  );
  if (!seal.rows[0]?.exists) {
    throw new Error(
      `${ACADEMY_CERTIFICATES_TABLE}.${CURRICULUM_SEAL_COLUMN} yok. prisma migrate deploy ${PRISMA_RING_MIGRATIONS[1]}`,
    );
  }
  const hash = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = '${CAREER_VISA_STAMPS_TABLE}'
         AND column_name = '${CERTIFICATE_HASH_COLUMN}'
     ) AS exists`,
  );
  if (!hash.rows[0]?.exists) {
    throw new Error(
      `${CAREER_VISA_STAMPS_TABLE}.${CERTIFICATE_HASH_COLUMN} yok. prisma migrate deploy ${PRISMA_RING_MIGRATIONS[1]}`,
    );
  }
}

/** Prisma deploy sonrası: credential v2 iptal kolonları. */
export async function assertCertificateRevocationColumns(query: OpsSealQuery): Promise<void> {
  const revoked = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = '${ACADEMY_CERTIFICATES_TABLE}'
         AND column_name = '${CERTIFICATE_REVOKED_AT_COLUMN}'
     ) AS exists`,
  );
  if (!revoked.rows[0]?.exists) {
    throw new Error(
      `${ACADEMY_CERTIFICATES_TABLE}.${CERTIFICATE_REVOKED_AT_COLUMN} yok. prisma migrate deploy ${CERTIFICATE_REVOCATION_MIGRATION}`,
    );
  }
  const reason = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = '${ACADEMY_CERTIFICATES_TABLE}'
         AND column_name = '${CERTIFICATE_REVOKE_REASON_COLUMN}'
     ) AS exists`,
  );
  if (!reason.rows[0]?.exists) {
    throw new Error(
      `${ACADEMY_CERTIFICATES_TABLE}.${CERTIFICATE_REVOKE_REASON_COLUMN} yok. prisma migrate deploy ${CERTIFICATE_REVOCATION_MIGRATION}`,
    );
  }
}

export function labDatabaseName(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const name = decodeURIComponent(parsed.pathname.replace(/^\//, "")).split("/")[0];
    return name && name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

export function isLabLoopbackUrl(url: string): boolean {
  const shape = parseDirectConnectionUrl(url);
  return Boolean(
    shape &&
      shape.ok &&
      shape.isLoopback &&
      !shape.isForbiddenPooler &&
      labDatabaseName(url) === LAB_POSTGRES_DATABASE,
  );
}

export function isHostedSupabaseDirectUrl(url: string): boolean {
  const shape = parseDirectConnectionUrl(url);
  return Boolean(
    shape &&
      shape.ok &&
      shape.isSupabaseDirectHost &&
      !shape.isLoopback &&
      !shape.isForbiddenPooler &&
      labDatabaseName(url) !== LAB_POSTGRES_DATABASE,
  );
}

export function assertHostedApplyTargetUrl(url: string): DirectConnectionShape {
  if (isForbiddenPoolerUrl(url)) {
    throw new Error(`Hosted apply işlem havuzu üzerinden çalışmaz. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  if (isLabLoopbackUrl(url)) {
    throw new Error(
      "Hosted apply lab loopback (yetkin_rail_lab) kabul etmez. Lab için npm run ops:lab-postgres.",
    );
  }
  const shape = parseDirectConnectionUrl(url);
  if (!shape) {
    throw new Error(`DIRECT_URL çözülemedi. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  if (!shape.ok || !shape.isSupabaseDirectHost || !shape.isDirectPort) {
    throw new Error(
      `Hosted apply yalnız db.<ref>.supabase.co:${DIRECT_POSTGRES_PORT}. host=${shape.hostname} port=${shape.port}. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }
  if (labDatabaseName(url) === LAB_POSTGRES_DATABASE) {
    throw new Error("Hosted apply yetkin_rail_lab adına basılmaz.");
  }
  return shape;
}

export function listPrismaMigrationFolders(migrationsDir: string): string[] {
  if (!existsSync(migrationsDir)) {
    return [];
  }
  return readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{14}_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export function listSqlSealFiles(sqlDir: string): string[] {
  if (!existsSync(sqlDir)) {
    return [];
  }
  return readdirSync(sqlDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

export type HostedApplyDiskPlan = {
  prismaFolders: string[];
  sqlFiles: string[];
  issues: string[];
};

function readMigrationSql(root: string, folder: string): string {
  const path = join(root, "prisma", "migrations", folder, "migration.sql");
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

/**
 * Hosted apply öncesi disk mührü. Lab Auth stub basmaz; yalnız kilitli Prisma + sekiz SQL + tanım iğneleri.
 */
export function inspectHostedApplyDiskPlan(root: string): HostedApplyDiskPlan {
  const issues: string[] = [];
  const prismaDir = join(root, "prisma", "migrations");
  const sqlDir = join(root, "supabase", "migrations");
  const prismaFolders = listPrismaMigrationFolders(prismaDir);
  const sqlFiles = listSqlSealFiles(sqlDir);

  if (!existsSync(prismaDir)) {
    issues.push("prisma/migrations dizini yok.");
  }
  if (!existsSync(sqlDir)) {
    issues.push("supabase/migrations dizini yok.");
  }
  if (prismaFolders.length !== EXPECTED_PRISMA_MIGRATIONS.length) {
    issues.push(
      `Prisma klasör sayısı kilitli ${EXPECTED_PRISMA_MIGRATIONS.length} değil (${prismaFolders.length}).`,
    );
  }
  for (let index = 0; index < EXPECTED_PRISMA_MIGRATIONS.length; index += 1) {
    const expected = EXPECTED_PRISMA_MIGRATIONS[index];
    const actual = prismaFolders[index];
    if (actual !== expected) {
      issues.push(`Prisma sıra ${index + 1}: beklenen ${expected} ≠ ${actual ?? "yok"}`);
    }
  }
  if (sqlFiles.length !== EXPECTED_SQL.length) {
    issues.push(`SQL sayısı kilitli sekiz değil (${sqlFiles.length}): ${sqlFiles.join(", ")}`);
  }
  for (let index = 0; index < EXPECTED_SQL.length; index += 1) {
    if (sqlFiles[index] !== EXPECTED_SQL[index]) {
      issues.push(`SQL sıra: beklenen ${EXPECTED_SQL[index]} ≠ ${sqlFiles[index] ?? "yok"}`);
    }
  }

  issues.push(...assertPrismaRingMigrationsPresent(prismaFolders));
  issues.push(...assertLedgerImmutabilityMigrationPresent(prismaFolders));
  issues.push(...assertEscrowHoldChecksMigrationPresent(prismaFolders));
  issues.push(...assertCertificateRevocationMigrationPresent(prismaFolders));
  issues.push(...assertFrozenRoomDropMigrationPresent(prismaFolders));
  if (!prismaFolders.includes(ACADEMY_EXAM_SITTINGS_MIGRATION)) {
    issues.push(`Prisma sınav oturumu mührü yok: ${ACADEMY_EXAM_SITTINGS_MIGRATION}`);
  }
  if (!prismaFolders.includes(ACADEMY_AUDIO_MEDIA_RELEASE_SEAL_MIGRATION)) {
    issues.push(`Prisma ders sesi mühür kolonu yok: ${ACADEMY_AUDIO_MEDIA_RELEASE_SEAL_MIGRATION}`);
  }
  if (!prismaFolders.includes(USER_BILLING_INFO_MIGRATION)) {
    issues.push(`Prisma fatura künyesi yok: ${USER_BILLING_INFO_MIGRATION}`);
  }
  if (!prismaFolders.includes(USER_BILLING_PHONE_MIGRATION)) {
    issues.push(`Prisma fatura cep kolonu yok: ${USER_BILLING_PHONE_MIGRATION}`);
  }

  const ledgerSql = readMigrationSql(root, LEDGER_IMMUTABILITY_MIGRATION);
  if (!ledgerSql) {
    issues.push(`${LEDGER_IMMUTABILITY_MIGRATION}/migration.sql yok.`);
  } else {
    issues.push(...inspectLedgerMigrationSql(ledgerSql));
  }
  const escrowSql = readMigrationSql(root, ESCROW_HOLD_CHECKS_MIGRATION);
  if (!escrowSql) {
    issues.push(`${ESCROW_HOLD_CHECKS_MIGRATION}/migration.sql yok.`);
  } else {
    issues.push(...inspectEscrowHoldMigrationSql(escrowSql));
  }
  const revocationSql = readMigrationSql(root, CERTIFICATE_REVOCATION_MIGRATION);
  if (!revocationSql) {
    issues.push(`${CERTIFICATE_REVOCATION_MIGRATION}/migration.sql yok.`);
  } else {
    issues.push(...inspectCertificateRevocationSql(revocationSql));
  }
  const frozenDropSql = readMigrationSql(root, FROZEN_ROOM_DROP_MIGRATION);
  if (!frozenDropSql) {
    issues.push(`${FROZEN_ROOM_DROP_MIGRATION}/migration.sql yok.`);
  } else {
    issues.push(...inspectFrozenRoomDropSql(frozenDropSql));
  }

  const sqlByFile: Record<string, string> = {};
  for (const file of EXPECTED_SQL) {
    const path = join(sqlDir, file);
    if (existsSync(path)) {
      sqlByFile[file] = readFileSync(path, "utf8");
    }
  }
  issues.push(...assertSqlSealPlanComplete(inspectSqlSealPlan(sqlByFile)));

  return { prismaFolders, sqlFiles, issues };
}

export function hostedApplyForbidsLabStub(opsMigrateSource: string, labPostgresSource: string): string[] {
  const issues: string[] = [];
  if (opsMigrateSource.includes("ensureLabAuthSchema")) {
    issues.push("ops:migrate lab Auth stub basmamalı (ensureLabAuthSchema).");
  }
  if (opsMigrateSource.includes("resetLabPublicSchema")) {
    issues.push("ops:migrate hosted şemayı DROP etmemeli (resetLabPublicSchema).");
  }
  if (!labPostgresSource.includes("ensureLabAuthSchema")) {
    issues.push("ops:lab-postgres Auth stub'u taşımıyor.");
  }
  if (!labPostgresSource.includes("isLabLoopbackUrl")) {
    issues.push("ops:lab-postgres loopback kilidi yok.");
  }
  return issues;
}

export async function resetLabPublicSchema(query: OpsSealQuery): Promise<void> {
  for (const statement of LAB_PUBLIC_SCHEMA_RESET_STATEMENTS) {
    await query(statement);
  }
}

export async function ensureLabAuthSchema(query: OpsSealQuery): Promise<void> {
  for (const statement of LAB_AUTH_SCHEMA_STUB_STATEMENTS) {
    await query(statement);
  }
}

/** Grep mührü — P3’te D2.3 tablo varlığı yerine DROP. */
export async function assertCorporateJobOffers(query: OpsSealQuery): Promise<void> {
  await assertFrozenRoomTablesDropped(query);
}

/** Prisma deploy sonrası: http_idempotency_records + unique (user_id, route, key). */
export async function assertHttpIdempotencyRecords(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${HTTP_IDEMPOTENCY_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${HTTP_IDEMPOTENCY_TABLE} yok. prisma migrate deploy 20260815180000_http_idempotency_records`,
    );
  }
  const index = await query(
    `SELECT count(*)::int AS n FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = '${HTTP_IDEMPOTENCY_TABLE}'
       AND indexname = '${HTTP_IDEMPOTENCY_UNIQUE_INDEX}'`,
  );
  if (Number(index.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      `${HTTP_IDEMPOTENCY_TABLE} unique (user_id, route, key) yok. 20260815180000_http_idempotency_records`,
    );
  }
}

/** Prisma deploy sonrası: append-only trigger tanımı, CHECK tanımı, iki RESTRICT FK. */
export async function assertLedgerImmutability(query: OpsSealQuery): Promise<void> {
  const trigger = await query(
    `SELECT pg_get_triggerdef(t.oid) AS def, t.tgenabled AS enabled
     FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = '${LEDGER_ENTRIES_TABLE}'
       AND t.tgname = '${LEDGER_APPEND_ONLY_TRIGGER}'
       AND NOT t.tgisinternal`,
  );
  const triggerDef = String(trigger.rows[0]?.def ?? "");
  const triggerEnabled = String(trigger.rows[0]?.enabled ?? "");
  if (!trigger.rows[0] || !ledgerAppendOnlyTriggerDefMatches(triggerDef)) {
    throw new Error(
      `${LEDGER_APPEND_ONLY_TRIGGER} yok veya BEFORE UPDATE OR DELETE değil. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
  if (triggerEnabled !== "O" && triggerEnabled !== "A") {
    throw new Error(
      `${LEDGER_APPEND_ONLY_TRIGGER} devre dışı (tgenabled=${triggerEnabled}). prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }

  const forbidFn = await query(
    `SELECT pg_get_functiondef(p.oid) AS def
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = '${LEDGER_FORBID_FUNCTION}'`,
  );
  if (!forbidFn.rows[0] || !ledgerForbidFunctionDefMatches(String(forbidFn.rows[0]?.def ?? ""))) {
    throw new Error(
      `${LEDGER_FORBID_FUNCTION} yok veya append-only istisnası taşımıyor. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }

  const checks = await query(
    `SELECT t.relname AS table_name, c.conname AS name, pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND c.contype = 'c'
       AND (
         (t.relname = 'wallets' AND c.conname = '${WALLET_AMOUNT_CHECK}')
         OR (t.relname = '${LEDGER_ENTRIES_TABLE}' AND c.conname = '${LEDGER_AMOUNT_CHECK}')
       )`,
  );
  const byName = new Map(
    checks.rows.map((row) => [String(row.name ?? ""), String(row.def ?? "")]),
  );
  const walletDef = byName.get(WALLET_AMOUNT_CHECK) ?? "";
  const ledgerDef = byName.get(LEDGER_AMOUNT_CHECK) ?? "";
  if (!walletNonNegativeCheckDefMatches(walletDef) || !ledgerPositiveCheckDefMatches(ledgerDef)) {
    throw new Error(
      `Defter/cüzdan CHECK yok veya tanım sapması (negatif bakiye / sıfır tutar). prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }

  const fks = await query(
    `SELECT c.conname AS name, c.confdeltype AS del
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND t.relname = '${LEDGER_ENTRIES_TABLE}'
       AND c.contype = 'f'
       AND c.conname IN ('${LEDGER_WALLET_RESTRICT_FK}', '${LEDGER_USER_RESTRICT_FK}')`,
  );
  const fkByName = new Map(
    fks.rows.map((row) => [String(row.name ?? ""), String(row.del ?? "")]),
  );
  if (fkByName.get(LEDGER_WALLET_RESTRICT_FK) !== "r") {
    throw new Error(
      `${LEDGER_WALLET_RESTRICT_FK} RESTRICT değil. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
  if (fkByName.get(LEDGER_USER_RESTRICT_FK) !== "r") {
    throw new Error(
      `${LEDGER_USER_RESTRICT_FK} RESTRICT değil. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }

  const walletUnique = await query(
    `SELECT count(*)::int AS n FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = 'wallets'
       AND indexname = '${WALLET_COMPOSITE_UNIQUE}'`,
  );
  if (Number(walletUnique.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      `${WALLET_COMPOSITE_UNIQUE} yok. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
}

/** Prisma deploy sonrası: EscrowHold tutar eşitliği, pozitif tutar, hold_bps 0–10000. */
export async function assertEscrowHoldChecks(query: OpsSealQuery): Promise<void> {
  const checks = await query(
    `SELECT c.conname AS name, pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND t.relname = '${ESCROW_HOLDS_TABLE}'
       AND c.contype = 'c'
       AND c.conname IN (
         '${ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK}',
         '${ESCROW_HOLD_GROSS_SPLIT_CHECK}',
         '${ESCROW_HOLD_BPS_RANGE_CHECK}'
       )`,
  );
  const byName = new Map(
    checks.rows.map((row) => [String(row.name ?? ""), String(row.def ?? "")]),
  );
  const amounts = byName.get(ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK) ?? "";
  const split = byName.get(ESCROW_HOLD_GROSS_SPLIT_CHECK) ?? "";
  const bps = byName.get(ESCROW_HOLD_BPS_RANGE_CHECK) ?? "";
  if (
    !escrowHoldAmountsPositiveCheckDefMatches(amounts) ||
    !escrowHoldGrossSplitCheckDefMatches(split) ||
    !escrowHoldBpsRangeCheckDefMatches(bps)
  ) {
    throw new Error(
      `EscrowHold CHECK yok veya tanım sapması. prisma migrate deploy ${ESCROW_HOLD_CHECKS_MIGRATION}`,
    );
  }
}

/** Prisma deploy sonrası: ücretli komut rezerv tablosu + unique + estimated_minor CHECK. */
export async function assertPaidCommandReservations(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${PAID_COMMAND_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${PAID_COMMAND_TABLE} yok. prisma migrate deploy ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
  const index = await query(
    `SELECT count(*)::int AS n FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename = '${PAID_COMMAND_TABLE}'
       AND indexname = '${PAID_COMMAND_UNIQUE_INDEX}'`,
  );
  if (Number(index.rows[0]?.n ?? 0) < 1) {
    throw new Error(
      `${PAID_COMMAND_TABLE} unique (user_id, scope, command_key) yok. ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
  const check = await query(
    `SELECT pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND t.relname = '${PAID_COMMAND_TABLE}'
       AND c.conname = '${PAID_COMMAND_AMOUNT_CHECK}'
       AND c.contype = 'c'`,
  );
  if (!paidCommandNonNegativeCheckDefMatches(String(check.rows[0]?.def ?? ""))) {
    throw new Error(
      `${PAID_COMMAND_AMOUNT_CHECK} yok veya estimated_minor >= 0 değil. ${LEDGER_IMMUTABILITY_MIGRATION}`,
    );
  }
}

export type MemoryOpsCatalog = {
  publicUsers: boolean;
  authUsers: boolean;
  handleNewUser: boolean;
  onAuthUserCreated: boolean;
  handleUserEmailUpdate: boolean;
  onAuthUserEmailUpdated: boolean;
  forceRlsTables: Set<string>;
  rlsPoliciesSealed: boolean;
  academyCourses: Set<string>;
  academyExams: number;
  academyCatalog: number;
  freelancerJobs: Set<string>;
  freelancerCatalog: number;
  treasuryUser: boolean;
  studioDataBase64Check: boolean;
  httpIdempotencyRecords: boolean;
  httpIdempotencyUniqueIndex: boolean;
  academyLessonCompletions: boolean;
  academyExamSittings: boolean;
  userBillingInfo: boolean;
  userBillingPhone: boolean;
  curriculumSealColumn: boolean;
  certificateHashColumn: boolean;
  certificateRevokedAtColumn: boolean;
  certificateRevokeReasonColumn: boolean;
  corporateJobOffers: boolean;
  frozenRoomTablesPresent: boolean;
  ledgerAppendOnlyTrigger: boolean;
  ledgerForbidFunction: boolean;
  ledgerAmountCheck: boolean;
  walletAmountCheck: boolean;
  ledgerWalletRestrictFk: boolean;
  ledgerUserRestrictFk: boolean;
  walletsCompositeUnique: boolean;
  paidCommandReservations: boolean;
  paidCommandUniqueIndex: boolean;
  paidCommandAmountCheck: boolean;
  escrowHoldAmountsCheck: boolean;
  escrowHoldGrossSplitCheck: boolean;
  escrowHoldBpsCheck: boolean;
};

export function createEmptyMemoryOpsCatalog(): MemoryOpsCatalog {
  return {
    publicUsers: false,
    authUsers: false,
    handleNewUser: false,
    onAuthUserCreated: false,
    handleUserEmailUpdate: false,
    onAuthUserEmailUpdated: false,
    forceRlsTables: new Set(),
    rlsPoliciesSealed: false,
    academyCourses: new Set(),
    academyExams: 0,
    academyCatalog: 0,
    freelancerJobs: new Set(),
    freelancerCatalog: 0,
    treasuryUser: false,
    studioDataBase64Check: false,
    httpIdempotencyRecords: false,
    httpIdempotencyUniqueIndex: false,
    academyLessonCompletions: false,
    academyExamSittings: false,
    userBillingInfo: false,
    userBillingPhone: false,
    curriculumSealColumn: false,
    certificateHashColumn: false,
    certificateRevokedAtColumn: false,
    certificateRevokeReasonColumn: false,
    corporateJobOffers: false,
    frozenRoomTablesPresent: false,
    ledgerAppendOnlyTrigger: false,
    ledgerForbidFunction: false,
    ledgerAmountCheck: false,
    walletAmountCheck: false,
    ledgerWalletRestrictFk: false,
    ledgerUserRestrictFk: false,
    walletsCompositeUnique: false,
    paidCommandReservations: false,
    paidCommandUniqueIndex: false,
    paidCommandAmountCheck: false,
    escrowHoldAmountsCheck: false,
    escrowHoldGrossSplitCheck: false,
    escrowHoldBpsCheck: false,
  };
}

/** Prisma deploy sonrası hosted Supabase başlangıcı. */
export function createPostPrismaMemoryCatalog(): MemoryOpsCatalog {
  const catalog = createEmptyMemoryOpsCatalog();
  catalog.publicUsers = true;
  catalog.authUsers = true;
  catalog.studioDataBase64Check = true;
  catalog.httpIdempotencyRecords = true;
  catalog.httpIdempotencyUniqueIndex = true;
  catalog.academyLessonCompletions = true;
  catalog.academyExamSittings = true;
  catalog.userBillingInfo = true;
  catalog.userBillingPhone = true;
  catalog.curriculumSealColumn = true;
  catalog.certificateHashColumn = true;
  catalog.certificateRevokedAtColumn = true;
  catalog.certificateRevokeReasonColumn = true;
  catalog.corporateJobOffers = false;
  catalog.frozenRoomTablesPresent = false;
  catalog.ledgerAppendOnlyTrigger = true;
  catalog.ledgerForbidFunction = true;
  catalog.ledgerAmountCheck = true;
  catalog.walletAmountCheck = true;
  catalog.ledgerWalletRestrictFk = true;
  catalog.ledgerUserRestrictFk = true;
  catalog.walletsCompositeUnique = true;
  catalog.paidCommandReservations = true;
  catalog.paidCommandUniqueIndex = true;
  catalog.paidCommandAmountCheck = true;
  catalog.escrowHoldAmountsCheck = true;
  catalog.escrowHoldGrossSplitCheck = true;
  catalog.escrowHoldBpsCheck = true;
  return catalog;
}

export function applySqlToMemoryCatalog(catalog: MemoryOpsCatalog, sql: string): void {
  if (/FUNCTION public\.handle_new_user\(\)/.test(sql)) {
    catalog.handleNewUser = true;
  }
  if (/CREATE TRIGGER on_auth_user_created/.test(sql)) {
    catalog.onAuthUserCreated = true;
  }
  if (/FUNCTION public\.handle_user_email_update\(\)/.test(sql)) {
    catalog.handleUserEmailUpdate = true;
  }
  if (/CREATE TRIGGER on_auth_user_email_updated/.test(sql)) {
    catalog.onAuthUserEmailUpdated = true;
  }
  if (/FORCE ROW LEVEL SECURITY/.test(sql)) {
    for (const table of FORCE_RLS_CORE_TABLES) {
      catalog.forceRlsTables.add(table);
    }
  }
  if (/rls_deny_unscoped/.test(sql) && /FUNCTION public\.yetkin_apply_rls_unscoped_deny\(/.test(sql)) {
    catalog.rlsPoliciesSealed = true;
  }
  for (const id of ACADEMY_SEED_COURSE_IDS) {
    if (sql.includes(`'${id}'`)) {
      catalog.academyCourses.add(id);
    }
  }
  if (sql.includes("INSERT INTO public.academy_exams")) {
    catalog.academyExams = ACADEMY_SEED_COURSE_IDS.length;
  }
  if (ACADEMY_SEED_CATALOG_UNITS.every((unit) => sql.includes(unit))) {
    catalog.academyCatalog = ACADEMY_SEED_COURSE_IDS.length;
  }
  for (const id of FREELANCER_SEED_JOB_IDS) {
    if (sql.includes(`'${id}'`)) {
      catalog.freelancerJobs.add(id);
    }
  }
  if (sql.includes("job-posting:floor") && sql.includes("escrow:hold")) {
    catalog.freelancerCatalog = 2;
  }
  if (sql.includes(PLATFORM_TREASURY_USER_ID) && /INSERT INTO public\.users/.test(sql)) {
    catalog.treasuryUser = true;
  }
  if (sql.includes(ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK)) {
    catalog.escrowHoldAmountsCheck = true;
  }
  if (sql.includes(ESCROW_HOLD_GROSS_SPLIT_CHECK)) {
    catalog.escrowHoldGrossSplitCheck = true;
  }
  if (sql.includes(ESCROW_HOLD_BPS_RANGE_CHECK)) {
    catalog.escrowHoldBpsCheck = true;
  }
}

export function createMemoryOpsSealQuery(catalog: MemoryOpsCatalog): OpsSealQuery {
  return async (text, params) => {
    if (text.includes("p3-frozen-room-drop-seal")) {
      if (!catalog.frozenRoomTablesPresent) {
        return { rows: [] };
      }
      return {
        rows: FROZEN_ROOM_TABLES.map((table_name) => ({ table_name })),
      };
    }
    if (text.includes("table_schema = 'public'") && text.includes(`table_name = '${HTTP_IDEMPOTENCY_TABLE}'`)) {
      return { rows: [{ exists: catalog.httpIdempotencyRecords }] };
    }
    if (text.includes("table_schema = 'public'") && text.includes(`table_name = '${PAID_COMMAND_TABLE}'`)) {
      return { rows: [{ exists: catalog.paidCommandReservations }] };
    }
    if (text.includes(`p.proname = '${LEDGER_FORBID_FUNCTION}'`)) {
      return catalog.ledgerForbidFunction
        ? { rows: [{ def: "RAISE EXCEPTION 'ledger_entries is append-only'" }] }
        : { rows: [] };
    }
    if (text.includes(`t.tgname = '${LEDGER_APPEND_ONLY_TRIGGER}'`)) {
      if (!catalog.ledgerAppendOnlyTrigger) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            def: "CREATE TRIGGER ledger_entries_append_only BEFORE UPDATE OR DELETE ON public.ledger_entries FOR EACH ROW EXECUTE FUNCTION yetkin_forbid_ledger_mutation()",
            enabled: "O",
          },
        ],
      };
    }
    if (text.includes(`c.conname = '${WALLET_AMOUNT_CHECK}'`)) {
      const rows: { name: string; def: string }[] = [];
      if (catalog.walletAmountCheck) {
        rows.push({ name: WALLET_AMOUNT_CHECK, def: 'CHECK (("amount_minor" >= 0))' });
      }
      if (catalog.ledgerAmountCheck) {
        rows.push({ name: LEDGER_AMOUNT_CHECK, def: 'CHECK (("amount_minor" > 0))' });
      }
      return { rows };
    }
    if (
      text.includes(LEDGER_WALLET_RESTRICT_FK) &&
      text.includes(LEDGER_USER_RESTRICT_FK)
    ) {
      const rows: { name: string; del: string }[] = [];
      if (catalog.ledgerWalletRestrictFk) {
        rows.push({ name: LEDGER_WALLET_RESTRICT_FK, del: "r" });
      }
      if (catalog.ledgerUserRestrictFk) {
        rows.push({ name: LEDGER_USER_RESTRICT_FK, del: "r" });
      }
      return { rows };
    }
    if (text.includes(WALLET_COMPOSITE_UNIQUE)) {
      return { rows: [{ n: catalog.walletsCompositeUnique ? 1 : 0 }] };
    }
    if (text.includes(PAID_COMMAND_AMOUNT_CHECK)) {
      return catalog.paidCommandAmountCheck
        ? { rows: [{ def: 'CHECK (("estimated_minor" >= 0))' }] }
        : { rows: [] };
    }
    if (text.includes(ESCROW_HOLD_GROSS_SPLIT_CHECK)) {
      const rows: { name: string; def: string }[] = [];
      if (catalog.escrowHoldAmountsCheck) {
        rows.push({
          name: ESCROW_HOLD_AMOUNTS_POSITIVE_CHECK,
          def: 'CHECK (("gross_minor" > 0) AND ("hold_minor" >= 0) AND ("net_minor" > 0))',
        });
      }
      if (catalog.escrowHoldGrossSplitCheck) {
        rows.push({
          name: ESCROW_HOLD_GROSS_SPLIT_CHECK,
          def: 'CHECK (("gross_minor" = "hold_minor" + "net_minor"))',
        });
      }
      if (catalog.escrowHoldBpsCheck) {
        rows.push({
          name: ESCROW_HOLD_BPS_RANGE_CHECK,
          def: 'CHECK (("hold_bps" >= 0) AND ("hold_bps" <= 10000))',
        });
      }
      return { rows };
    }
    if (text.includes(PAID_COMMAND_UNIQUE_INDEX)) {
      return { rows: [{ n: catalog.paidCommandUniqueIndex ? 1 : 0 }] };
    }
    if (text.includes(`table_name = '${ACADEMY_LESSON_COMPLETIONS_TABLE}'`)) {
      return { rows: [{ exists: catalog.academyLessonCompletions }] };
    }
    if (text.includes(`table_name = '${ACADEMY_EXAM_SITTINGS_TABLE}'`)) {
      return { rows: [{ exists: catalog.academyExamSittings }] };
    }
    if (
      text.includes(`table_name = '${USER_BILLING_INFO_TABLE}'`) &&
      text.includes(`column_name = '${USER_BILLING_PHONE_COLUMN}'`)
    ) {
      return { rows: [{ exists: catalog.userBillingPhone }] };
    }
    if (text.includes(`table_name = '${USER_BILLING_INFO_TABLE}'`)) {
      return { rows: [{ exists: catalog.userBillingInfo }] };
    }
    if (text.includes(`column_name = '${CURRICULUM_SEAL_COLUMN}'`)) {
      return { rows: [{ exists: catalog.curriculumSealColumn }] };
    }
    if (text.includes(`column_name = '${CERTIFICATE_HASH_COLUMN}'`)) {
      return { rows: [{ exists: catalog.certificateHashColumn }] };
    }
    if (text.includes(`column_name = '${CERTIFICATE_REVOKED_AT_COLUMN}'`)) {
      return { rows: [{ exists: catalog.certificateRevokedAtColumn }] };
    }
    if (text.includes(`column_name = '${CERTIFICATE_REVOKE_REASON_COLUMN}'`)) {
      return { rows: [{ exists: catalog.certificateRevokeReasonColumn }] };
    }
    if (text.includes(`table_name = '${CORPORATE_JOB_OFFERS_TABLE}'`)) {
      return { rows: [{ exists: catalog.corporateJobOffers }] };
    }
    if (text.includes("table_schema = 'public'") && text.includes("table_name = 'users'")) {
      return { rows: [{ exists: catalog.publicUsers }] };
    }
    if (text.includes(STUDIO_DATA_BASE64_CHECK_NAME)) {
      if (!catalog.studioDataBase64Check) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            def: `CHECK ((char_length("data_base64") <= ${STUDIO_IMAGE_DATA_BASE64_MAX_CHARS}))`,
          },
        ],
      };
    }
    if (text.includes(HTTP_IDEMPOTENCY_UNIQUE_INDEX)) {
      return { rows: [{ n: catalog.httpIdempotencyUniqueIndex ? 1 : 0 }] };
    }
    if (text.includes("table_schema = 'auth'") && text.includes("table_name = 'users'")) {
      return { rows: [{ exists: catalog.authUsers }] };
    }
    if (text.includes("p.proname = 'handle_new_user'")) {
      return { rows: [{ n: catalog.handleNewUser ? 1 : 0 }] };
    }
    if (text.includes("t.tgname = 'on_auth_user_created'")) {
      return { rows: [{ n: catalog.onAuthUserCreated ? 1 : 0 }] };
    }
    if (text.includes("p.proname = 'handle_user_email_update'")) {
      return { rows: [{ n: catalog.handleUserEmailUpdate ? 1 : 0 }] };
    }
    if (text.includes("t.tgname = 'on_auth_user_email_updated'")) {
      return { rows: [{ n: catalog.onAuthUserEmailUpdated ? 1 : 0 }] };
    }
    if (text.includes("relforcerowsecurity")) {
      const missing = FORCE_RLS_CORE_TABLES.filter((name) => !catalog.forceRlsTables.has(name)).map(
        (name) => ({ name }),
      );
      return { rows: missing };
    }
    if (text.includes("pg_policy") && text.includes("polrelid")) {
      if (catalog.rlsPoliciesSealed) {
        return { rows: [] };
      }
      return { rows: [{ name: "users" }] };
    }
    if (text.includes("FROM public.academy_courses")) {
      return {
        rows: [...catalog.academyCourses].map((id) => ({ id })),
      };
    }
    if (text.includes(ACADEMY_CATALOG_PRICE_MAP_APPLY)) {
      return { rows: [] };
    }
    if (text.includes(ACADEMY_CATALOG_PRICE_MAP_SEAL)) {
      return {
        rows: ACADEMY_CATALOG_SEEDS.map((row) => ({
          unit_key: row.catalogUnitKey,
          amount_minor: row.seedAmountMinor,
          min_minor: row.seedMinMinor,
          max_minor: row.seedMaxMinor,
          is_active: true,
        })),
      };
    }
    if (text.includes("module_key = 'academy'")) {
      return { rows: [{ n: catalog.academyCatalog }] };
    }
    if (text.includes("FROM public.academy_exams")) {
      return { rows: [{ n: catalog.academyExams }] };
    }
    if (text.includes("FROM public.freelancer_jobs")) {
      const ids = (params?.[0] as string[] | undefined) ?? [...FREELANCER_SEED_JOB_IDS];
      return {
        rows: ids.filter((id) => catalog.freelancerJobs.has(id)).map((id) => ({ id })),
      };
    }
    if (text.includes("module_key = 'freelancer'")) {
      return { rows: [{ n: catalog.freelancerCatalog }] };
    }
    if (text.includes("FROM public.users WHERE id")) {
      return { rows: [{ n: catalog.treasuryUser ? 1 : 0 }] };
    }
    throw new Error(`memory ops catalog: tanınmayan sorgu`);
  };
}

export async function runPostApplySeals(query: OpsSealQuery): Promise<void> {
  await assertNewUserTrigger(query);
  await assertForceRls(query);
  await assertPublicRlsPolicies(query);
  await assertFrozenRoomTablesDropped(query);
  await assertHttpIdempotencyRecords(query);
  await assertLedgerImmutability(query);
  await assertEscrowHoldChecks(query);
  await assertPaidCommandReservations(query);
  await assertAcademyLessonCompletions(query);
  await assertAcademyExamSittings(query);
  await assertUserBillingPhone(query);
  await assertCurriculumSealColumns(query);
  await assertCertificateRevocationColumns(query);
  await assertTreasurySentinel(query);
  await assertAcademySeed(query);
  await assertAcademyCatalogPriceMap(query);
  await assertEmailUpdateTrigger(query);
  await assertFreelancerSeed(query);
}

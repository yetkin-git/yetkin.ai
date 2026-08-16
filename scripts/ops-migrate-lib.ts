/**
 * Ops migrate — kilitli sıra, havuz yasağı, SQL mühür planı, uygulama sonrası okuyucu.
 * Yeni tablo icat etmez. CLI: scripts/ops-migrate.ts
 */

import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/studio/storage";

export const EXPECTED_SQL = [
  "20260814010000_handle_new_user_auth_sync.sql",
  "20260814020000_enforce_rls_all_tables.sql",
  "20260814030000_rls_user_scoped_policies.sql",
  "20260814040000_price_catalog_definitions.sql",
  "20260814090000_academy_course_seed.sql",
  "20260814100000_handle_user_email_update.sql",
  "20260814110000_freelancer_job_seed.sql",
] as const;

export const ACADEMY_SEED_COURSE_IDS = ["ac_rail_temel", "ac_ray_sinyal"] as const;
export const FREELANCER_SEED_JOB_IDS = ["fj_rail_escrow_audit", "fj_ray_sinyal_brief"] as const;
export const FREELANCER_SEED_CLIENT_ID = PLATFORM_TREASURY_USER_ID;

export const FORCE_RLS_CORE_TABLES = [
  "users",
  "wallets",
  "ledger_entries",
  "ai_token_usages",
  "price_catalog_entries",
  "academy_courses",
  "academy_exams",
  "freelancer_jobs",
  "http_idempotency_records",
] as const;

/**
 * Prisma migrate deploy — D2.1 ders sicili, D2.2 mühür kolonları, D2.3 kurumsal teklif.
 * Yedi SQL'e ek dosya yazılmaz. Sıra klasör zaman damgasıdır; havuz :6543 ile geçilmez.
 */
export const PRISMA_RING_MIGRATIONS = [
  "20260816020000_academy_lesson_completions",
  "20260816030000_d2_2_curriculum_seal_certificate_hash",
  "20260816040000_d2_3_corporate_job_offers",
] as const;

export const ACADEMY_LESSON_COMPLETIONS_TABLE = "academy_lesson_completions";
export const ACADEMY_CERTIFICATES_TABLE = "academy_certificates";
export const CURRICULUM_SEAL_COLUMN = "curriculum_seal";
export const CAREER_VISA_STAMPS_TABLE = "career_visa_stamps";
export const CERTIFICATE_HASH_COLUMN = "certificate_hash";
export const CORPORATE_JOB_OFFERS_TABLE = "corporate_job_offers";

/** Prisma migrate deploy — Studio TEXT tavanı (CHECK). Yedi SQL'e ek dosya yazılmaz. */
export const STUDIO_DATA_BASE64_CHECK_NAME = "studio_digital_assets_data_base64_max_chars";
export const STUDIO_DATA_BASE64_TABLE = "studio_digital_assets";
export const HTTP_IDEMPOTENCY_TABLE = "http_idempotency_records";
export const HTTP_IDEMPOTENCY_UNIQUE_INDEX = "http_idempotency_records_user_id_route_key_key";

export const DIRECT_POSTGRES_PORT = 5432;
export const FORBIDDEN_POOLER_PORT = 6543;
export const SUPABASE_DIRECT_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;

/** Operatör sıfır-hata metni — `docs/07_OPS_RUNBOOK.md` §2.1 ile birebir kilit. */
export const DIRECT_PORT_OPERATOR_PROTOCOL = [
  "Direct Port protokolü fail-closed: db.<ref>.supabase.co:5432.",
  "Havuz pooler.supabase.com ve port 6543 ile geçilmez (P1001 yeşil boyanmaz).",
  "Direct host çoğu projede yalnız AAAA (IPv6) yayınlar.",
  "Operatör makinesinde IPv6 varsayılan rota yoksa getaddrinfo ENOENT / P1001 durur.",
  "Yol A: Supabase IPv4 add-on (Direct host A kaydı).",
  "Yol B: makinede IPv6 bağını ve ::/0 rotasını aç; Test-NetConnection db.<ref>.supabase.co -Port 5432.",
  "Yol C yasak: DATABASE_URL veya DIRECT_URL = *.pooler.supabase.com:6543.",
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
export function withPgLibpqSslCompat(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/[?&]uselibpqcompat=/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed.includes("?") ? `${trimmed}&uselibpqcompat=true` : `${trimmed}?uselibpqcompat=true`;
}

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

export type SqlSealPlan = {
  handleNewUser: boolean;
  onAuthUserCreated: boolean;
  forceRls: boolean;
  ownerSelectPolicy: boolean;
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
    academyCourseIds: ACADEMY_SEED_COURSE_IDS.filter((id) => academy.includes(id)),
    academyCatalogUnits:
      academy.includes("course:rail-temel") && academy.includes("course:rayli-sinyal-emniyet"),
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
       AND unit_key IN ('course:rail-temel', 'course:rayli-sinyal-emniyet')`,
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

/** Prisma deploy sonrası: studio_digital_assets.data_base64 CHECK (2097152). */
export async function assertStudioDataBase64Check(query: OpsSealQuery): Promise<void> {
  const { rows } = await query(
    `SELECT pg_get_constraintdef(c.oid) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE n.nspname = 'public'
       AND t.relname = '${STUDIO_DATA_BASE64_TABLE}'
       AND c.conname = '${STUDIO_DATA_BASE64_CHECK_NAME}'
       AND c.contype = 'c'`,
  );
  const def = String(rows[0]?.def ?? "");
  if (!rows[0] || !studioDataBase64CheckDefMatches(def)) {
    throw new Error(
      `${STUDIO_DATA_BASE64_CHECK_NAME} yok veya tavan ${STUDIO_IMAGE_DATA_BASE64_MAX_CHARS} değil. prisma migrate deploy 20260815160000_studio_data_base64_max_chars`,
    );
  }
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

/** Prisma deploy sonrası: D2.3 corporate_job_offers. */
export async function assertCorporateJobOffers(query: OpsSealQuery): Promise<void> {
  const table = await query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = '${CORPORATE_JOB_OFFERS_TABLE}'
     ) AS exists`,
  );
  if (!table.rows[0]?.exists) {
    throw new Error(
      `${CORPORATE_JOB_OFFERS_TABLE} yok. prisma migrate deploy ${PRISMA_RING_MIGRATIONS[2]}`,
    );
  }
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

export type MemoryOpsCatalog = {
  publicUsers: boolean;
  authUsers: boolean;
  handleNewUser: boolean;
  onAuthUserCreated: boolean;
  handleUserEmailUpdate: boolean;
  onAuthUserEmailUpdated: boolean;
  forceRlsTables: Set<string>;
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
  curriculumSealColumn: boolean;
  certificateHashColumn: boolean;
  corporateJobOffers: boolean;
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
    curriculumSealColumn: false,
    certificateHashColumn: false,
    corporateJobOffers: false,
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
  catalog.curriculumSealColumn = true;
  catalog.certificateHashColumn = true;
  catalog.corporateJobOffers = true;
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
  for (const id of ACADEMY_SEED_COURSE_IDS) {
    if (sql.includes(`'${id}'`)) {
      catalog.academyCourses.add(id);
    }
  }
  if (sql.includes("INSERT INTO public.academy_exams")) {
    catalog.academyExams = ACADEMY_SEED_COURSE_IDS.length;
  }
  if (sql.includes("course:rail-temel") && sql.includes("course:rayli-sinyal-emniyet")) {
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
}

export function createMemoryOpsSealQuery(catalog: MemoryOpsCatalog): OpsSealQuery {
  return async (text, params) => {
    if (text.includes("table_schema = 'public'") && text.includes(`table_name = '${HTTP_IDEMPOTENCY_TABLE}'`)) {
      return { rows: [{ exists: catalog.httpIdempotencyRecords }] };
    }
    if (text.includes(`table_name = '${ACADEMY_LESSON_COMPLETIONS_TABLE}'`)) {
      return { rows: [{ exists: catalog.academyLessonCompletions }] };
    }
    if (text.includes(`column_name = '${CURRICULUM_SEAL_COLUMN}'`)) {
      return { rows: [{ exists: catalog.curriculumSealColumn }] };
    }
    if (text.includes(`column_name = '${CERTIFICATE_HASH_COLUMN}'`)) {
      return { rows: [{ exists: catalog.certificateHashColumn }] };
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
    if (text.includes("FROM public.academy_courses")) {
      return {
        rows: [...catalog.academyCourses].map((id) => ({ id })),
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
  await assertStudioDataBase64Check(query);
  await assertHttpIdempotencyRecords(query);
  await assertAcademyLessonCompletions(query);
  await assertCurriculumSealColumns(query);
  await assertCorporateJobOffers(query);
  await assertTreasurySentinel(query);
  await assertAcademySeed(query);
  await assertEmailUpdateTrigger(query);
  await assertFreelancerSeed(query);
}

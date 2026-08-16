import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_SEED_COURSE_IDS,
  EXPECTED_SQL,
  FREELANCER_SEED_JOB_IDS,
  PRISMA_RING_MIGRATIONS,
  assertAuthUsers,
  assertPublicUsers,
  assertSqlSealPlanComplete,
  applySqlToMemoryCatalog,
  createMemoryOpsSealQuery,
  createPostPrismaMemoryCatalog,
  inspectSqlSealPlan,
  catalogSqlPreservesOperatorPrice,
  parseDirectConnectionUrl,
  DIRECT_PORT_OPERATOR_PROTOCOL,
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  runPostApplySeals,
  withPgLibpqSslCompat,
  assertStudioDataBase64Check,
  assertHttpIdempotencyRecords,
  assertAcademyLessonCompletions,
  assertCurriculumSealColumns,
  assertCorporateJobOffers,
  assertPrismaRingMigrationsPresent,
} from "../../scripts/ops-migrate-lib";

const ROOT = process.cwd();
const MIG_DIR = join(ROOT, "supabase", "migrations");

function loadSqlByFile(): Record<string, string> {
  const sqlByFile: Record<string, string> = {};
  for (const file of EXPECTED_SQL) {
    sqlByFile[file] = readFileSync(join(MIG_DIR, file), "utf8");
  }
  return sqlByFile;
}

describe("ops:migrate havuz yasağı", () => {
  it("port 6543 ve pooler.supabase.com hostunu reddeder; direct 5432 geçer", () => {
    expect(
      isForbiddenPoolerUrl(
        "postgresql://postgres:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
      ),
    ).toBe(true);
    expect(
      isForbiddenPoolerUrl(
        "postgresql://postgres:x@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
      ),
    ).toBe(true);
    expect(
      isForbiddenPoolerUrl("postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres"),
    ).toBe(false);
    expect(isForbiddenPoolerUrl("postgresql://postgres:postgres@localhost:5432/yetkin_rail")).toBe(
      false,
    );
  });

  it("Direct Port biçimi db.<ref>:5432 veya localhost kabul eder; pooler ve 6543 kırılır", () => {
    const direct = parseDirectConnectionUrl(
      "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
    );
    expect(direct?.ok).toBe(true);
    expect(direct?.isSupabaseDirectHost).toBe(true);
    expect(direct?.isDirectPort).toBe(true);
    expect(
      parseDirectConnectionUrl(
        "postgresql://postgres:x@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
      )?.ok,
    ).toBe(false);
    expect(
      parseDirectConnectionUrl("postgresql://postgres:x@db.abcdefgh.supabase.co:6543/postgres")
        ?.ok,
    ).toBe(false);
    expect(parseDirectConnectionUrl("postgresql://postgres:x@localhost:5432/yetkin_rail")?.ok).toBe(
      true,
    );
    expect(DIRECT_PORT_OPERATOR_PROTOCOL).toContain("IPv4 add-on");
    expect(DIRECT_PORT_OPERATOR_PROTOCOL).toContain("6543");
  });

  it("pg libpq SSL uyumu host/port değiştirmez; parametreyi bir kez ekler", () => {
    const direct = "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres?sslmode=require";
    const patched = withPgLibpqSslCompat(direct);
    expect(patched).toContain("uselibpqcompat=true");
    expect(parseDirectConnectionUrl(patched)?.ok).toBe(true);
    expect(parseDirectConnectionUrl(patched)?.port).toBe(5432);
    expect(withPgLibpqSslCompat(patched)).toBe(patched);
    expect(isForbiddenPoolerUrl(patched)).toBe(false);
  });

  it("DIRECT_URL yoksa DATABASE_URL okur; ikisi de boşsa null", () => {
    expect(
      resolveMigratorConnectionUrl({
        DIRECT_URL: "postgresql://db.ref.supabase.co:5432/postgres",
        DATABASE_URL: "postgresql://pooler:6543/postgres",
      }),
    ).toContain("db.ref.supabase.co");
    expect(resolveMigratorConnectionUrl({ DATABASE_URL: "postgresql://localhost/x" })).toContain(
      "localhost",
    );
    expect(resolveMigratorConnectionUrl({})).toBeNull();
    expect(resolveMigratorConnectionUrl({ DIRECT_URL: "  ", DATABASE_URL: "" })).toBeNull();
  });
});

describe("yedi SQL mühür planı", () => {
  it("diskteki dosya adları kilitli sırayla birebir", () => {
    const files = readdirSync(MIG_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort();
    expect(files).toEqual([...EXPECTED_SQL]);
  });

  it("SQL dosyaları RLS, Auth tetikleyicileri ve tohumları eksiksiz mühürler", () => {
    const plan = inspectSqlSealPlan(loadSqlByFile());
    expect(assertSqlSealPlanComplete(plan)).toEqual([]);
    expect(plan.academyCourseIds).toEqual([...ACADEMY_SEED_COURSE_IDS]);
    expect(plan.freelancerJobIds).toEqual([...FREELANCER_SEED_JOB_IDS]);
    expect(plan.catalogOperatorPricePreserve).toBe(true);
  });

  it("kör EXCLUDED amount_minor yazımını Super Admin koruması saymaz", () => {
    expect(
      catalogSqlPreservesOperatorPrice(`ON CONFLICT (module_key, unit_key) DO UPDATE
SET
  amount_minor = EXCLUDED.amount_minor,
  updated_at = now();`),
    ).toBe(false);
    expect(catalogSqlPreservesOperatorPrice("INSERT INTO public.price_catalog_entries")).toBe(false);
  });
});

describe("ops:migrate bellek katalog simülasyonu", () => {
  it("Prisma sonrası SQL sırası handle_new_user, FORCE RLS, e-posta senkronu ve tohumları basar", async () => {
    const catalog = createPostPrismaMemoryCatalog();
    const query = createMemoryOpsSealQuery(catalog);
    await assertPublicUsers(query);
    await assertAuthUsers(query);

    for (const file of EXPECTED_SQL) {
      applySqlToMemoryCatalog(catalog, readFileSync(join(MIG_DIR, file), "utf8"));
    }

    await expect(runPostApplySeals(query)).resolves.toBeUndefined();
  });

  it("auth.users yokken fail-closed çıkar; e-posta SQL'i atlanırsa tetikleyici assert kırılır", async () => {
    const noAuth = createPostPrismaMemoryCatalog();
    noAuth.authUsers = false;
    await expect(assertAuthUsers(createMemoryOpsSealQuery(noAuth))).rejects.toThrow(/auth\.users yok/);

    const catalog = createPostPrismaMemoryCatalog();
    for (const file of EXPECTED_SQL) {
      if (file.includes("handle_user_email_update")) {
        continue;
      }
      applySqlToMemoryCatalog(catalog, readFileSync(join(MIG_DIR, file), "utf8"));
    }
    await expect(runPostApplySeals(createMemoryOpsSealQuery(catalog))).rejects.toThrow(
      /handle_user_email_update/,
    );
  });

  it("Prisma CHECK veya http_idempotency_records yoksa fail-closed çıkar", async () => {
    const noCheck = createPostPrismaMemoryCatalog();
    noCheck.studioDataBase64Check = false;
    await expect(assertStudioDataBase64Check(createMemoryOpsSealQuery(noCheck))).rejects.toThrow(
      /studio_digital_assets_data_base64_max_chars/,
    );

    const noTable = createPostPrismaMemoryCatalog();
    noTable.httpIdempotencyRecords = false;
    await expect(assertHttpIdempotencyRecords(createMemoryOpsSealQuery(noTable))).rejects.toThrow(
      /http_idempotency_records/,
    );

    const noIndex = createPostPrismaMemoryCatalog();
    noIndex.httpIdempotencyUniqueIndex = false;
    await expect(assertHttpIdempotencyRecords(createMemoryOpsSealQuery(noIndex))).rejects.toThrow(
      /unique \(user_id, route, key\)/,
    );
  });

  it("D2.1–D2.3 Prisma halkası diskte sırayla durur; post-apply yoksa fail-closed çıkar", async () => {
    const folders = readdirSync(join(ROOT, "prisma", "migrations"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\d{14}_/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
    expect(assertPrismaRingMigrationsPresent(folders)).toEqual([]);
    expect(assertPrismaRingMigrationsPresent([])).toHaveLength(PRISMA_RING_MIGRATIONS.length);
    expect(
      assertPrismaRingMigrationsPresent([
        PRISMA_RING_MIGRATIONS[2],
        PRISMA_RING_MIGRATIONS[1],
        PRISMA_RING_MIGRATIONS[0],
      ]).some((row) => row.includes("sıra")),
    ).toBe(true);

    const noLessons = createPostPrismaMemoryCatalog();
    noLessons.academyLessonCompletions = false;
    await expect(assertAcademyLessonCompletions(createMemoryOpsSealQuery(noLessons))).rejects.toThrow(
      /academy_lesson_completions/,
    );

    const noSeal = createPostPrismaMemoryCatalog();
    noSeal.curriculumSealColumn = false;
    await expect(assertCurriculumSealColumns(createMemoryOpsSealQuery(noSeal))).rejects.toThrow(
      /curriculum_seal/,
    );

    const noHash = createPostPrismaMemoryCatalog();
    noHash.certificateHashColumn = false;
    await expect(assertCurriculumSealColumns(createMemoryOpsSealQuery(noHash))).rejects.toThrow(
      /certificate_hash/,
    );

    const noOffers = createPostPrismaMemoryCatalog();
    noOffers.corporateJobOffers = false;
    await expect(assertCorporateJobOffers(createMemoryOpsSealQuery(noOffers))).rejects.toThrow(
      /corporate_job_offers/,
    );
  });
});

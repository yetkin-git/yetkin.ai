import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ops migrate yüzeyi", () => {
  it("package.json ops:migrate / ops:init betiklerini taşır", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:migrate"]).toBe("tsx scripts/ops-migrate.ts");
    expect(pkg.scripts["ops:init"]).toBe("npm run ops:migrate");
    expect(pkg.scripts["ops:storage-cors"]).toBe("tsx scripts/ops-storage-cors-check.ts");
    expect(pkg.scripts["ops:runtime-readiness"]).toBe("tsx scripts/ops-runtime-readiness.ts");
    expect(pkg.scripts["ops:t3-academy-loop"]).toBe("tsx scripts/ops-t3-academy-loop.ts");
    expect(pkg.scripts["ops:t4-freelancer-loop"]).toBe("tsx scripts/ops-t4-freelancer-loop.ts");
  });

  it("script Prisma deploy sonra yedi SQL dosyasını sırayla uygular; izleme tablosu icat etmez", () => {
    const script = `${readSrc("scripts/ops-migrate.ts")}\n${readSrc("scripts/ops-migrate-lib.ts")}`;
    expect(script).toContain("prisma migrate deploy");
    expect(script).toContain("20260814010000_handle_new_user_auth_sync.sql");
    expect(script).toContain("20260814020000_enforce_rls_all_tables.sql");
    expect(script).toContain("20260814030000_rls_user_scoped_policies.sql");
    expect(script).toContain("20260814040000_price_catalog_definitions.sql");
    expect(script).toContain("20260814090000_academy_course_seed.sql");
    expect(script).toContain("20260814100000_handle_user_email_update.sql");
    expect(script).toContain("20260814110000_freelancer_job_seed.sql");
    expect(script).toContain("auth.users");
    expect(script).toContain("SUPER_ADMIN_USER_ID");
    expect(script).toContain("ac_rail_temel");
    expect(script).toContain("handle_user_email_update");
    expect(script).toContain("fj_rail_icon_set");
    expect(script).not.toMatch(/CREATE TABLE/i);
    expect(script).toContain("assertNewUserTrigger");
    expect(script).toContain("assertForceRls");
    expect(script).toContain("assertStudioDataBase64Check");
    expect(script).toContain("assertHttpIdempotencyRecords");
    expect(script).toContain("assertAcademyLessonCompletions");
    expect(script).toContain("assertCurriculumSealColumns");
    expect(script).toContain("assertCorporateJobOffers");
    expect(script).toContain("assertPrismaRingMigrationsPresent");
    expect(script).toContain("20260816020000_academy_lesson_completions");
    expect(script).toContain("20260816030000_d2_2_curriculum_seal_certificate_hash");
    expect(script).toContain("20260816040000_d2_3_corporate_job_offers");
    expect(script).toContain("http_idempotency_records");
    expect(script).toContain("studio_digital_assets_data_base64_max_chars");
    expect(script).toContain("isForbiddenPoolerUrl");
    expect(script).not.toContain("_supabase_migrations");
    const order = [
      "handle_new_user_auth_sync.sql",
      "enforce_rls_all_tables.sql",
      "rls_user_scoped_policies.sql",
      "price_catalog_definitions.sql",
      "academy_course_seed.sql",
      "handle_user_email_update.sql",
      "freelancer_job_seed.sql",
    ].map((suffix) => script.indexOf(suffix));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
    expect(order[2]).toBeLessThan(order[3]!);
    expect(order[3]).toBeLessThan(order[4]!);
    expect(order[4]).toBeLessThan(order[5]!);
    expect(order[5]).toBeLessThan(order[6]!);
    expect(readSrc("scripts/ops-migrate.ts")).toContain("assertDirectPortReachable");
    expect(readSrc("scripts/ops-migrate-lib.ts")).toContain("DIRECT_PORT_OPERATOR_PROTOCOL");
  });

  it("kilitli yedi SQL studio-assets taşımaz; seremoni mührü sahte phase yazmaz", () => {
    const opsLib = readSrc("scripts/ops-migrate-lib.ts");
    expect(opsLib).toContain("EXPECTED_SQL");
    expect(opsLib).not.toContain("studio-assets.sql");
    expect(opsLib).not.toContain("storage/studio-assets");
  });

  it(".env.example Playwright kökenini (E2E_BASE_URL) yazar", () => {
    const example = readSrc(".env.example");
    expect(example).toContain("E2E_BASE_URL");
    expect(example).toContain(".system_docs/OPS_RUNBOOK.md");
  });
});

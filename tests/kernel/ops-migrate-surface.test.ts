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
    expect(script).toContain("fj_rail_escrow_audit");
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
  });

  it("runbook .env.local, ilk kullanıcı ve Super Admin UUID adımlarını anlatır", () => {
    const runbook = readSrc("docs/07_OPS_RUNBOOK.md");
    expect(runbook).toContain(".env.local");
    expect(runbook).toContain("SUPER_ADMIN_USER_ID");
    expect(runbook).toContain("ops:migrate");
    expect(runbook).toContain("/register");
    expect(runbook).toContain("00000000-0000-4000-8000-000000000001");
    expect(runbook).toContain("handle_new_user");
    expect(runbook).toContain("DIRECT_URL");
    expect(runbook).toContain("IPv6");
    expect(runbook).toContain("P1001");
    expect(runbook).toContain("DIRECT_PORT_OPERATOR_PROTOCOL");
    expect(runbook).toContain("Test-NetConnection");
    expect(runbook).toContain("IPv4 add-on");
    expect(readSrc("scripts/ops-migrate.ts")).toContain("assertDirectPortReachable");
    expect(readSrc("scripts/ops-migrate-lib.ts")).toContain("DIRECT_PORT_OPERATOR_PROTOCOL");
    expect(runbook).toContain("20260814090000_academy_course_seed.sql");
    expect(runbook).toContain("20260814100000_handle_user_email_update.sql");
    expect(runbook).toContain("20260814110000_freelancer_job_seed.sql");
    expect(runbook).toContain("handle_user_email_update");
    expect(runbook).toContain("/academy");
    expect(runbook).toContain("/freelancer");
    expect(runbook).toContain("/yetkinilan");
    expect(runbook).toContain("session-mode");
    expect(runbook).toContain("PENDING");
    expect(runbook).toContain("credit etmez");
    expect(runbook).toContain("markFailed");
    expect(runbook).toContain("amountMinor");
    expect(runbook).toContain("/auth/callback");
    expect(runbook).toContain("emailRedirectTo");
    expect(runbook).toContain("exchangeCodeForSession");
    expect(runbook).toContain("503");
    expect(runbook).toContain("requestId");
    expect(runbook).toContain("verify:no-secrets");
    expect(runbook).toContain("STUDIO_IMAGE_DATA_BASE64_MAX_CHARS");
    expect(runbook).toContain("Idempotency-Key");
    expect(runbook).toContain("fail-closed");
    expect(runbook).toContain("rail-temel");
    expect(runbook).toContain("INNGEST_SIGNING_KEY");
    expect(runbook).toContain("studio_digital_assets_data_base64_max_chars");
    expect(runbook).toContain("http_idempotency_records");
    expect(runbook).toContain("academy_lesson_completions");
    expect(runbook).toContain("curriculum_seal");
    expect(runbook).toContain("corporate_job_offers");
    expect(runbook).toContain("docs/07_tedavi_raporu_d3_nihai_muhur.md");
    expect(runbook).toContain("PAYTR_SANDBOX");
    expect(runbook).toContain("PAYTR_ALLOW_MOCK_CHECKOUT");
    expect(runbook).toContain("supabase/storage/studio-assets.sql");
    expect(runbook).toContain("Storage CORS");
    expect(runbook).toContain("NEXT_PUBLIC_APP_URL");
    expect(runbook).toContain("docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md");
    expect(runbook).toContain("docs/07_tedavi_raporu_d3_nihai_muhur.md");
    expect(runbook).not.toContain("phase: \"11\"");
    expect(runbook).not.toContain("dosya yoksa seremoni açık değildir");
  });

  it("kilitli yedi SQL studio-assets taşımaz; seremoni mührü sahte phase yazmaz", () => {
    const opsLib = readSrc("scripts/ops-migrate-lib.ts");
    const ceremony = readSrc("docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md");
    expect(opsLib).toContain("EXPECTED_SQL");
    expect(opsLib).not.toContain("studio-assets.sql");
    expect(opsLib).not.toContain("storage/studio-assets");
    expect(ceremony).toContain("npm run ops:migrate");
    expect(ceremony).toContain("supabase/storage/studio-assets.sql");
    expect(ceremony).toContain("NEXT_PUBLIC_APP_URL");
    expect(ceremony).not.toContain('phase: "11"');
    expect(ceremony).not.toContain("phase: 11");
  });

  it(".env.example Playwright kökenini (E2E_BASE_URL) yazar", () => {
    const example = readSrc(".env.example");
    expect(example).toContain("E2E_BASE_URL");
    expect(example).toContain("docs/07_OPS_RUNBOOK.md");
    expect(readSrc("docs/07_OPS_RUNBOOK.md")).toContain("E2E_BASE_URL");
  });
});

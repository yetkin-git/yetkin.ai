import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogSqlPreservesOperatorPrice } from "../../scripts/ops-migrate-lib";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ESLint boundary ve katalog mühür yüzeyi", () => {
  it("eslint.config.mjs kernel / UI / oda-oda no-restricted-imports taşır", () => {
    const eslint = readSrc("eslint.config.mjs");
    expect(eslint).toContain("no-restricted-imports");
    expect(eslint).toContain("Anayasa §2.8");
    expect(eslint).toContain("lib/kernel");
    expect(eslint).toContain("catalog-write");
    expect(eslint).toContain("display-name-write");
    expect(eslint).toContain("@/lib/kernel/db");
    expect(eslint).toContain("VERTICAL_ROOMS");
    expect(eslint).toContain("yetkin.ai");
    expect(eslint).toContain("components/**/*.{ts,tsx}");
    expect(eslint).toContain("app/api/**");
    expect(eslint).toContain("EARNINGS_WALL");
    expect(eslint).toContain("room.wall");
  });

  it("package.json verify:boundaries prebuild zincirindedir", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["verify:boundaries"]).toBe("tsx scripts/verify-boundaries.ts");
    expect(pkg.scripts["verify:prebuild"]).toContain("verify:boundaries");
    const boundariesAt = pkg.scripts["verify:prebuild"]!.indexOf("verify:boundaries");
    const atomicAt = pkg.scripts["verify:prebuild"]!.indexOf("verify:atomic-seals");
    expect(boundariesAt).toBeGreaterThan(-1);
    expect(atomicAt).toBeGreaterThan(boundariesAt);
  });

  it("UI formları yazma motorunu ve getPrisma'yı çekmez; PATCH API yolunu kullanır", () => {
    const form = readSrc("components/kernel/admin-catalog-amount-form.tsx");
    const profile = readSrc("components/kernel/display-name-form.tsx");
    expect(form).toContain("CATALOG_WRITE_PATH");
    expect(form).toContain('method: "PATCH"');
    expect(form).not.toContain("runCatalogPatch");
    expect(form).not.toContain("getPrisma");
    expect(form).not.toContain("catalog-write");
    expect(form).not.toContain("@/lib/kernel/db");
    expect(profile).toContain("PROFILE_WRITE_PATH");
    expect(profile).not.toContain("runDisplayNamePatch");
    expect(profile).not.toContain("getPrisma");
    expect(profile).not.toContain("display-name-write");
  });

  it("üç katalog tohumu Super Admin amount_minor / updated_by korur", () => {
    const dir = join(ROOT, "supabase", "migrations");
    const files = readdirSync(dir).filter((name) =>
      /price_catalog_definitions|academy_course_seed|freelancer_job_seed/.test(name),
    );
    expect(files).toHaveLength(3);
    for (const file of files) {
      const sql = readFileSync(join(dir, file), "utf8");
      expect(catalogSqlPreservesOperatorPrice(sql), file).toBe(true);
      expect(sql).not.toMatch(/^\s*amount_minor\s*=\s*EXCLUDED\.amount_minor\s*,?\s*$/m);
    }
  });
});

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogSqlPreservesOperatorPrice } from "../../scripts/ops-migrate-lib";
import {
  LIB_SHARED_TOP_DIRS,
  missingRegisteredRoomDirs,
  parseVerticalRoomIdsFromBoundaries,
  parseVerticalRoomIdsFromEslint,
  parseVerticalRoomIdsFromModules,
  unexpectedLibTopDirs,
} from "../../scripts/room-ceiling-lib";
import { VERTICAL_ROOMS } from "@/lib/kernel/rooms.ssot";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ESLint boundary ve katalog mühür yüzeyi", () => {
  it("eslint.config.mjs kernel / UI / oda-oda no-restricted-imports taşır", () => {
    const eslint = readSrc("eslint.config.mjs");
    expect(eslint).toContain("no-restricted-imports");
    expect(eslint).toContain("Anayasa A8");
    expect(eslint).toContain("lib/kernel");
    expect(eslint).toContain("catalog-write");
    expect(eslint).toContain("display-name-write");
    expect(eslint).toContain("@/lib/kernel/db");
    expect(eslint).toContain("VERTICAL_ROOMS");
    expect(eslint).toContain("yetkin.ai");
    expect(eslint).toContain("yetkin.ai/*");
    expect(eslint).toContain("@/yetkin.ai/*");
    expect(eslint).toContain("components/**/*.{ts,tsx}");
    expect(eslint).toContain("app/api/**");
    expect(eslint).toContain("catalog-ids");
    expect(eslint).toContain("EARNINGS_WALL");
    expect(eslint).toContain("room.wall");
  });

  it("VERTICAL_ROOMS rooms.ssot SSOT'tur; lib/ yalnız 4 çalışan oda + paylaşılan katman", () => {
    const ssot = readSrc("lib/kernel/rooms.ssot.ts");
    const eslint = readSrc("eslint.config.mjs");
    const boundaries = readSrc("scripts/verify-boundaries.ts");
    const modules = readSrc("lib/kernel/modules.ts");
    expect(ssot).not.toMatch(/\bphase:\s*\d/);
    expect(VERTICAL_ROOMS.every((room) => !("phase" in room))).toBe(true);
    expect(modules).toContain("rooms.ssot");
    expect(eslint).toContain("rooms.ssot.ts");
    expect(boundaries).toContain("rooms.ssot");
    expect(parseVerticalRoomIdsFromEslint(eslint)).toEqual([]);
    expect(parseVerticalRoomIdsFromModules(modules)).toBeNull();
    expect(parseVerticalRoomIdsFromBoundaries(boundaries)).toBeNull();

    const liveIds = ["dashboard", "academy", "career", "freelancer"];
    const libDirs = readdirSync(join(ROOT, "lib"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(unexpectedLibTopDirs(libDirs, liveIds)).toEqual([]);
    expect(missingRegisteredRoomDirs(libDirs, liveIds)).toEqual([]);
    for (const shared of LIB_SHARED_TOP_DIRS) {
      expect(libDirs, shared).toContain(shared);
    }
    expect(libDirs).not.toContain("studio");
    expect(libDirs).not.toContain("pazaryeri");
    expect(boundaries).toContain("room.ceiling");
    expect(boundaries).toContain("room.sicil");
  });

  it("package.json verify:boundaries grep-seals/nightly kovasındadır; prebuild değil", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["verify:boundaries"]).toBe("tsx scripts/verify-boundaries.ts");
    expect(pkg.scripts["verify:prebuild"]).not.toContain("verify:boundaries");
    expect(pkg.scripts["verify:grep-seals"]).toContain("verify:boundaries");
    expect(pkg.scripts["verify:nightly"]).toContain("verify:grep-seals");
    const grepSeals = pkg.scripts["verify:grep-seals"] ?? "";
    const apiAuthAt = grepSeals.indexOf("verify:api-auth");
    const boundariesAt = grepSeals.indexOf("verify:boundaries");
    const atomicAt = grepSeals.indexOf("verify:atomic-seals");
    expect(apiAuthAt).toBeGreaterThan(-1);
    expect(boundariesAt).toBeGreaterThan(apiAuthAt);
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

  it("müze yetkin_muze git, indeks ve derleme dışında durur", () => {
    const gitignore = readSrc(".gitignore");
    const indexing = readSrc(".cursorindexingignore");
    expect(gitignore).toMatch(/# Müze[\s\S]*yetkin_muze\//);
    expect(indexing).toContain("yetkin_muze/");
    expect(readSrc("next.config.ts")).toContain("yetkin_muze/**");
    expect(readSrc("tsconfig.json")).toContain("yetkin.ai");
    expect(readSrc("vitest.config.ts")).toContain("yetkin_muze/**");
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

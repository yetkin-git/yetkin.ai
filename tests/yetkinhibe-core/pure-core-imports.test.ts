import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

/** F3 saf çekirdek dosyaları: rota, Company, veritabanı veya canlı katalog bağımlılığı taşımazlar. */
const PURE_FILES = [
  "copy.ts",
  "format-amount.ts",
  "grant-fail-closed.ts",
  "match-grants-for-profile.ts",
  "analyze-grant-eligibility-gap.ts",
  "preview-match-score.ts",
  "preview-idea-validator.ts",
  "build-preview-gap-from-criteria.ts",
  "grant-catalog-core.ts",
  "grant-brief-axes.ts",
  "grant-investment-skeleton.ts",
  "grant-project-notes.ts",
  "match-grant-programs-for-brief.ts",
  "types.ts",
] as const;

/** İzinli önekler: yalnız odanın kendi modülleri ve kernel para yardımcıları. */
const ALLOWED_PREFIXES = ["@/lib/yetkinhibe/", "@/lib/kernel/money/"] as const;

function moduleSpecifiers(source: string): string[] {
  const pattern = /\b(?:from|import)\s*\(?\s*"([^"]+)"/g;
  return Array.from(source.matchAll(pattern), (match) => match[1] ?? "");
}

describe("YetkinHibe saf çekirdek — içe aktarım sınırı", () => {
  for (const file of PURE_FILES) {
    it(`${file} yalnız izinli modülleri içe aktarır`, () => {
      const source = readFileSync(join(ROOT, "lib", "yetkinhibe", file), "utf8");

      for (const specifier of moduleSpecifiers(source)) {
        const allowed = ALLOWED_PREFIXES.some((prefix) => specifier.startsWith(prefix));
        expect(allowed, `${file} → ${specifier}`).toBe(true);
      }
    });
  }
});

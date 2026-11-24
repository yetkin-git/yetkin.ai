import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isRobotsDisallowedPath, PAGE_SEO, ROBOTS_DISALLOW_PATHS, SITEMAP_STATIC_PATHS } from "@/lib/copy/seo";
import { isProtectedKernelPath, PROTECTED_KERNEL_PATHS } from "@/lib/kernel/security/edge-guard";
import { buildGrantWizardHref } from "@/lib/yetkinhibe/wizard-navigation";

const ROOT = process.cwd();

const REMOVED = [
  "analyze-grant-eligibility-gap.ts",
  "build-preview-gap-from-criteria.ts",
  "calculate-grant-budget.ts",
  "grant-fail-closed.ts",
] as const;

describe("YetkinHibe Faz 1 vitrin ve ölü kod", () => {
  it("kamu /hibe indekslenir; kokpit /panel/hibe kilitlidir", () => {
    expect(SITEMAP_STATIC_PATHS).toContain(PAGE_SEO.hibe.path);
    expect(PAGE_SEO.hibe.path).toBe("/hibe");
    expect(PAGE_SEO.hibe.keywords).toContain("kosgeb hibe başvuru adımları");
    expect(PROTECTED_KERNEL_PATHS).toContain("/panel/hibe");
    expect(PROTECTED_KERNEL_PATHS).not.toContain("/hibe");
    expect(isProtectedKernelPath("/hibe")).toBe(false);
    expect(isProtectedKernelPath("/panel/hibe")).toBe(true);
    expect(ROBOTS_DISALLOW_PATHS).toContain("/panel/hibe");
    expect(isRobotsDisallowedPath("/hibe")).toBe(false);
    expect(isRobotsDisallowedPath("/panel/hibe")).toBe(true);

    const vitrine = readFileSync(join(ROOT, "app", "(public)", "hibe", "page.tsx"), "utf8");
    expect(vitrine).toContain("index: true");
    expect(vitrine).toContain("faqPageJsonLd");
    const cockpit = readFileSync(join(ROOT, "app", "(kernel)", "panel", "hibe", "page.tsx"), "utf8");
    expect(cockpit).toContain("requirePageSession");
    expect(cockpit).toContain("saveHibeCompanyProfile");
    expect(existsSync(join(ROOT, "app", "(kernel)", "hibe", "page.tsx"))).toBe(false);
  });

  it("ölü modüller ve /yetkinhibe/olustur yolu diskte yoktur", () => {
    for (const file of REMOVED) {
      expect(existsSync(join(ROOT, "lib", "yetkinhibe", file))).toBe(false);
    }
    expect(buildGrantWizardHref({ grantId: "g-1" })).not.toContain("/yetkinhibe/olustur");
    expect(existsSync(join(ROOT, "app", "yetkinhibe", "olustur", "page.tsx"))).toBe(false);
  });
});

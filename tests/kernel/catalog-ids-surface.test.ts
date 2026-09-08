import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_ONBOARDING_COURSE_SLUG,
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_RINGS,
  ACADEMY_COURSE_TITLES,
  ACADEMY_CANON_SKU_SLUGS,
  ACADEMY_NEED_SKU_CODES,
  FREELANCER_LISTING_VISA_DOORS,
  FREELANCER_GUARANTEED_NEED_IDS,
  FREELANCER_MARKETPLACE_NEED_IDS,
  FREELANCER_NEED_IDS,
  FREELANCER_NEED_SKU_CODES,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  ACADEMY_SKU_SLUG_BY_CODE,
  catalogPathwayRingSlugs,
  isAcademyPathwayId,
  isFreelancerNeedId,
  isOpenTrialNeed,
  parseAcademyPathwayId,
} from "@/lib/kernel/catalog-ids";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { ACADEMY_LEVEL_PATHWAYS, academyPathwayRingSlugs } from "@/lib/academy/level-pathway";

const ROOT = process.cwd();

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkTs(full));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

describe("kernel catalog-ids — omurga kimliği", () => {
  it("canlı pathway, SKU ve ihtiyaç kapısı tutarlıdır", () => {
    expect(ACADEMY_PATHWAY_IDS).toEqual([]);
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect(ACADEMY_COURSE_TITLES["01_office_ai"]).toContain("Ofiste Yapay Zekâ");
    expect(FREELANCER_NEED_IDS).toHaveLength(11);
    expect(FREELANCER_GUARANTEED_NEED_IDS).toHaveLength(5);
    expect(FREELANCER_MARKETPLACE_NEED_IDS).toHaveLength(5);
    expect(FREELANCER_LISTING_VISA_DOORS).toHaveLength(11);
    expect(FREELANCER_LISTING_VISA_DOORS).toEqual([...FREELANCER_NEED_IDS]);
    expect(FREELANCER_LISTING_VISA_DOORS.every((id) => isFreelancerNeedId(id))).toBe(true);
    expect(FREELANCER_MARKETPLACE_NEED_IDS.every((id) => isOpenTrialNeed(id))).toBe(true);
    expect(isOpenTrialNeed("excel-veri-otomasyon")).toBe(false);
    expect(isFreelancerNeedId(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY)).toBe(true);
    expect(isAcademyPathwayId(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY)).toBe(false);
    expect(parseAcademyPathwayId("yok")).toBeNull();
    expect(ACADEMY_NEED_SKU_CODES).toHaveLength(5);
    expect(new Set(Object.values(ACADEMY_SKU_SLUG_BY_CODE)).size).toBe(5);
    expect(ACADEMY_SKU_SLUG_BY_CODE["OFF-101"]).toBe("01_office_ai");
    expect(ACADEMY_SKU_SLUG_BY_CODE["EC-102"]).toBe("02_ecommerce_ai");
    expect(ACADEMY_SKU_SLUG_BY_CODE["SM-103"]).toBe("03_social_media_ai");
    expect(ACADEMY_SKU_SLUG_BY_CODE["BOT-104"]).toBe("04_chatbot_nocode");
    expect(ACADEMY_SKU_SLUG_BY_CODE["PR-105"]).toBe("05_prompt_practice");
    expect(ACADEMY_ONBOARDING_COURSE_SLUG).toBeNull();
    expect([...ACADEMY_GROWTH_SKU_SLUGS].every((slug) => slug in ACADEMY_COURSE_TITLES)).toBe(true);
    expect(ACADEMY_GROWTH_SKU_SLUGS).toHaveLength(5);
    expect(Object.values(ACADEMY_SKU_SLUG_BY_CODE).every((slug) =>
      (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(slug),
    )).toBe(true);
    for (const needId of FREELANCER_NEED_IDS) {
      for (const code of FREELANCER_NEED_SKU_CODES[needId]) {
        expect(ACADEMY_SKU_SLUG_BY_CODE[code]).toBeTruthy();
      }
    }
  });

  it("akademi yol haritası kimliği kernel sicilinden türer", () => {
    expect(ACADEMY_LEVEL_PATHWAYS.map((row) => row.id)).toEqual([...ACADEMY_PATHWAY_IDS]);
    for (const row of ACADEMY_LEVEL_PATHWAYS) {
      expect(row.rings).toEqual({ ...ACADEMY_PATHWAY_RINGS[row.id] });
      expect(academyPathwayRingSlugs(row)).toEqual(catalogPathwayRingSlugs(row.id));
    }
  });

  it("kariyer ve freelancer lib/academy import etmez", () => {
    for (const room of ["career", "freelancer"] as const) {
      for (const file of walkTs(join(ROOT, "lib", room))) {
        const source = readFileSync(file, "utf8");
        expect(source, file).not.toMatch(/from\s+["']@\/lib\/academy(?:\/[^"']*)?["']/);
      }
    }
  });

  it("STORAGE_CONTRACT akademi lesson-audios istisnasını yazar; Studio 410 kalır", () => {
    const systemDocs = join(ROOT, ".system_docs");
    const contract = readFileSync(join(systemDocs, "STORAGE_CONTRACT.md"), "utf8");
    expect(contract).toContain("lesson-audios");
    expect(contract).toContain("AcademyAudioCache");
    expect(contract).toContain("410");
    expect(contract).not.toMatch(/^# STORAGE_CONTRACT — bu fazda nesne depo yok/m);
    expect(statSync(join(ROOT, "lib/kernel/catalog-ids/index.ts")).isFile()).toBe(true);
  });
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_ONBOARDING_COURSE_SLUG,
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_RINGS,
  FREELANCER_LISTING_VISA_DOORS,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  catalogPathwayRingSlugs,
  isAcademyPathwayId,
  parseAcademyPathwayId,
} from "@/lib/kernel/catalog-ids";
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
  it("28 pathway id ve 5 ilan kapısı tutarlıdır", () => {
    expect(ACADEMY_PATHWAY_IDS).toHaveLength(28);
    expect(FREELANCER_LISTING_VISA_DOORS).toHaveLength(5);
    expect(FREELANCER_LISTING_VISA_DOORS.every((id) => isAcademyPathwayId(id))).toBe(true);
    expect(isAcademyPathwayId(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY)).toBe(true);
    expect(parseAcademyPathwayId("yok")).toBeNull();
    expect(ACADEMY_ONBOARDING_COURSE_SLUG).toBeNull();
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

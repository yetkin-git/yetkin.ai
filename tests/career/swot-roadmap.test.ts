import { describe, expect, it } from "vitest";
import { buildCareerRoadmap } from "@/lib/career/roadmap";
import { buildCareerSwot } from "@/lib/career/swot";
import { perCreditMinor } from "@/lib/tezgah/paid-lane";
import { opportunityForInstant } from "@/lib/matchmaking/opportunity-pool";

describe("kariyer SWOT ve yol", () => {
  it("rozet ve tezgâh geçmişinden kadran yazar, puan basmaz", () => {
    const swot = buildCareerSwot({
      stampTitles: ["Ofis Yapay Zekâ"],
      certificateTitles: ["Ofis Yapay Zekâ"],
      tezgahToolCounts: { proposal: 2 },
    });
    const text = JSON.stringify(swot);
    expect(text).toContain("Ofis Yapay Zekâ");
    expect(text).not.toMatch(/merit|liyakat puan|LP/i);
    expect(swot.strengths.length).toBeGreaterThan(0);
    expect(swot.weaknesses.some((row) => row.id === "no-stamp")).toBe(false);
  });

  it("kanıt yokken 90. gün dizine göndermez", () => {
    const roadmap = buildCareerRoadmap({
      stampTitles: [],
      certificateTitles: [],
      tezgahToolCounts: {},
    });
    expect(roadmap.map((row) => row.id)).toEqual(["d30", "d60", "d90"]);
    expect(roadmap[2]?.href).toBe("/hibe");
  });
});

describe("tezgâh kredi bölünmesi", () => {
  it("10'a bölünmeyen paket tutarını kapatır", () => {
    expect(perCreditMinor(1000)).toBe(100);
    expect(perCreditMinor(1001)).toBeNull();
    expect(perCreditMinor(0)).toBeNull();
  });
});

describe("fırsat havuzu", () => {
  it("aynı anda aynı fırsatı seçer", () => {
    const now = new Date("2026-11-18T09:00:00+03:00");
    const first = opportunityForInstant(now);
    const second = opportunityForInstant(now);
    expect(first.slug).toBe(second.slug);
    expect(first.title.length).toBeGreaterThan(2);
  });
});

import { describe, expect, it } from "vitest";
import { DronBayrakları } from "@/lib/dronlar/kayit";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";
import {
  JUNIOR_SCHOOL_SEGMENT,
  YOUNG_REGISTER_LINE,
  YOUNG_SCHOOL_SEGMENT,
  YOUNG_SUBJECTS,
  schoolSegmentForGrade,
} from "@/lib/kernel/catalog-ids/school-segments";
import { isDronYoungOpen } from "@/lib/kernel/security/young-gate";
import { JUNIOR_GRADE_MAX, JUNIOR_GRADE_MIN } from "@/lib/junior/limits";
import { juniorPersonaLine } from "@/lib/junior/persona";

describe("Young lise segmenti", () => {
  it("ortaokul 5–8, lise 9–12 ve YKS, yaş 15–18", () => {
    expect(JUNIOR_SCHOOL_SEGMENT.grades).toEqual([5, 6, 7, 8]);
    expect(JUNIOR_GRADE_MIN).toBe(5);
    expect(JUNIOR_GRADE_MAX).toBe(8);
    expect(YOUNG_SCHOOL_SEGMENT.grades).toEqual([9, 10, 11, 12]);
    expect(YOUNG_SCHOOL_SEGMENT.tracks).toEqual(["grade", "yks"]);
    expect(YOUNG_SCHOOL_SEGMENT.ageMin).toBe(15);
    expect(YOUNG_SCHOOL_SEGMENT.ageMax).toBe(18);
    expect(YOUNG_SUBJECTS.map((subject) => subject.label)).toEqual([
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Edebiyat",
      "Tarih",
      "Coğrafya",
    ]);
    expect(schoolSegmentForGrade(8)).toBe("JUNIOR");
    expect(schoolSegmentForGrade(9)).toBe("YOUNG");
    expect(schoolSegmentForGrade(12)).toBe("YOUNG");
    expect(schoolSegmentForGrade(4)).toBeNull();
  });

  it("15–18 üslubu Young kaydından okunur", () => {
    expect(juniorPersonaLine(2009, new Date("2026-10-10T12:00:00+03:00"))).toBe(YOUNG_REGISTER_LINE);
    expect(YOUNG_REGISTER_LINE).toContain("genç yetişkin saygısında");
  });

  it("DRON_YOUNG_OPEN kapalıyken /young 410, açıkken raf yolu donmaz", () => {
    const previous = process.env.DRON_YOUNG_OPEN;
    try {
      delete process.env.DRON_YOUNG_OPEN;
      expect(isDronYoungOpen()).toBe(false);
      expect(DronBayrakları.isKapali("young")).toBe(true);
      expect(isFrozenShellPagePath("/young")).toBe(true);
      process.env.DRON_YOUNG_OPEN = "open";
      expect(isDronYoungOpen()).toBe(true);
      expect(DronBayrakları.isKapali("young")).toBe(false);
      expect(isFrozenShellPagePath("/young")).toBe(false);
    } finally {
      if (previous === undefined) {
        delete process.env.DRON_YOUNG_OPEN;
      } else {
        process.env.DRON_YOUNG_OPEN = previous;
      }
    }
  });
});

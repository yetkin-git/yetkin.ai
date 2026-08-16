import { describe, expect, it } from "vitest";
import {
  academyCurriculumSealForSlug,
  academyCurriculumSealFromCompletions,
  orderedAcademyLessonKeys,
  orderedCompletedAcademyLessonKeys,
} from "@/lib/academy/curriculum";
import {
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  ACADEMY_CURRICULUM_SEAL_VERSION,
  computeAcademyCertificateHash,
  computeAcademyCurriculumSeal,
} from "@/lib/academy/exam";

describe("akademi müfredat mühürü (curriculumSeal)", () => {
  it("sıralı ders anahtarlarından deterministik SHA256 basar", () => {
    const keys = orderedAcademyLessonKeys("rail-temel");
    expect(keys).toEqual(["rail-temel-1", "rail-temel-2", "rail-temel-3"]);
    const seal = computeAcademyCurriculumSeal(keys);
    expect(seal).toMatch(/^[a-f0-9]{64}$/);
    expect(academyCurriculumSealForSlug("rail-temel")).toBe(seal);
    expect(computeAcademyCurriculumSeal(keys)).toBe(seal);
    expect(ACADEMY_CURRICULUM_SEAL_VERSION).toBe("yetkin-rail.academy.curriculum.v1");
  });

  it("eksik veya sırası bozulmuş anahtar farklı mühür üretir; tamamlanmamış küme basılmaz", () => {
    const full = computeAcademyCurriculumSeal(orderedAcademyLessonKeys("rail-temel"));
    const skipped = computeAcademyCurriculumSeal(["rail-temel-1", "rail-temel-3"]);
    const reordered = computeAcademyCurriculumSeal(["rail-temel-2", "rail-temel-1", "rail-temel-3"]);
    const otherSku = academyCurriculumSealForSlug("rayli-sinyal-emniyet");
    expect(skipped).not.toBe(full);
    expect(reordered).not.toBe(full);
    expect(otherSku).not.toBe(full);
    expect(academyCurriculumSealFromCompletions("rail-temel", ["rail-temel-1"])).toBeNull();
    expect(
      academyCurriculumSealFromCompletions("rail-temel", [
        "rail-temel-1",
        "rail-temel-2",
        "rail-temel-3",
      ]),
    ).toBe(full);
    expect(
      orderedCompletedAcademyLessonKeys("rail-temel", ["rail-temel-3", "rail-temel-1", "ghost"]),
    ).toEqual(["rail-temel-1", "rail-temel-3"]);
    expect(() => computeAcademyCurriculumSeal([])).toThrow(/boş ders/);
  });

  it("sertifika hash'i curriculumSeal değişince düşer; v2 payload mühürü taşır", () => {
    const now = new Date("2026-08-16T00:00:00.000Z");
    const railSeal = academyCurriculumSealForSlug("rail-temel")!;
    const otherSeal = academyCurriculumSealForSlug("rayli-sinyal-emniyet")!;
    const base = {
      userId: "buyer",
      courseId: "course-1",
      attemptId: "attempt-1",
      score: 100,
      issuedAt: now,
    };
    const withRail = computeAcademyCertificateHash({ ...base, curriculumSeal: railSeal });
    const withOther = computeAcademyCertificateHash({ ...base, curriculumSeal: otherSeal });
    expect(withRail).toMatch(/^[a-f0-9]{64}$/);
    expect(withOther).not.toBe(withRail);
    expect(ACADEMY_CERTIFICATE_PAYLOAD_VERSION).toBe("yetkin-rail.academy.certificate.v2");
  });
});

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
  it("Pilot SKU müfredat mührü kilitli SHA-256 basar", () => {
    const keys = orderedAcademyLessonKeys("python-temel");
    expect(keys).toHaveLength(12);
    expect(keys[0]).toBe("python-temel-1");
    const seal = academyCurriculumSealForSlug("python-temel");
    expect(seal).toMatch(/^[a-f0-9]{64}$/);
    expect(seal).toBe(computeAcademyCurriculumSeal(keys));
  });

  it("sıralı ders anahtarlarından deterministik SHA256 basar", () => {
    const keys = orderedAcademyLessonKeys("python-temel");
    expect(keys).toEqual([
      "python-temel-1",
      "python-temel-2",
      "python-temel-3",
      "python-temel-4",
      "python-temel-5",
      "python-temel-6",
      "python-temel-7",
      "python-temel-8",
      "python-temel-9",
      "python-temel-10",
      "python-temel-11",
      "python-temel-12",
    ]);
    const seal = computeAcademyCurriculumSeal(keys);
    expect(seal).toMatch(/^[a-f0-9]{64}$/);
    expect(academyCurriculumSealForSlug("python-temel")).toBe(seal);
    expect(computeAcademyCurriculumSeal(keys)).toBe(seal);
    expect(ACADEMY_CURRICULUM_SEAL_VERSION).toBe("yetkin-rail.academy.curriculum.v1");
  });

  it("eksik veya sırası bozulmuş anahtar farklı mühür üretir; tamamlanmamış küme basılmaz", () => {
    const keys = orderedAcademyLessonKeys("python-temel");
    const full = computeAcademyCurriculumSeal(keys);
    const skipped = computeAcademyCurriculumSeal(["python-temel-1", "python-temel-3"]);
    const reordered = computeAcademyCurriculumSeal([
      "python-temel-2",
      "python-temel-1",
      "python-temel-3",
      "python-temel-4",
      "python-temel-5",
      "python-temel-6",
    ]);
    expect(skipped).not.toBe(full);
    expect(reordered).not.toBe(full);
    expect(academyCurriculumSealForSlug("devops-temel")).toBeNull();
    expect(academyCurriculumSealFromCompletions("python-temel", ["python-temel-1"])).toBeNull();
    expect(academyCurriculumSealFromCompletions("python-temel", keys)).toBe(full);
    expect(
      orderedCompletedAcademyLessonKeys("python-temel", ["python-temel-3", "python-temel-1", "ghost"]),
    ).toEqual(["python-temel-1", "python-temel-3"]);
    expect(() => computeAcademyCurriculumSeal([])).toThrow(/boş ders/);
  });

  it("sertifika hash'i curriculumSeal değişince düşer; v2 payload mühürü taşır", () => {
    const now = new Date("2026-08-16T00:00:00.000Z");
    const pythonSeal = academyCurriculumSealForSlug("python-temel")!;
    const otherSeal = computeAcademyCurriculumSeal(["python-temel-1"]);
    const base = {
      userId: "buyer",
      courseId: "course-1",
      attemptId: "attempt-1",
      score: 100,
      issuedAt: now,
    };
    const withPython = computeAcademyCertificateHash({ ...base, curriculumSeal: pythonSeal });
    const withOther = computeAcademyCertificateHash({ ...base, curriculumSeal: otherSeal });
    expect(withPython).toMatch(/^[a-f0-9]{64}$/);
    expect(withOther).not.toBe(withPython);
    expect(ACADEMY_CERTIFICATE_PAYLOAD_VERSION).toBe("yetkin-rail.academy.certificate.v2");
  });
});

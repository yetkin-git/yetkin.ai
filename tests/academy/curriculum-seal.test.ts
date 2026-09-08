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

const FIXTURE_KEYS = ["lesson-a", "lesson-b", "lesson-c"] as const;

describe("akademi müfredat mühürü (curriculumSeal)", () => {
  it("boş yayın müfredatı mühür basmaz; sentetik anahtarlar SHA-256 basar", () => {
    expect(orderedAcademyLessonKeys("sample-course")).toEqual([]);
    expect(academyCurriculumSealForSlug("sample-course")).toBeNull();
    const seal = computeAcademyCurriculumSeal(FIXTURE_KEYS);
    expect(seal).toMatch(/^[a-f0-9]{64}$/);
    expect(seal).toBe(computeAcademyCurriculumSeal([...FIXTURE_KEYS]));
  });

  it("sıralı ders anahtarlarından deterministik SHA256 basar", () => {
    const seal = computeAcademyCurriculumSeal(FIXTURE_KEYS);
    expect(seal).toMatch(/^[a-f0-9]{64}$/);
    expect(computeAcademyCurriculumSeal(FIXTURE_KEYS)).toBe(seal);
    expect(ACADEMY_CURRICULUM_SEAL_VERSION).toBe("yetkin-rail.academy.curriculum.v1");
  });

  it("eksik veya sırası bozulmuş anahtar farklı mühür üretir; tamamlanmamış küme basılmaz", () => {
    const full = computeAcademyCurriculumSeal(FIXTURE_KEYS);
    const skipped = computeAcademyCurriculumSeal(["lesson-a", "lesson-c"]);
    const reordered = computeAcademyCurriculumSeal(["lesson-b", "lesson-a", "lesson-c"]);
    expect(skipped).not.toBe(full);
    expect(reordered).not.toBe(full);
    expect(academyCurriculumSealForSlug("devops-temel")).toBeNull();
    expect(academyCurriculumSealFromCompletions("sample-course", ["lesson-a"])).toBeNull();
    expect(
      orderedCompletedAcademyLessonKeys("sample-course", ["lesson-c", "lesson-a", "ghost"]),
    ).toEqual([]);
    expect(() => computeAcademyCurriculumSeal([])).toThrow(/boş ders/);
  });

  it("sertifika hash'i curriculumSeal değişince düşer; v2 payload mühürü taşır", () => {
    const now = new Date("2026-08-16T00:00:00.000Z");
    const fixtureSeal = computeAcademyCurriculumSeal(FIXTURE_KEYS);
    const otherSeal = computeAcademyCurriculumSeal(["lesson-a"]);
    const base = {
      userId: "buyer",
      courseId: "course-1",
      attemptId: "attempt-1",
      score: 100,
      issuedAt: now,
    };
    const withFixture = computeAcademyCertificateHash({ ...base, curriculumSeal: fixtureSeal });
    const withOther = computeAcademyCertificateHash({ ...base, curriculumSeal: otherSeal });
    expect(withFixture).toMatch(/^[a-f0-9]{64}$/);
    expect(withOther).not.toBe(withFixture);
    expect(ACADEMY_CERTIFICATE_PAYLOAD_VERSION).toBe("yetkin-rail.academy.certificate.v2");
  });
});

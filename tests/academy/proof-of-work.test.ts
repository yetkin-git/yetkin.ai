import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { isAcademyCompactLessonKey } from "@/lib/academy/pilot-sku";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  ACADEMY_PROOF_OF_WORK_VERSION,
  academyCanonicalProofSubmission,
  academyInteractiveTaskByKey,
  canonicalAcademyProofOfWorkHash,
  evaluateAcademyProofSubmission,
  listAcademyInteractiveTaskKeys,
} from "@/lib/academy/proof-of-work";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { completeAcademyLessonInputSchema } from "@/lib/academy/schemas";

describe("akademi fail-closed iş kanıtı — compact yayın", () => {
  it("HTTP tamamlama şeması proof gövdesini isteğe bağlı tutar", () => {
    expect(completeAcademyLessonInputSchema.safeParse({ lessonKey: "sample-course-1" }).success).toBe(
      true,
    );
  });

  it("amiral compact müfredatta etkileşimli görev kümesi boştur", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    const curriculumKeys = new Set<string>();
    for (const row of ACADEMY_COURSE_SEEDS) {
      for (const lesson of curriculumForCourseSlug(row.slug)) {
        curriculumKeys.add(lesson.key);
        expect(academyInteractiveTaskByKey(lesson.key)).toBeNull();
      }
    }
    expect(curriculumKeys.size).toBe(ACADEMY_COURSE_SEEDS.length * 6);
    expect(listAcademyInteractiveTaskKeys().length).toBe(Object.keys(LESSON_PRACTICE).length);
    expect(ACADEMY_PROOF_OF_WORK_VERSION).toBe("yetkin-rail.academy.proof-of-work.v1");
    expect(academyInteractiveTaskByKey("sample-course-1")).toBeNull();
    expect(academyCanonicalProofSubmission("sample-course-1")).toBeNull();
    expect(isAcademyCompactLessonKey("01_office_ai-1")).toBe(true);
    expect(canonicalAcademyProofOfWorkHash("01_office_ai-1", sha256Hex)).toMatch(/^[a-f0-9]{64}$/);
    expect(
      evaluateAcademyProofSubmission("sample-course-1", { kind: "param-lock", slots: {} }).ok,
    ).toBe(false);
  });
});

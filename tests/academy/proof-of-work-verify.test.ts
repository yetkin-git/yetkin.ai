import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
  ACADEMY_PROOF_OF_WORK_VERSION,
  academyCanonicalProofSubmission,
  academyInteractiveTaskByKey,
  evaluateAcademyProofSubmission,
  listAcademyInteractiveTaskKeys,
} from "@/lib/academy/proof-of-work";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { completeAcademyLessonInputSchema } from "@/lib/academy/schemas";
import {
  canonicalAcademyCurriculumProofHash,
  resolvePublicAcademyProofOfWork,
} from "@/lib/academy/proof-of-work-verify";
import { encodeAcademyQrMatrix } from "@/lib/academy/qr-matrix";
import { academyVerifyUrl } from "@/lib/academy/lesson-note-paths";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { createMemoryAcademyStore } from "../helpers/memory-academy";

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
    expect(evaluateAcademyProofSubmission("sample-course-1", { kind: "param-lock", slots: {} }).ok).toBe(
      false,
    );
  });
});

describe("akademi iş kanıtı kamu doğrulama — compact yayın", () => {
  it("sentetik slugda ders/müfredat hash sicili yoktur", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(canonicalAcademyCurriculumProofHash("sample-course")).toBeNull();
    expect(resolvePublicAcademyProofOfWork("not-a-hash")).toEqual({ status: "invalid-format" });
    expect(resolvePublicAcademyProofOfWork("a".repeat(64))).toEqual({ status: "missing" });
  });

  it("sertifika sicili boşken biçimsiz hash missing kalır", async () => {
    const store = createMemoryAcademyStore();
    await expect(resolvePublicAcademyCertificate(store, "a".repeat(64))).resolves.toMatchObject({
      status: "missing",
    });
  });

  it("doğrulama URL'si QR ızgarası basar", () => {
    const matrix = encodeAcademyQrMatrix(academyVerifyUrl("a".repeat(64)));
    expect(matrix).not.toBeNull();
    expect(matrix!.size).toBeGreaterThan(20);
    expect(matrix!.modules.some((row) => row.includes(true))).toBe(true);
    expect(ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test("a".repeat(64))).toBe(true);
    void sha256Hex;
  });
});

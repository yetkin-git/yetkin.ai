import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  ACADEMY_PROOF_OF_WORK_HASH_PATTERN,
  academyInteractiveTaskByKey,
  canonicalAcademyProofOfWorkHash,
} from "@/lib/academy/proof-of-work";
import {
  canonicalAcademyCurriculumProofHash,
  resolvePublicAcademyProofOfWork,
} from "@/lib/academy/proof-of-work-verify";
import { encodeAcademyQrMatrix } from "@/lib/academy/qr-matrix";
import { academyVerifyUrl } from "@/lib/academy/lesson-note-paths";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { createMemoryAcademyStore } from "../helpers/memory-academy";

describe("akademi iş kanıtı kamu doğrulama", () => {
  it("Matrix müfredat iş kanıtı hash'leri benzersizdir ve tohumdan doğrulanır", () => {
    const keys = ACADEMY_COURSE_SEEDS.flatMap((row) =>
      curriculumForCourseSlug(row.slug)
        .map((lesson) => lesson.key)
        .filter((key) => academyInteractiveTaskByKey(key) != null),
    );
    expect(keys.length).toBe(48);
    const hashes = new Set<string>();
    for (const lessonKey of keys) {
      const hash = canonicalAcademyProofOfWorkHash(lessonKey, sha256Hex);
      expect(hash, lessonKey).toMatch(ACADEMY_PROOF_OF_WORK_HASH_PATTERN);
      expect(hashes.has(hash!), lessonKey).toBe(false);
      hashes.add(hash!);
      const resolution = resolvePublicAcademyProofOfWork(hash!);
      expect(resolution.status, lessonKey).toBe("found");
      if (resolution.status !== "found") {
        continue;
      }
      expect(resolution.view.kind).toBe("lesson");
      expect(resolution.view.hashSubjectKind).toBe("canonical-task");
      expect(resolution.view.lessonKey).toBe(lessonKey);
      expect(JSON.stringify(resolution.view)).not.toContain("userId");
      expect(JSON.stringify(resolution.view)).not.toContain("purchaseId");
    }
    expect(hashes.size).toBe(keys.length);
  });

  it("müfredat iş kanıtı hash'i ders özetlerinden ayrılır", () => {
    const hash = canonicalAcademyCurriculumProofHash("python-temel");
    expect(hash).toMatch(ACADEMY_PROOF_OF_WORK_HASH_PATTERN);
    const resolution = resolvePublicAcademyProofOfWork(hash!);
    expect(resolution).toMatchObject({
      status: "found",
      view: {
        kind: "curriculum",
        courseSlug: "python-temel",
        sealStatus: "valid",
        hashSubjectKind: "canonical-task",
      },
    });
    const lesson = canonicalAcademyProofOfWorkHash("python-temel-1", sha256Hex);
    expect(lesson).not.toBe(hash);
  });

  it("biçimsiz ve sicilde olmayan hash dürüst kapanır", () => {
    expect(resolvePublicAcademyProofOfWork("not-a-hash")).toEqual({ status: "invalid-format" });
    expect(resolvePublicAcademyProofOfWork("a".repeat(64))).toEqual({ status: "missing" });
  });

  it("sertifika sicili boşken iş kanıtı yine çözülür", async () => {
    const hash = canonicalAcademyProofOfWorkHash("python-temel-1", sha256Hex)!;
    const store = createMemoryAcademyStore();
    await expect(resolvePublicAcademyCertificate(store, hash)).resolves.toMatchObject({
      status: "missing",
    });
    expect(resolvePublicAcademyProofOfWork(hash).status).toBe("found");
  });

  it("doğrulama URL'si QR ızgarası basar", () => {
    const hash = canonicalAcademyProofOfWorkHash("python-temel-1", sha256Hex)!;
    const matrix = encodeAcademyQrMatrix(academyVerifyUrl(hash));
    expect(matrix.size).toBeGreaterThan(20);
    expect(matrix.modules.some((row) => row.includes(true))).toBe(true);
  });
});

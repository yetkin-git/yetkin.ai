/**
 * Kamuya açık iş kanıtı doğrulama — tohumdan SHA-256 yeniden üretilir.
 * Overlay / Prisma kolonu gerekmez. userId sızmaz.
 */

import { parseSha256Hex, sha256Hex } from "@/lib/kernel/crypto/sha256";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import {
  ACADEMY_CURRICULUM_PROOF_VERSION,
  ACADEMY_PROOF_INTEGRITY_KIND,
  ACADEMY_PROOF_OF_WORK_VERSION,
  academyCurriculumProofCanonicalJson,
  academyInteractiveTaskByKey,
  academyLessonProofHashList,
  academyProofOfWorkHash,
  type AcademyProofKind,
} from "@/lib/academy/proof-of-work";
import {
  academyCurriculumSealForSlug,
  academyLessonByKey,
  orderedAcademyLessonKeys,
} from "@/lib/academy/curriculum";

export const ACADEMY_PROOF_HASHED_FIELDS = ["ders anahtarı", "görev başarı parametreleri"] as const;
export const ACADEMY_CURRICULUM_PROOF_HASHED_FIELDS = [
  "kurs anahtarı",
  "ders iş kanıtları",
  "müfredat mühürü",
] as const;

export type AcademyHashSubjectKind = "person-certificate" | "canonical-task";

export type PublicAcademyProofView = {
  kind: "lesson" | "curriculum";
  title: string;
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string | null;
  lessonKey: string | null;
  instructorName: string;
  proofOfWorkHash: string;
  curriculumSeal: string | null;
  taskKind: AcademyProofKind | null;
  algorithm: "SHA256";
  integrityKind: typeof ACADEMY_PROOF_INTEGRITY_KIND;
  payloadVersion: string;
  hashedFields: readonly string[];
  sealStatus: "valid";
  hashSubjectKind: "canonical-task";
};

export type PublicAcademyProofResolution =
  | { status: "invalid-format" }
  | { status: "missing" }
  | { status: "found"; view: PublicAcademyProofView };

type LessonIndexRow = {
  hash: string;
  lessonKey: string;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
  instructorName: string;
  taskKind: AcademyProofKind;
  curriculumSeal: string | null;
};

type CurriculumIndexRow = {
  hash: string;
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  curriculumSeal: string;
};

let lessonIndex: Map<string, LessonIndexRow> | null = null;
let curriculumIndex: Map<string, CurriculumIndexRow> | null = null;

function ensureIndexes() {
  if (lessonIndex && curriculumIndex) {
    return;
  }
  lessonIndex = new Map();
  curriculumIndex = new Map();
  for (const course of ACADEMY_CATALOG_SEEDS) {
    const keys = orderedAcademyLessonKeys(course.slug);
    const hashes = academyLessonProofHashList(keys, sha256Hex);
    const seal = academyCurriculumSealForSlug(course.slug);
    const instructor = academyInstructorBySlug(course.slug);
    if (!hashes || !seal) {
      continue;
    }
    keys.forEach((lessonKey, index) => {
      const lesson = academyLessonByKey(course.slug, lessonKey);
      const task = academyInteractiveTaskByKey(lessonKey);
      const hash = hashes[index];
      if (!lesson || !task || !hash) {
        return;
      }
      lessonIndex!.set(hash, {
        hash,
        lessonKey,
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonTitle: lesson.title,
        instructorName: instructor.name,
        taskKind: task.kind,
        curriculumSeal: seal,
      });
    });
    const curriculumHash = academyProofOfWorkHash(
      academyCurriculumProofCanonicalJson({
        slug: course.slug,
        lessonHashes: hashes,
        curriculumSeal: seal,
      }),
      sha256Hex,
    );
    curriculumIndex.set(curriculumHash, {
      hash: curriculumHash,
      courseSlug: course.slug,
      courseTitle: course.title,
      instructorName: instructor.name,
      curriculumSeal: seal,
    });
  }
}

export function canonicalAcademyCurriculumProofHash(slug: string): string | null {
  ensureIndexes();
  for (const row of curriculumIndex!.values()) {
    if (row.courseSlug === slug) {
      return row.hash;
    }
  }
  return null;
}

export function resolvePublicAcademyProofOfWork(rawHash: string): PublicAcademyProofResolution {
  const hash = parseSha256Hex(rawHash);
  if (!hash) {
    return { status: "invalid-format" };
  }
  ensureIndexes();
  const lesson = lessonIndex!.get(hash);
  if (lesson) {
    return {
      status: "found",
      view: {
        kind: "lesson",
        title: lesson.lessonTitle,
        courseTitle: lesson.courseTitle,
        courseSlug: lesson.courseSlug,
        lessonTitle: lesson.lessonTitle,
        lessonKey: lesson.lessonKey,
        instructorName: lesson.instructorName,
        proofOfWorkHash: lesson.hash,
        curriculumSeal: lesson.curriculumSeal,
        taskKind: lesson.taskKind,
        algorithm: "SHA256",
        integrityKind: ACADEMY_PROOF_INTEGRITY_KIND,
        payloadVersion: ACADEMY_PROOF_OF_WORK_VERSION,
        hashedFields: ACADEMY_PROOF_HASHED_FIELDS,
        sealStatus: "valid",
        hashSubjectKind: "canonical-task",
      },
    };
  }
  const curriculum = curriculumIndex!.get(hash);
  if (curriculum) {
    return {
      status: "found",
      view: {
        kind: "curriculum",
        title: curriculum.courseTitle,
        courseTitle: curriculum.courseTitle,
        courseSlug: curriculum.courseSlug,
        lessonTitle: null,
        lessonKey: null,
        instructorName: curriculum.instructorName,
        proofOfWorkHash: curriculum.hash,
        curriculumSeal: curriculum.curriculumSeal,
        taskKind: null,
        algorithm: "SHA256",
        integrityKind: ACADEMY_PROOF_INTEGRITY_KIND,
        payloadVersion: ACADEMY_CURRICULUM_PROOF_VERSION,
        hashedFields: ACADEMY_CURRICULUM_PROOF_HASHED_FIELDS,
        sealStatus: "valid",
        hashSubjectKind: "canonical-task",
      },
    };
  }
  return { status: "missing" };
}

export const MODULE_ID = "academy" as const;

/** Faz 9 + D2.1 — satın al = öğrenme kaydı; müfredat oynatıcı; ustalık belgesi sınav kapısıdır (S58-A). */
export const ACADEMY_HAPPY_PATH = [
  "catalog",
  "price-lock",
  "settle",
  "curriculum",
  "exam",
  "certificate",
] as const;

export type AcademyHappyPathStep = (typeof ACADEMY_HAPPY_PATH)[number];

export { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
export { ACADEMY_COURSE_SEEDS, ACADEMY_SEED_MODULE_KEY } from "@/lib/academy/seed";
export { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
export { submitAcademyExam, loadPublicAcademyExam } from "@/lib/academy/exam-engine";
export {
  completeAcademyCurriculum,
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
export { curriculumForCourseSlug, isAcademyCurriculumComplete, academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
export {
  resolvePublicAcademyCertificate,
  toPublicAcademyCertificateWire,
} from "@/lib/academy/certificate-verify";
export {
  ACADEMY_EXAM_PASS_SCORE,
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  ACADEMY_CURRICULUM_SEAL_VERSION,
  computeAcademyCurriculumSeal,
  parseAcademyCertificateHash,
  verifyAcademyCertificateHash,
} from "@/lib/academy/exam";
export { purchaseCourseInputSchema, submitAcademyExamInputSchema, completeAcademyLessonInputSchema } from "@/lib/academy/schemas";
export type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamRecord,
  AcademyPulse,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";


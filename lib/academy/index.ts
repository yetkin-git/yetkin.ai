export const MODULE_ID = "academy" as const;

/**
 * Faz 9 + D2.1 — satın al = SETTLED erişim.
 * Dürüst iki kapı: (a) müfredat oynatıcı → sınav, (b) doğrudan sınav/vize (70+).
 * Ustalık belgesi yalnız sınav kapısından basılır (S58-A).
 */
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
export { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
export { submitAcademyExam, loadAcademyExam, loadAcademyExamGateStatus } from "@/lib/academy/exam-engine";
export {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_SEED_MODULE_KEY,
  ACADEMY_SEED_COURSE_IDS,
  ACADEMY_SEED_CATALOG_UNITS,
} from "@/lib/academy/seed";
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
export {
  ACADEMY_CARD_OFFER_PATHS,
  academyCardOfferPaths,
  academyPurchaseSuccessHref,
  isAcademyPurchasePath,
} from "@/lib/academy/purchase-path";
export type { AcademyPurchasePath, AcademyCardOfferPath } from "@/lib/academy/purchase-path";
export {
  ACADEMY_LEVEL_PRICE_BANDS,
  ACADEMY_COURSE_LEVELS,
  resolveAcademySeedMoney,
} from "@/lib/academy/course-level";
export type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamRecord,
  AcademyPulse,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";


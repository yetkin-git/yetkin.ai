export const MODULE_ID = "academy" as const;

/**
 * Faz 9 + D2.1 — satın al = SETTLED erişim.
 * Sınav kapısı müfredat tamamını ister; doğrudan atlama API'de kapalıdır.
 * Ustalık belgesi yalnız sınav kapısından basılır (S58-A, baraj 70).
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
export {
  ACADEMY_AI_COURSE_DURATION_MAX_MINUTES,
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_COUNT_MAX,
  ACADEMY_AI_LESSON_COUNT_MIN,
  ACADEMY_AI_LESSON_DURATION_MAX_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
  ACADEMY_LESSON_SATURATION_BEATS,
  ACADEMY_OPTIONAL_LEVEL_PACKAGES,
  ACADEMY_SEALED_MEDIA_LAYERS,
  ACADEMY_TTS_VOICE_GENDERS,
} from "@/lib/academy/production-standard";
export type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamRecord,
  AcademyPulse,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";
export type {
  CurriculumModule,
  Section,
  VoiceConfig,
  AcademyVoiceGender,
} from "@/lib/academy/curricula/types";
export {
  ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
  ACADEMY_DEMO_VIDEO_PUBLIC_PATH,
} from "@/lib/academy/lesson-playback";
export { ACADEMY_GEMINI_TTS_SLOT, requestAcademyGeminiTts } from "@/lib/academy/lesson-tts-slot";



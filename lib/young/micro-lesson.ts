/**
 * Young ders akışı, Junior ile aynı atomik mikro-ders sözleşmesini kullanır.
 * Oda kapalıyken oynatıcı monte edilmez; sözleşme burada durur.
 */

export {
  MICRO_LESSON_AIM_MS,
  MICRO_LESSON_MAX_MS,
  MICRO_LESSON_MIN_MS,
  microLessonPlan,
  microLessonSteps,
  type MicroLessonPause,
  type MicroLessonPlan,
  type MicroLessonStep,
} from "@/lib/junior/micro-lesson";

export {
  completeMicroStep,
  holdMicroStep,
  microProgressStorageKey,
  readMicroProgress,
  resumeCursor,
  writeMicroProgress,
  type MicroLessonBand,
  type MicroProgressRecord,
} from "@/lib/junior/micro-progress";

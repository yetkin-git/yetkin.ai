/**
 * 01_office_ai-1 Warm-up B-roll — bake mühürü, izlemede generate yok.
 * Varsayılan fırın: Veo 3.1 Lite. Pahalı Veo 3.1 her ders fırınında yasak (PEDAGOJI §E.4).
 * Yerel kaset: `/public/media/academy/micro/` reuse.
 */

export const ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY = "01_office_ai-1-warmup" as const;
/** Bütçe varsayılanı — Google AI Studio Veo 3.1 Lite. */
export const ACADEMY_VEO_BAKE_MODEL = "veo-3.1-lite-generate-preview" as const;
/** Pahalı Veo 3.1 — her ders fırınında çağrı yasak (PEDAGOJI §E.4). */
export const ACADEMY_VEO_PREMIUM_MODEL = "veo-3.1-generate-preview" as const;
export const ACADEMY_VEO_BAKE_DURATION_SEC = 8 as const;

export function isAcademyVeoPremiumBakeModel(model: string): boolean {
  return model.trim() === ACADEMY_VEO_PREMIUM_MODEL;
}

export function assertAcademyVeoBudgetBakeModel(model: string): void {
  if (isAcademyVeoPremiumBakeModel(model)) {
    throw new Error("Pahalı Veo 3.1 API her ders fırınında yasaktır (PEDAGOJI §E.4).");
  }
}

/** Excel B-roll yalnız Excel masalı derslerde. Ders 4 (`01_office_ai-3`) PowerPoint plakası taşır. Ders 0 1. ders plakasını reuse eder (yeni Veo çağrısı yok). */
const WARMUP_VEO_LESSON_KEYS = ["01_office_ai-0", "01_office_ai-1", "01_office_ai-2", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"] as const;

export function academyLessonWarmupVeoAssetKey(lessonKey: string): string | null {
  return (WARMUP_VEO_LESSON_KEYS as readonly string[]).includes(lessonKey.trim())
    ? ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY
    : null;
}

export function academyLessonWarmupVeoCueId(lessonKey: string): string | null {
  return (WARMUP_VEO_LESSON_KEYS as readonly string[]).includes(lessonKey.trim()) ? "cue-01" : null;
}

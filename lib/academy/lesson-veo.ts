/**
 * Isınma B-roll — yerel `-warmup.mp4` reuse. Otomatik Veo API iptal (PEDAGOJI §E.4).
 * Kaset yalnız `/public/media/academy/micro/{anahtar}.mp4`. Anahtar `-warmup` ile biter.
 * Ofis istemi `ACADEMY_WARMUP_OFFICE_PROMPT` Gemini arayüzünde elle yazılır; bu dosya çağrı açmaz.
 * Canlı video yuvası bu dosyayı açmaz.
 * Kaset adı ve bağlı dersler `course-registry.ts` kartındaki `warmup` alanından okunur.
 */

import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { resolvePublicMediaUrl } from "@/lib/media/public-url";

function warmupAssetKey(slug: string, index: number): string {
  const row = COURSE_REGISTRY.find((item) => item.slug === slug);
  const asset = row ? row.warmup[index]?.assetKey : undefined;
  if (!asset) {
    throw new Error(`Isınma kaseti yok: ${slug}`);
  }
  return asset;
}

export const ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY = warmupAssetKey("01_office_ai", 0);
/**
 * Immutable `/media` önbelleğini kıran mühür.
 * 8000 = 8.00 saniye. Kaset sessizdir; anlatım ve yatak ders MP3'ündedir.
 */
export const ACADEMY_OFF101_WARMUP_CACHE_V = 8000 as const;
/** OFF-201 ısınma kaseti. Dış fırın, 0 API. Ders 1–6 aynı dosyayı ilk 8.00 sn’de oynatır. */
export const ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY = warmupAssetKey("01_office_ai_ileri", 0);
/** Disk adı. `public/media/academy/micro/01_office_ai_ileri-warmup.mp4`. */
export const ACADEMY_OFF201_WARMUP_FILE = `${ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY}.mp4` as const;
/**
 * Immutable `/media` önbelleğini kıran mühür.
 * 8000 = 8.00 saniye. Eski kısa kaset aynı URL’de kalmasın.
 */
export const ACADEMY_OFF201_WARMUP_CACHE_V = 8000 as const;
/** EC-102 ders 1–2. Kaset `public/media/academy/micro/02_ecommerce_ai-listing-warmup.mp4`. */
export const ACADEMY_EC102_LISTING_WARMUP_KEY = warmupAssetKey("02_ecommerce_ai", 0);
/** EC-102 ders 3–6. Kaset `public/media/academy/micro/02_ecommerce_ai-ops-warmup.mp4`. */
export const ACADEMY_EC102_OPS_WARMUP_KEY = warmupAssetKey("02_ecommerce_ai", 1);
/** SM-103 ders 1–6. Kaset `public/media/academy/micro/03_social_media_ai-warmup.mp4`. */
export const ACADEMY_SM103_WARMUP_KEY = warmupAssetKey("03_social_media_ai", 0);
/** BOT-104 ders 1–6. Kaset `public/media/academy/micro/04_chatbot_nocode-warmup.mp4`. */
export const ACADEMY_BOT104_WARMUP_KEY = warmupAssetKey("04_chatbot_nocode", 0);
/** PR-105 ders 1–6. Kaset `public/media/academy/micro/05_prompt_practice-warmup.mp4`. */
export const ACADEMY_PR105_WARMUP_KEY = warmupAssetKey("05_prompt_practice", 0);
/** Eski Lite kimliği. Otomatik çağrı iptal; sabit yalnız reddetmek için durur. */
export const ACADEMY_VEO_BAKE_MODEL = "veo-3.1-lite-generate-preview" as const;
/** Pahalı Veo 3.1 kimliği. Otomatik çağrı iptal (PEDAGOJI §E.4). */
export const ACADEMY_VEO_PREMIUM_MODEL = "veo-3.1-generate-preview" as const;
export const ACADEMY_VEO_BAKE_DURATION_SEC = 8 as const;
/** Warm-up B-roll bandı. Varsayılan 8 sn bu bandın üst ucudur. */
export const ACADEMY_VEO_BAKE_DURATION_MIN_SEC = 6 as const;
export const ACADEMY_VEO_BAKE_DURATION_MAX_SEC = 8 as const;
/** Otomatik Veo çağrısı yok. Isınma kaseti yerel dosyadan okunur. */
export const ACADEMY_VEO_API_CANCELLED = true as const;
export const ACADEMY_VEO_CALLS_PER_LESSON = 0 as const;

/**
 * Gemini arayüzünde elle kullanılan ofis ısınma istemi.
 * Betik bu metni API'ye göndermez. Çıkan MP4 `-warmup.mp4` adıyla yerel klasöre konur.
 */
export const ACADEMY_WARMUP_OFFICE_PROMPT =
  "Cinematic 16:9 B-roll of a contemporary Turkish office at dusk. Slow push-in over a cluttered desk: laptop showing a messy Excel sheet with merged header cells transforming into flowing columns of clean data, soft particles of numbers drifting like light. Warm lamp, ceramic coffee cup, shallow depth of field, no readable long paragraphs, no logos of other brands, no faces looking at camera. Photoreal, 8 seconds, office / data-flow mood.";

export function academyWarmupCassetteFileName(assetKey: string): string {
  const key = assetKey.trim();
  if (!key.endsWith("-warmup")) {
    throw new Error(`Isınma kaseti -warmup.mp4 adıyla durur: ${key}`);
  }
  return `${key}.mp4`;
}

/** Yalnız `public/media/academy/micro/*-warmup.mp4`. OFF-101 ve OFF-201 `?v=` taşır. */
export function academyWarmupCassettePublicPath(assetKey: string): string {
  const path = `/media/academy/micro/${academyWarmupCassetteFileName(assetKey)}`;
  const key = assetKey.trim();
  if (key === ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY) {
    return resolvePublicMediaUrl(`${path}?v=${ACADEMY_OFF201_WARMUP_CACHE_V}`);
  }
  if (key === ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY) {
    return resolvePublicMediaUrl(`${path}?v=${ACADEMY_OFF101_WARMUP_CACHE_V}`);
  }
  return resolvePublicMediaUrl(path);
}

export function assertAcademyVeoApiCancelled(): void {
  if (!ACADEMY_VEO_API_CANCELLED || ACADEMY_VEO_CALLS_PER_LESSON !== 0) {
    throw new Error("Otomatik Veo 3.1 API video üretimi iptal kilidi açık değil (PEDAGOJI §E.4).");
  }
}

export function isAcademyVeoPremiumBakeModel(model: string): boolean {
  return model.trim() === ACADEMY_VEO_PREMIUM_MODEL;
}

export function assertAcademyVeoBudgetBakeModel(model: string): void {
  const id = model.trim();
  if (id === ACADEMY_VEO_PREMIUM_MODEL || id === ACADEMY_VEO_BAKE_MODEL || id.includes("veo")) {
    throw new Error("Otomatik Veo 3.1 API video üretimi iptal edilmiştir (PEDAGOJI §E.4).");
  }
}

/** Ders başına 0 Veo çağrısı. Yerel kaset 6–8 sn bandında kalır. */
export function assertAcademyVeoLessonBudget(input: { calls: number; durationSec: number }): void {
  if (input.calls !== ACADEMY_VEO_CALLS_PER_LESSON) {
    throw new Error("Otomatik Veo API iptal. Ders başına 0 çağrı; yerel -warmup.mp4 reuse.");
  }
  if (
    input.durationSec < ACADEMY_VEO_BAKE_DURATION_MIN_SEC ||
    input.durationSec > ACADEMY_VEO_BAKE_DURATION_MAX_SEC
  ) {
    throw new Error("Yerel ısınma kaseti 6–8 saniye bandındadır.");
  }
}

/**
 * Excel B-roll yalnız Excel masalı derslerde. Ders 3 (`01_office_ai-3`) PowerPoint plakası taşır.
 * Ders 0 yerel `01_office_ai-1-warmup` kasetini reuse eder.
 * OFF-201 (`01_office_ai_ileri` 1–6) yerel `01_office_ai_ileri-warmup` kasetini ilk 8 sn ısınma beat'inde oynatır.
 * Otomatik Veo çağrısı açılmaz. Kaset `public/media/academy/micro/*-warmup.mp4` dosyasıdır.
 */
export function academyLessonWarmupVeoAssetKey(lessonKey: string): string | null {
  const key = lessonKey.trim();
  for (const row of COURSE_REGISTRY) {
    for (const binding of row.warmup) {
      if ((binding.lessonKeys as readonly string[]).includes(key)) {
        return binding.assetKey;
      }
    }
  }
  return null;
}

export function academyLessonWarmupVeoCueId(lessonKey: string): string | null {
  return academyLessonWarmupVeoAssetKey(lessonKey) ? "cue-01" : null;
}

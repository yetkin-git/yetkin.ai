/**
 * Akademi vitrin kataloğu — yayın SKU listesi.
 * Kanon 13 SKU `ACADEMY_COURSE_TITLES` içindedir; satın alınır büyüme
 * vitrini mühürlü amiral SKU’dur. Kardeş Katman 1 taslakları üretim
 * bandındadır; Prisma hayalet SKU ve hayali oynatıcı girmez.
 *
 * `01_office_ai` çekirdek kaydı durur; 8 ders mühürlü ses (`1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`).
 * OFF-201 `01_office_ai_ileri` ders 3–5 mühürlüdür. Ders 1–2 Gemini 2.5 kaseti iptaldir.
 * Ders 6 metin sırası düzeltildi; eski kaset oynatılmaz.
 * `ACADEMY_TTS_REBAKE_QUEUE` ders 1, 2 ve 6'yı tutar. Mühürlü 3–5 yeniden yakılmaz.
 * Eski ritüel kaseti `01_office_ai-4` sınav yolunda ve ses mühründe yoktur; dosya arşivde kalır.
 * Sınav yolu `lesson-index.ts` SSOT’udur.
 * PEDAGOJI §D 5'li Vitrin Karması kardeşleri dürüst «Çok Yakında» kabuğu olarak basar.
 */

import type { AcademyCourseTitleSlug } from "@/lib/kernel/catalog-ids/course-slugs";
import { CURRICULUM_LESSON_KEYS_BY_SLUG, curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";

export const ACADEMY_PILOT_SKU_SLUG = null;

/** Amiral SKU — vitrin ızgarasında görsel olarak öne çıkar (Sesli Anlatım). */
export const ACADEMY_FLAGSHIP_SKU_SLUG = "01_office_ai" as const;

export const ACADEMY_GROWTH_SKU_SLUGS = [
  ACADEMY_FLAGSHIP_SKU_SLUG,
] as const satisfies readonly AcademyCourseTitleSlug[];

/**
 * PEDAGOJI §D kardeş kabuk — üretim bandı.
 * Satın alma / antre / oynatıcı yok; katalog kartı «Çok Yakında / Hazırlanıyor».
 */
export const ACADEMY_PRODUCTION_LINE_SKU_SLUGS = [
  "02_ecommerce_ai",
  "03_social_media_ai",
  "04_chatbot_nocode",
  "05_prompt_practice",
] as const satisfies readonly AcademyCourseTitleSlug[];

/**
 * 5'li Vitrin Karması sırası — sayısal slug kilidi: 01 → 02 → 03 → 04 → 05.
 * `ACADEMY_GROWTH_SKU_SLUGS` satın alınır alt kümedir; kabuk listesi onu aşar.
 */
/** OFF-201 vitrin kartı. Kanon 13’e girmez. Soğuk okuma ₺1.290; kilit katalog satırındadır. */
export const ACADEMY_OFF201_STOREFRONT_SLUG = "01_office_ai_ileri" as const;

export const ACADEMY_VITRINE_SHELL_SKU_SLUGS = [
  ACADEMY_FLAGSHIP_SKU_SLUG,
  ACADEMY_OFF201_STOREFRONT_SLUG,
  ...ACADEMY_PRODUCTION_LINE_SKU_SLUGS,
] as const;

/** Antre / oynatıcı `generateStaticParams` — vitrinde olmayan slug HTTP 404. */
export function academyStorefrontStaticParams(): { slug: AcademyGrowthSkuSlug }[] {
  return ACADEMY_GROWTH_SKU_SLUGS.map((slug) => ({ slug }));
}

/** DialogueTurn[] mührü — düz metin okuma kilidinde kapalı. */
export const ACADEMY_DIALOGUE_SKU_SLUGS = [] as const satisfies readonly AcademyCourseTitleSlug[];

/**
 * Diskteki ses mührü — kurs slug → mühürlü ders anahtarları.
 */
export const ACADEMY_MEDIA_SEALED_AUDIO: Readonly<Record<string, readonly string[]>> = {
  "01_office_ai": [
    "01_office_ai-1",
    "01_office_ai-2",
    "01_office_ai-3",
    "01_office_ai-5",
    "01_office_ai-6",
    "01_office_ai-g1",
    "01_office_ai-w1",
    "01_office_ai-k1",
  ],
  "01_office_ai_ileri": [
    "01_office_ai_ileri-3",
    "01_office_ai_ileri-4",
    "01_office_ai_ileri-5",
  ],
};

/**
 * Gemini 2.5 Flash TTS ile basılan kasetler. Vatandaş oynatıcı bunları açmaz.
 * Kota açılınca Gemini 3.1 Flash TTS ile yeniden fırınlanır.
 */
export const ACADEMY_TTS_REVOKED_CASSETTES: Readonly<Record<string, string>> = {
  "01_office_ai_ileri-1": "gemini-2.5-flash-preview-tts",
  "01_office_ai_ileri-2": "gemini-2.5-flash-preview-tts",
};

/**
 * Kota açılınca yeniden fırınlanacak dersler.
 * İptal kaset 1–2 ve metni düzeltilen ders 6. Mühürlü ders 3–5 bu kuyrukta değildir.
 * Model yalnız Gemini 3.1 Flash TTS.
 */
export const ACADEMY_TTS_REBAKE_QUEUE: Readonly<Record<string, readonly string[]>> = {
  "01_office_ai_ileri": [
    "01_office_ai_ileri-1",
    "01_office_ai_ileri-2",
    "01_office_ai_ileri-6",
  ],
};

/**
 * Yeniden fırın metni. Kuyruk bu dosyaları okur.
 * Eski kaset ve zamanlama yedeği kaynak değildir.
 */
export const ACADEMY_TTS_REBAKE_SCRIPT_BY_LESSON = {
  "01_office_ai_ileri-1": "lib/academy/spoken-scripts/01_office_ai_ileri-1.md",
  "01_office_ai_ileri-2": "lib/academy/spoken-scripts/01_office_ai_ileri-2.md",
  "01_office_ai_ileri-3": "lib/academy/spoken-scripts/01_office_ai_ileri-3.md",
  "01_office_ai_ileri-4": "lib/academy/spoken-scripts/01_office_ai_ileri-4.md",
  "01_office_ai_ileri-5": "lib/academy/spoken-scripts/01_office_ai_ileri-5.md",
  "01_office_ai_ileri-6": "lib/academy/spoken-scripts/01_office_ai_ileri-6.md",
} as const satisfies Record<string, string>;

/**
 * Bake CLI allowlist (`--slug=`). Mühürlü WAV şartı değildir;
 * kuyruktaki SKU da dry-run / seal kapısından geçer.
 * Vatandaş karaoke yalnız `ACADEMY_MEDIA_SEALED_AUDIO` ders anahtarıyladır.
 */
export const ACADEMY_MEDIA_SEALED_SKU_SLUGS = [
  "01_office_ai",
  "01_office_ai_ileri",
  "02_ecommerce_ai",
  "03_social_media_ai",
  "04_chatbot_nocode",
  "05_prompt_practice",
] as const satisfies readonly string[];

export type AcademyPilotSkuSlug = never;
export type AcademyGrowthSkuSlug = (typeof ACADEMY_GROWTH_SKU_SLUGS)[number];
export type AcademyProductionLineSkuSlug = (typeof ACADEMY_PRODUCTION_LINE_SKU_SLUGS)[number];
export type AcademyVitrineShellSkuSlug = (typeof ACADEMY_VITRINE_SHELL_SKU_SLUGS)[number];
export type AcademyDialogueSkuSlug = (typeof ACADEMY_DIALOGUE_SKU_SLUGS)[number];
export type AcademyMediaSealedSkuSlug = (typeof ACADEMY_MEDIA_SEALED_SKU_SLUGS)[number];

/** Vitrin, kanon 13 ve OFF-201 vitrin kartından oluşur. */
type ExtraOnVitrine = Exclude<
  AcademyVitrineShellSkuSlug,
  AcademyCourseTitleSlug | typeof ACADEMY_OFF201_STOREFRONT_SLUG
>;
type _VitrineSubsetOfCanon = [ExtraOnVitrine] extends [never] ? true : ExtraOnVitrine;
const _vitrineSubsetOfCanon: _VitrineSubsetOfCanon = true;
void _vitrineSubsetOfCanon;

type ExtraOnGrowth = Exclude<AcademyGrowthSkuSlug, AcademyVitrineShellSkuSlug>;
type _GrowthSubsetOfVitrine = [ExtraOnGrowth] extends [never] ? true : ExtraOnGrowth;
const _growthSubsetOfVitrine: _GrowthSubsetOfVitrine = true;
void _growthSubsetOfVitrine;

/** Compact makale SKU — diyalog tiyatrosu yoktur. Ses mührü üstüne biner. Ders sayısı `curriculumLessonCountForSlug`. */
export const ACADEMY_PILOT_SKU_LESSON_COUNT = 0 as const;

export function isAcademyPilotSkuSlug(_slug: string): _slug is AcademyPilotSkuSlug {
  return false;
}

export function isAcademyStorefrontSlug(slug: string): boolean {
  return isAcademyGrowthSkuSlug(slug) || slug === ACADEMY_OFF201_STOREFRONT_SLUG;
}

export function isAcademyGrowthSkuSlug(slug: string): slug is AcademyGrowthSkuSlug {
  return (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(slug);
}

/**
 * Cüzdan ve PayTR lisans niyeti aynı aday kümesini okur.
 * Vitrin yayını (`ACADEMY_GROWTH_SKU_SLUGS`) ayrıdır; satış bu listeden açılır.
 */
export const ACADEMY_LICENSE_SALE_SLUGS = [
  ACADEMY_FLAGSHIP_SKU_SLUG,
  ACADEMY_OFF201_STOREFRONT_SLUG,
] as const;

export function isAcademyLicenseSaleSlug(slug: string): boolean {
  return (ACADEMY_LICENSE_SALE_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyProductionLineSkuSlug(slug: string): slug is AcademyProductionLineSkuSlug {
  return (ACADEMY_PRODUCTION_LINE_SKU_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyVitrineShellSkuSlug(slug: string): slug is AcademyVitrineShellSkuSlug {
  return (ACADEMY_VITRINE_SHELL_SKU_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyDialogueSkuSlug(slug: string): slug is AcademyDialogueSkuSlug {
  return (ACADEMY_DIALOGUE_SKU_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyMediaSealedSkuSlug(slug: string): slug is AcademyMediaSealedSkuSlug {
  return Object.prototype.hasOwnProperty.call(ACADEMY_MEDIA_SEALED_AUDIO, slug);
}

/** Compact makale SKU — diyalog tiyatrosu yoktur. Ses mührü üstüne biner. */
export function isAcademyCompactArticleSku(slug: string): boolean {
  return isAcademyGrowthSkuSlug(slug) && !isAcademyDialogueSkuSlug(slug);
}

/** `01_office_ai-1` → `01_office_ai`. Ofis Gmail/Word anahtarı `g1` / `w1`. */
export function academyCourseSlugFromLessonKey(lessonKey: string): string | null {
  const lastDash = lessonKey.lastIndexOf("-");
  if (lastDash <= 0) {
    return null;
  }
  const suffix = lessonKey.slice(lastDash + 1);
  if (!/^(?:\d+|[gwk]\d+)$/u.test(suffix)) {
    return null;
  }
  return lessonKey.slice(0, lastDash);
}

/** Compact makale dersi — etkileşimli iş kanıtı tohumu yoktur; okuma mührü yeter. */
export function isAcademyCompactLessonKey(lessonKey: string): boolean {
  const slug = academyCourseSlugFromLessonKey(lessonKey);
  return slug ? isAcademyCompactArticleSku(slug) : false;
}

/** Katalog Sesli rozeti — en az bir mühürlü ders. */
export function academyCourseHasSealedAudio(slug: string): boolean {
  return academyMediaSealedLessonKeys(slug).length > 0;
}

export function academyMediaSealedLessonKeys(courseSlug: string): readonly string[] {
  if (!isAcademyMediaSealedSkuSlug(courseSlug)) {
    return [];
  }
  // noUncheckedIndexedAccess: Record<string, ...> erişimi undefined dönebilir; guard'a rağmen dürüst daraltma.
  return ACADEMY_MEDIA_SEALED_AUDIO[courseSlug] ?? [];
}

export function isAcademyTtsCassetteRevoked(lessonKey: string): boolean {
  return Object.prototype.hasOwnProperty.call(ACADEMY_TTS_REVOKED_CASSETTES, lessonKey.trim());
}

export function academyTtsRebakeLessonKeys(courseSlug: string): readonly string[] {
  return ACADEMY_TTS_REBAKE_QUEUE[courseSlug] ?? [];
}

export function academyTtsRebakeScriptPath(lessonKey: string): string | null {
  const path = ACADEMY_TTS_REBAKE_SCRIPT_BY_LESSON[lessonKey as keyof typeof ACADEMY_TTS_REBAKE_SCRIPT_BY_LESSON];
  return path ?? null;
}

export function isAcademyLessonAudioOnRebakeQueue(courseSlug: string, lessonKey: string): boolean {
  return academyTtsRebakeLessonKeys(courseSlug).includes(lessonKey);
}

export function isAcademyLessonAudioSealed(courseSlug: string, lessonKey: string): boolean {
  if (isAcademyTtsCassetteRevoked(lessonKey)) {
    return false;
  }
  return academyMediaSealedLessonKeys(courseSlug).includes(lessonKey);
}

/**
 * Satış kapısı. Katalog satırı ve yayın tek başına yetmez.
 * Sınav yolundaki bir ders mühürsüzse veya iptal kasetse `purchasable` false kalır.
 */
export function academySkuAudioAllowsPurchase(courseSlug: string): boolean {
  if (!Object.prototype.hasOwnProperty.call(CURRICULUM_LESSON_KEYS_BY_SLUG, courseSlug)) {
    return true;
  }
  const keys = curriculumLessonKeysForSlug(courseSlug);
  if (keys.length === 0) {
    return false;
  }
  return keys.every((lessonKey) => isAcademyLessonAudioSealed(courseSlug, lessonKey));
}

/**
 * Tek satış kapısı. Cüzdan ve PayTR `academy-license:` niyeti bunu okur.
 * Aday olmayan kurs satılmaz. Adayın sınav yolundaki her dersin sesi bitmeden satılmaz.
 */
export function academyCourseSaleOpen(courseSlug: string): boolean {
  if (!isAcademyLicenseSaleSlug(courseSlug)) {
    return false;
  }
  return academySkuAudioAllowsPurchase(courseSlug);
}

export function academyCatalogPurchasable(input: {
  courseSlug: string;
  catalogRowPresent: boolean;
  isPublished: boolean;
}): boolean {
  return (
    input.catalogRowPresent &&
    input.isPublished &&
    academyCourseSaleOpen(input.courseSlug)
  );
}

export function academyMediaSealedWavCount(): number {
  let count = 0;
  for (const keys of Object.values(ACADEMY_MEDIA_SEALED_AUDIO)) {
    count += keys.length;
  }
  return count;
}

/**
 * Satın alınır vitrin — mühürlü büyüme SKU sırası.
 */
export function filterAcademyGrowthCatalog<T extends { slug: string }>(courses: readonly T[]): T[] {
  const bySlug = new Map(courses.map((row) => [row.slug, row] as const));
  const next: T[] = [];
  for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
    const row = bySlug.get(slug);
    if (row) {
      next.push(row);
    }
  }
  return next;
}

/**
 * PEDAGOJI §D 5'li Vitrin Karması — amiral + dürüst Yakında kabukları.
 */
export function filterAcademyVitrineCatalog<T extends { slug: string }>(courses: readonly T[]): T[] {
  const bySlug = new Map(courses.map((row) => [row.slug, row] as const));
  const next: T[] = [];
  for (const slug of ACADEMY_VITRINE_SHELL_SKU_SLUGS) {
    const row = bySlug.get(slug);
    if (row) {
      next.push(row);
    }
  }
  return next;
}

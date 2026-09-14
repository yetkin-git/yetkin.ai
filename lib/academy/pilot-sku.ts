/**
 * Akademi vitrin kataloğu — yayın SKU listesi.
 * Kanon 13 SKU `ACADEMY_COURSE_TITLES` içindedir; satın alınır büyüme
 * vitrini mühürlü amiral SKU’dur. Kardeş Katman 1 taslakları üretim
 * bandındadır; Prisma hayalet SKU ve hayali oynatıcı girmez.
 *
 * `01_office_ai` çekirdek kaydı durur; 1. ve 2. ders (`01_office_ai-1`, `01_office_ai-2`) mühürlü sestir.
 * PEDAGOJI §D 5'li Vitrin Karması kardeşleri dürüst «Çok Yakında» kabuğu olarak basar.
 */

import type { AcademyCourseTitleSlug } from "@/lib/kernel/catalog-ids/course-slugs";

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
  "05_prompt_practice",
  "04_chatbot_nocode",
  "02_ecommerce_ai",
  "03_social_media_ai",
] as const satisfies readonly AcademyCourseTitleSlug[];

/**
 * 5'li Vitrin Karması sırası — amiral yayında, ardından kapı / prestij / sepet / magnet.
 * `ACADEMY_GROWTH_SKU_SLUGS` satın alınır alt kümedir; kabuk listesi onu aşar.
 */
export const ACADEMY_VITRINE_SHELL_SKU_SLUGS = [
  ACADEMY_FLAGSHIP_SKU_SLUG,
  ...ACADEMY_PRODUCTION_LINE_SKU_SLUGS,
] as const satisfies readonly AcademyCourseTitleSlug[];

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
  "01_office_ai": ["01_office_ai-1", "01_office_ai-2"],
};

/**
 * Bake kuyruğu — konuşma metni + cue hazır; vatandaş karaoke yok.
 * WAV yokken `ACADEMY_MEDIA_SEALED_AUDIO` anahtarı basılmaz.
 */
export const ACADEMY_MEDIA_PRODUCTION_QUEUE: Readonly<Record<string, readonly string[]>> = {};

/**
 * Bake CLI allowlist (`--slug=`). Mühürlü WAV şartı değildir;
 * kuyruktaki SKU da dry-run / seal kapısından geçer.
 * Vatandaş karaoke yalnız `ACADEMY_MEDIA_SEALED_AUDIO` ders anahtarıyladır.
 */
export const ACADEMY_MEDIA_SEALED_SKU_SLUGS = [
  "01_office_ai",
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

/** Vitrin kanonun alt kümesidir; kanonda olmayan slug vitrine giremez. */
type ExtraOnVitrine = Exclude<AcademyVitrineShellSkuSlug, AcademyCourseTitleSlug>;
type _VitrineSubsetOfCanon = [ExtraOnVitrine] extends [never] ? true : ExtraOnVitrine;
const _vitrineSubsetOfCanon: _VitrineSubsetOfCanon = true;
void _vitrineSubsetOfCanon;

type ExtraOnGrowth = Exclude<AcademyGrowthSkuSlug, AcademyVitrineShellSkuSlug>;
type _GrowthSubsetOfVitrine = [ExtraOnGrowth] extends [never] ? true : ExtraOnGrowth;
const _growthSubsetOfVitrine: _GrowthSubsetOfVitrine = true;
void _growthSubsetOfVitrine;

/** Amiral Ders (eski pilot) — ayrı SKU yok. Compact Katman 1 kursları 6 makale (üretim bandı 6–8). */
export const ACADEMY_PILOT_SKU_LESSON_COUNT = 0 as const;

export const ACADEMY_GROWTH_LESSON_COUNT = 6 as const;

export function isAcademyPilotSkuSlug(_slug: string): _slug is AcademyPilotSkuSlug {
  return false;
}

export function isAcademyGrowthSkuSlug(slug: string): slug is AcademyGrowthSkuSlug {
  return (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(slug);
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

/** `01_office_ai-1` → `01_office_ai`. Compact müfredat anahtarı `${slug}-${n}`. */
export function academyCourseSlugFromLessonKey(lessonKey: string): string | null {
  const lastDash = lessonKey.lastIndexOf("-");
  if (lastDash <= 0) {
    return null;
  }
  const suffix = lessonKey.slice(lastDash + 1);
  if (!/^\d+$/u.test(suffix)) {
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

export function isAcademyLessonAudioSealed(courseSlug: string, lessonKey: string): boolean {
  return academyMediaSealedLessonKeys(courseSlug).includes(lessonKey);
}

export function academyMediaProductionLessonKeys(courseSlug: string): readonly string[] {
  return ACADEMY_MEDIA_PRODUCTION_QUEUE[courseSlug] ?? [];
}

export function isAcademyLessonAudioInProduction(courseSlug: string, lessonKey: string): boolean {
  return academyMediaProductionLessonKeys(courseSlug).includes(lessonKey);
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

/** @deprecated Büyüme vitrini — `filterAcademyGrowthCatalog` ile aynı. */
export function filterAcademyPilotCatalog<T extends { slug: string }>(courses: readonly T[]): T[] {
  return filterAcademyGrowthCatalog(courses);
}

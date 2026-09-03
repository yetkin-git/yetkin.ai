/**
 * Akademi vitrin kataloğu — `ACADEMY_COURSE_TITLES` ile aynı 20 yayın SKU.
 * Vitrin bu slug listesine kilitlidir; Prisma hayalet SKU vitrine girmez.
 * Sabit raf önceliği: AI-101/102/103 (amiral gemisi), PY-101/102/103, FS-101/102/103,
 * SEC-101/102/103, YZ-101 (`ai-temel`), UX-MC (`ux-temel`),
 * EXC-MC / GADS-MC / META-MC / ETIC-MC / CNV-MC / LNK-MC. created_at okunmaz.
 *
 * DialogueTurn[] mührü `ACADEMY_DIALOGUE_SKU_SLUGS` (18). WAV mührü yalnız
 * `ACADEMY_MEDIA_SEALED_AUDIO` (13 dosya: ai-agent temel 6 + orta 3 + ileri 4).
 * `ai-temel` / `ux-temel` 12 bölüm düz taslak; vitrine girer, yalan WAV basılmaz.
 */

import type { AcademyCourseTitleSlug } from "@/lib/kernel/catalog-ids/course-slugs";

export const ACADEMY_PILOT_SKU_SLUG = "python-temel" as const;

export const ACADEMY_GROWTH_SKU_SLUGS = [
  "ai-agent-temel",
  "ai-agent-orta",
  "ai-agent-ileri",
  "python-temel",
  "python-orta",
  "python-ileri",
  "fullstack-temel",
  "fullstack-orta",
  "fullstack-ileri",
  "security-temel",
  "security-orta",
  "security-ileri",
  "ai-temel",
  "ux-temel",
  "excel-masterclass",
  "google-ads-masterclass",
  "meta-ads-masterclass",
  "eticaret-masterclass",
  "canva-masterclass",
  "linkedin-masterclass",
] as const satisfies readonly AcademyCourseTitleSlug[];

/** DialogueTurn[] mührü — vitrin 20’nin 18’i. WAV iddiası değildir. */
export const ACADEMY_DIALOGUE_SKU_SLUGS = [
  "ai-agent-temel",
  "ai-agent-orta",
  "ai-agent-ileri",
  "python-temel",
  "python-orta",
  "python-ileri",
  "fullstack-temel",
  "fullstack-orta",
  "fullstack-ileri",
  "security-temel",
  "security-orta",
  "security-ileri",
  "excel-masterclass",
  "google-ads-masterclass",
  "meta-ads-masterclass",
  "eticaret-masterclass",
  "canva-masterclass",
  "linkedin-masterclass",
] as const satisfies readonly AcademyCourseTitleSlug[];

/**
 * Diskteki WAV mührü — `public/media/academy/audio` altındaki wav dosyalarıyla birebir.
 * 13 dosya. `ai-agent-orta-4`..`6` ve `ai-agent-ileri-5`/`6` yok
 * (Gemini TTS günlük kota / yeniden bake bekliyor); SKU kısmi mühürdür.
 */
export const ACADEMY_MEDIA_SEALED_AUDIO = {
  "ai-agent-temel": [
    "ai-agent-temel-1",
    "ai-agent-temel-2",
    "ai-agent-temel-3",
    "ai-agent-temel-4",
    "ai-agent-temel-5",
    "ai-agent-temel-6",
  ],
  "ai-agent-orta": [
    "ai-agent-orta-1",
    "ai-agent-orta-2",
    "ai-agent-orta-3",
  ],
  "ai-agent-ileri": [
    "ai-agent-ileri-1",
    "ai-agent-ileri-2",
    "ai-agent-ileri-3",
    "ai-agent-ileri-4",
  ],
} as const;

/** WAV’i olan SKU — 3 kurs; 13 ders dosyası. Olmayan SKU bu listede yoktur. */
export const ACADEMY_MEDIA_SEALED_SKU_SLUGS = [
  "ai-agent-temel",
  "ai-agent-orta",
  "ai-agent-ileri",
] as const satisfies readonly (keyof typeof ACADEMY_MEDIA_SEALED_AUDIO)[];

export type AcademyPilotSkuSlug = typeof ACADEMY_PILOT_SKU_SLUG;
export type AcademyGrowthSkuSlug = (typeof ACADEMY_GROWTH_SKU_SLUGS)[number];
export type AcademyDialogueSkuSlug = (typeof ACADEMY_DIALOGUE_SKU_SLUGS)[number];
export type AcademyMediaSealedSkuSlug = (typeof ACADEMY_MEDIA_SEALED_SKU_SLUGS)[number];

type MissingFromVitrine = Exclude<AcademyCourseTitleSlug, AcademyGrowthSkuSlug>;
type ExtraOnVitrine = Exclude<AcademyGrowthSkuSlug, AcademyCourseTitleSlug>;
type _VitrineMatchesTitles = [MissingFromVitrine] extends [never]
  ? [ExtraOnVitrine] extends [never]
    ? true
    : ExtraOnVitrine
  : MissingFromVitrine;
const _vitrineMatchesTitles: _VitrineMatchesTitles = true;
void _vitrineMatchesTitles;

/** Amiral Ders (python-temel) bölüm sayısı — konunun hakkı, şablon 12 değil. */
export const ACADEMY_PILOT_SKU_LESSON_COUNT = 6 as const;

/** 12 bölüm düz taslak (`ai-temel`, `ux-temel`) — vitrine girer, TTS DialogueTurn mührü yoktur. */
export const ACADEMY_GROWTH_LESSON_COUNT = 12 as const;

export function isAcademyPilotSkuSlug(slug: string): slug is AcademyPilotSkuSlug {
  return slug === ACADEMY_PILOT_SKU_SLUG;
}

export function isAcademyGrowthSkuSlug(slug: string): slug is AcademyGrowthSkuSlug {
  return (ACADEMY_GROWTH_SKU_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyDialogueSkuSlug(slug: string): slug is AcademyDialogueSkuSlug {
  return (ACADEMY_DIALOGUE_SKU_SLUGS as readonly string[]).includes(slug);
}

export function isAcademyMediaSealedSkuSlug(slug: string): slug is AcademyMediaSealedSkuSlug {
  return (ACADEMY_MEDIA_SEALED_SKU_SLUGS as readonly string[]).includes(slug);
}

/** Katalog Sesli rozeti — yalnız diske basılmış WAV anahtarı olan SKU. */
export function academyCourseHasSealedAudio(slug: string): boolean {
  return academyMediaSealedLessonKeys(slug).length > 0;
}

export function academyMediaSealedLessonKeys(courseSlug: string): readonly string[] {
  if (!isAcademyMediaSealedSkuSlug(courseSlug)) {
    return [];
  }
  return ACADEMY_MEDIA_SEALED_AUDIO[courseSlug];
}

export function isAcademyLessonAudioSealed(courseSlug: string, lessonKey: string): boolean {
  return academyMediaSealedLessonKeys(courseSlug).includes(lessonKey);
}

export function academyMediaSealedWavCount(): number {
  let count = 0;
  for (const slug of ACADEMY_MEDIA_SEALED_SKU_SLUGS) {
    count += ACADEMY_MEDIA_SEALED_AUDIO[slug].length;
  }
  return count;
}

/**
 * Vitrin — mühürlü SKU sırası.
 * Eski adı `filterAcademyPilotCatalog` durur; süzgeç yalnız hazır içeriği basar.
 */
export function filterAcademyGrowthCatalog<T extends { slug: string }>(
  courses: readonly T[],
): T[] {
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

/** @deprecated Büyüme vitrini — `filterAcademyGrowthCatalog` ile aynı. */
export function filterAcademyPilotCatalog<T extends { slug: string }>(
  courses: readonly T[],
): T[] {
  return filterAcademyGrowthCatalog(courses);
}

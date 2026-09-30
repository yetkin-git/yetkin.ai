/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import eder (sıra SSOT); bu dosya onları import etmez.
 * Vatandaş ders numarası bu dizinin 1 tabanlı indeksidir. Teknik anahtar (`k1`, `5`) basılmaz.
 * Ders 0 (Başlamadan Önce) bu dizide yoktur; `lib/academy/prep-strip.ts`.
 * Anahtar tablosu `lib/kernel/catalog-ids/exam-path.ts` içindedir (kenar aynı tabloyu okur).
 * Aşama 2 kilit sıra: Excel → KVKK → rapor → slayt → hata avı
 * → e-posta akışı (Gmail / Outlook, ritüel ilk 2 dk) → Word → Cuma 30.
 * Eski ritüel kaseti `01_office_ai-4` sınav yolunda yoktur; metin `01_office_ai-g1` içindedir.
 * Sınav yalnız son dersten sonra. Hazırlık şeridi bu sayıya girmez.
 */

import {
  CURRICULUM_LESSON_COUNT_BY_SLUG,
  CURRICULUM_LESSON_KEYS_BY_SLUG,
} from "@/lib/kernel/catalog-ids/exam-path";

export { CURRICULUM_LESSON_COUNT_BY_SLUG, CURRICULUM_LESSON_KEYS_BY_SLUG };

export function curriculumLessonCountForSlug(slug: string): number {
  return CURRICULUM_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

export function curriculumLessonKeysForSlug(slug: string): readonly string[] {
  return CURRICULUM_LESSON_KEYS_BY_SLUG[slug] ?? [];
}

/**
 * Vatandaş sıra numarası — `lesson-index` sırası, 1 tabanlı.
 * Teknik anahtar (`k1`, `5`, `g1`) ders numarası değildir.
 */
export function academyCitizenLessonOrdinal(slug: string, lessonKey: string): number | null {
  const keys = curriculumLessonKeysForSlug(slug);
  const index = keys.indexOf(lessonKey.trim());
  return index >= 0 ? index + 1 : null;
}

function academyCourseSlugPrefixFromLessonKey(lessonKey: string): string | null {
  const trimmed = lessonKey.trim();
  const lastDash = trimmed.lastIndexOf("-");
  if (lastDash <= 0) {
    return null;
  }
  return trimmed.slice(0, lastDash);
}

/** `01_office_ai-5` → 5 (hata avı); `01_office_ai-6` → 8 (Cuma). Anahtar soneki okunmaz. */
export function academyCitizenLessonOrdinalFromKey(lessonKey: string): number | null {
  const slug = academyCourseSlugPrefixFromLessonKey(lessonKey);
  if (!slug) {
    return null;
  }
  return academyCitizenLessonOrdinal(slug, lessonKey);
}

export function academyCitizenLessonLabel(slug: string, lessonKey: string): string | null {
  const ordinal = academyCitizenLessonOrdinal(slug, lessonKey);
  return ordinal == null ? null : `Ders ${ordinal}`;
}

export function isAcademyCurriculumCompleteFromIndex(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const keys = curriculumLessonKeysForSlug(slug);
  if (keys.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return keys.every((key) => done.has(key));
}

export function nextAcademyLessonKeyFromIndex(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  return curriculumLessonKeysForSlug(slug).find((key) => !done.has(key)) ?? null;
}

/**
 * Faz 2 metin katmanı — gömülmeye hazır taslak indeks.
 * Canlı sınav yolu yukarıdaki `CURRICULUM_LESSON_KEYS_BY_SLUG` içindedir.
 * Katalog, devam paneli ve `curriculumLessonKeysForSlug` bu anahtarları okumaz.
 * OFF-201 canlı sınav yoluna alındı. Bu dizide yalnız henüz yayınlanmayan taslaklar durur.
 * Emekli slug `02_business_ai` bu dizide yoktur.
 */
export const PHASE2_DRAFT_LESSON_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = {
  parent_teacher_ai: [
    "parent_teacher_ai-1",
    "parent_teacher_ai-2",
    "parent_teacher_ai-3",
    "parent_teacher_ai-4",
    "parent_teacher_ai-5",
    "parent_teacher_ai-6",
  ],
};

export const PHASE2_DRAFT_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
  parent_teacher_ai: 6,
};

export function phase2DraftLessonKeysForSlug(slug: string): readonly string[] {
  return PHASE2_DRAFT_LESSON_KEYS_BY_SLUG[slug] ?? [];
}

export function phase2DraftLessonCountForSlug(slug: string): number {
  return PHASE2_DRAFT_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

/** Faz 2 sıra numarası — canlı vatandaş ordinal’inden ayrı, 1 tabanlı. */
export function phase2DraftLessonOrdinal(slug: string, lessonKey: string): number | null {
  const index = phase2DraftLessonKeysForSlug(slug).indexOf(lessonKey.trim());
  return index >= 0 ? index + 1 : null;
}

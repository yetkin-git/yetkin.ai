/**
 * Satın almamış oynatıcı — ders kabuğu.
 * Gövde, diyagram ve mikro video istemciye gitmez.
 * Ücretsiz kapı hazırlık şerididir (`01_office_ai-0`); ana ders bu listeye açık girmez.
 * `isPreviewAllowed: true` ana dersi açamaz. `01_office_ai-1` ve `01_office_ai-k1` kilitlidir.
 */

import {
  isAcademyFreePreviewLessonKey,
  isAcademyLessonPaywalled,
} from "@/lib/academy/purchase-path";

/**
 * RSC medya anahtarları. Ödeme duvarında yalnız hazırlık şeridi.
 * Satın alma sonrası `open: false` dersin cue ve timings anahtarı da düşer.
 */
export function academyPlayerMediaLessonKeys(input: {
  keys: readonly string[];
  paywallLocked: boolean;
  openLessonKeys?: readonly string[] | null;
}): string[] {
  if (input.paywallLocked) {
    return input.keys.filter((key) => isAcademyFreePreviewLessonKey(key));
  }
  if (!input.openLessonKeys) {
    return [...input.keys];
  }
  const open = new Set(input.openLessonKeys);
  return input.keys.filter((key) => isAcademyFreePreviewLessonKey(key) || open.has(key));
}

/** Kapalı ders gövdesi istemciye gitmez. */
export function sealClosedAcademyLessonPayload<T extends { open: boolean; body: string }>(
  lessons: readonly T[],
): T[] {
  return lessons.map((lesson) => (lesson.open ? lesson : { ...lesson, body: "" }));
}

/** Müfredat bayrağı önizlemeye yetmez. Anahtar hazırlık şeridi değilse kapalıdır. */
export function academySectionAllowsFreePreview(section: {
  lessonKey?: string;
  isPreviewAllowed?: boolean;
  isLocked?: boolean;
}): boolean {
  const key = section.lessonKey?.trim() ?? "";
  if (!key || section.isLocked === true || section.isPreviewAllowed !== true) {
    return false;
  }
  return isAcademyFreePreviewLessonKey(key);
}

/**
 * Oynatıcı satırı. Ödeme duvarında `lesson.open` yok sayılır.
 * `01_office_ai-1` ve `01_office_ai-k1` dahil 1–8 kilitlidir.
 */
export function isAcademyPlayerPaywallLessonLocked(
  courseSlug: string,
  lessonKey: string,
  paywallLocked: boolean,
): boolean {
  if (!paywallLocked) {
    return false;
  }
  return isAcademyLessonPaywalled(courseSlug, lessonKey, false);
}

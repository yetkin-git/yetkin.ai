/**
 * Satın almamış oynatıcı — ders kabuğu.
 * Ücretsiz kapı hazırlık şeridi ve sınav yolunun ilk dersidir (`free-preview.ts`).
 * Ders 2 ve sonrası gövdesi istemciye gitmez.
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

/**
 * Bölüm bayrağı aynı kapıyı okur.
 * Sınav yolunun ilk dersi `isPreviewAllowed: true` ve `isLocked: false` olur.
 */
export function applyAcademySectionPreviewGate<T extends {
  lessonKey?: string;
  isPreviewAllowed?: boolean;
  isLocked?: boolean;
}>(section: T): T {
  const open = isAcademyFreePreviewLessonKey(section.lessonKey ?? "");
  return { ...section, isPreviewAllowed: open, isLocked: !open };
}

/** Müfredat bayrağı kapıdan gelir. İlk ders ve hazırlık şeridi açıktır. */
export function academySectionAllowsFreePreview(section: {
  lessonKey?: string;
  isPreviewAllowed?: boolean;
  isLocked?: boolean;
}): boolean {
  const key = section.lessonKey?.trim() ?? "";
  if (!key || !isAcademyFreePreviewLessonKey(key)) {
    return false;
  }
  return section.isPreviewAllowed === true && section.isLocked !== true;
}

/**
 * Oynatıcı satırı. Ödeme duvarında ders 1 açıktır.
 * Ders 2 ve sonrası kilitlidir.
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

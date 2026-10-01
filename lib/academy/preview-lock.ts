/**
 * Satın almamış oynatıcı — ders kabuğu.
 * Ücretsiz kapı `resolveAcademyEntitlement`: hazırlık şeridi ve sınav yolunun ilk dersi.
 * Ders 2 ve sonrası gövdesi istemciye gitmez.
 * Slug verilince başka kursun ilk ders anahtarı bu kabukta açık sayılmaz.
 */

import {
  courseSlugForAcademyLessonKey,
  resolveAcademyEntitlement,
} from "@/lib/academy/entitlement";

const ANONYMOUS_PREVIEW_NOW = new Date(0);

function anonymousPreviewOpen(courseSlug: string, lessonKey: string): boolean {
  return resolveAcademyEntitlement({
    actor: null,
    purchase: null,
    courseSlug,
    lessonKey,
    now: ANONYMOUS_PREVIEW_NOW,
  }).open;
}

function anonymousPreviewOpenForKey(lessonKey: string, courseSlug?: string): boolean {
  const slug = courseSlug?.trim() || courseSlugForAcademyLessonKey(lessonKey);
  if (!slug) {
    return false;
  }
  return anonymousPreviewOpen(slug, lessonKey);
}

/**
 * RSC medya anahtarları. Ödeme duvarında yalnız hazırlık şeridi.
 * Satın alma sonrası `open: false` dersin cue ve timings anahtarı da düşer.
 */
export function academyPlayerMediaLessonKeys(input: {
  keys: readonly string[];
  paywallLocked: boolean;
  openLessonKeys?: readonly string[] | null;
  /** Verilirse önizleme bu kursa bağlanır. Yabancı ilk ders anahtarı düşer. */
  courseSlug?: string;
}): string[] {
  const preview = (key: string) => anonymousPreviewOpenForKey(key, input.courseSlug);
  if (input.paywallLocked) {
    return input.keys.filter((key) => preview(key));
  }
  if (!input.openLessonKeys) {
    return [...input.keys];
  }
  const open = new Set(input.openLessonKeys);
  return input.keys.filter((key) => preview(key) || open.has(key));
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
  const key = section.lessonKey ?? "";
  const slug = courseSlugForAcademyLessonKey(key);
  const open = slug != null && anonymousPreviewOpen(slug, key);
  return { ...section, isPreviewAllowed: open, isLocked: !open };
}

/** Müfredat bayrağı kapıdan gelir. İlk ders ve hazırlık şeridi açıktır. */
export function academySectionAllowsFreePreview(section: {
  lessonKey?: string;
  isPreviewAllowed?: boolean;
  isLocked?: boolean;
}): boolean {
  const key = section.lessonKey?.trim() ?? "";
  const slug = courseSlugForAcademyLessonKey(key);
  if (!key || !slug || !anonymousPreviewOpen(slug, key)) {
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
  return !anonymousPreviewOpen(courseSlug, lessonKey);
}

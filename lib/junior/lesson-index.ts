/**
 * Bilinen Junior ders anahtarları. Kenar bu kümeyle bilinmeyen adrese 404 basar.
 * Kaynak `JUNIOR_LESSON_FACE`: senaryo başlığı ve katalog sırasının kenar projeksiyonu.
 * Bu dosya `server-only` değildir: proxy ders gövdesini taşımaz.
 */

import { JUNIOR_LESSON_FACE } from "@/lib/junior/lesson-face";

export const JUNIOR_KNOWN_LESSON_KEYS = JUNIOR_LESSON_FACE.map((row) => row.key);

const KNOWN = new Set<string>(JUNIOR_KNOWN_LESSON_KEYS);

export function isKnownJuniorLessonKey(lessonKey: string): boolean {
  return KNOWN.has(lessonKey);
}

/** `/junior/ders/:key` ve anahtar katalogda yoksa true. Diğer adresler false. */
export function isUnknownJuniorLessonPath(pathname: string): boolean {
  const bare = (pathname.split("#")[0] ?? "").split("?")[0] ?? "";
  const path = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
  const match = /^\/junior\/ders\/([^/]+)$/.exec(path);
  if (!match?.[1]) {
    return false;
  }
  let key = match[1];
  try {
    key = decodeURIComponent(key);
  } catch {
    return true;
  }
  return !isKnownJuniorLessonKey(key);
}

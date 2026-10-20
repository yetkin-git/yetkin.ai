/**
 * Bilinen Junior ders anahtarları. Kenar bu kümeyle bilinmeyen adrese 404 basar.
 * Kaynak `JUNIOR_LESSON_FACE`: senaryo başlığı ve katalog sırasının kenar projeksiyonu.
 * Bu dosya `server-only` değildir: proxy ders gövdesini taşımaz.
 */

import { JUNIOR_LESSON_FACE } from "@/lib/junior/lesson-face";

export const JUNIOR_KNOWN_LESSON_KEYS = JUNIOR_LESSON_FACE.map((row) => row.key);

/**
 * Katalog dışı Lesson Engine üretim rotaları.
 * Kenar bu adreslere 404 basmaz; ders listesi ve ücretsiz kapı bu kümeyi katalog saymaz.
 * `jr_06_mat-5` katalogdadır ve aynı `[lessonKey]` sayfasından kapıyla açılır.
 * Liste `lesson-engine` gövdesini import etmez; kenar bu dosyayı taşır.
 */
export const JUNIOR_ENGINE_PRODUCTION_KEYS = [
  "jr_06_mat-1",
  "jr_06_mat-2",
  "jr_06_mat-3",
  "jr_06_mat-4",
] as const;

const KNOWN = new Set<string>(JUNIOR_KNOWN_LESSON_KEYS);
const ENGINE_PRODUCTION = new Set<string>(JUNIOR_ENGINE_PRODUCTION_KEYS);

export function isJuniorEngineProductionKey(lessonKey: string): boolean {
  return ENGINE_PRODUCTION.has(lessonKey);
}

export function isKnownJuniorLessonKey(lessonKey: string): boolean {
  return KNOWN.has(lessonKey);
}

/** `/junior/ders/:key` ve anahtar katalogdaysa anahtarı döner. */
export function juniorLessonKeyFromPath(pathname: string): string | null {
  const bare = (pathname.split("#")[0] ?? "").split("?")[0] ?? "";
  const path = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
  const match = /^\/junior\/ders\/([^/]+)$/.exec(path);
  if (!match?.[1]) {
    return null;
  }
  let key = match[1];
  try {
    key = decodeURIComponent(key);
  } catch {
    return null;
  }
  return isKnownJuniorLessonKey(key) ? key : null;
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
  if (isJuniorEngineProductionKey(key)) {
    return false;
  }
  return !isKnownJuniorLessonKey(key);
}

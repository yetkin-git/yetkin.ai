/**
 * Ders cue / timings önbelleği.
 * JSON dosyaları bu modülde statik import edilmez. İstemci paketi tüm SKU'ları taşımaz.
 * Sunucu ve test disk okuyucusunu kaydeder. Oynatıcı, sunucunun verdiği prop ile önbelleği doldurur.
 */

export type AcademyLessonMediaPrime = {
  cues: Readonly<Record<string, unknown>>;
  timings: Readonly<Record<string, unknown>>;
};

type AcademyLessonJsonReader = (folder: string, lessonKey: string) => unknown;

let reader: AcademyLessonJsonReader | null = null;
let generation = 0;
const rawCache = new Map<string, unknown>();

export function academyLessonJsonGeneration(): number {
  return generation;
}

export function registerAcademyJsonReader(next: AcademyLessonJsonReader): void {
  reader = next;
}

function cacheId(folder: string, lessonKey: string): string {
  return `${folder}/${lessonKey.trim()}`;
}

/** `undefined`: henüz yüklenmedi. `null`: dosya yok. */
export function readAcademyLessonJson(folder: string, lessonKey: string): unknown | undefined {
  const id = cacheId(folder, lessonKey);
  if (rawCache.has(id)) {
    return rawCache.get(id);
  }
  if (!reader) {
    return undefined;
  }
  const raw = reader(folder, lessonKey.trim());
  rawCache.set(id, raw ?? null);
  return raw ?? null;
}

export function primeAcademyLessonMedia(media: AcademyLessonMediaPrime | null | undefined): void {
  if (!media) {
    return;
  }
  let changed = false;
  for (const [key, raw] of Object.entries(media.cues)) {
    const id = cacheId("lesson-cues", key);
    if (rawCache.get(id) !== raw) {
      rawCache.set(id, raw);
      changed = true;
    }
  }
  for (const [key, raw] of Object.entries(media.timings)) {
    const id = cacheId("lesson-audio-timings", key);
    if (rawCache.get(id) !== raw) {
      rawCache.set(id, raw);
      changed = true;
    }
  }
  if (changed) {
    generation += 1;
  }
}

import { JUNIOR_ELECTIVE_TTS_MODEL_ID, juniorLessonUsesElectiveTts } from "@/lib/junior/elective-tts";

/**
 * Junior ses manifesti (T-04). Saf modül: disk okumaz, ağ çağırmaz.
 * Her fırınlanmış ders için SHA-256 ve bayt sayısı `audio-manifest.generated.ts` içinde durur.
 * Manifest Vercel paketinde bulunur; ses klasörü ise git ve paket dışındadır (`.gitignore`, `.vercelignore`).
 * Kayıt yazımı ve dosya denetimi `scripts/verify-junior-audio-manifest.ts` içindedir.
 * Seçmeli anahtar yalnız `JUNIOR_ELECTIVE_TTS_MODEL_ID` ile geçerlidir.
 */

export type JuniorAudioManifestEntry = {
  readonly sha256: string;
  readonly bytes: number;
  /** Seçmeli kaset zorunlu kılar. Çekirdek kayıt bu alanı taşımaz. */
  readonly model?: string;
};

export type JuniorAudioManifest = Readonly<Record<string, JuniorAudioManifestEntry>>;

const SHA256_HEX = /^[0-9a-f]{64}$/u;

/** Anahtarın manifest kaydı geçerliyse döner. Yoksa veya bozuksa `null`. */
export function juniorAudioManifestEntry(
  lessonKey: string,
  manifest: JuniorAudioManifest,
): JuniorAudioManifestEntry | null {
  const key = lessonKey.trim();
  if (!Object.prototype.hasOwnProperty.call(manifest, key)) {
    return null;
  }
  const entry = manifest[key];
  if (!entry || !SHA256_HEX.test(entry.sha256) || !Number.isInteger(entry.bytes) || entry.bytes <= 0) {
    return null;
  }
  if (juniorLessonUsesElectiveTts(key) && entry.model !== JUNIOR_ELECTIVE_TTS_MODEL_ID) {
    return null;
  }
  return entry;
}

/**
 * Anahtar listesi ile manifest birebir olmalı.
 * Eksik, bozuk veya listede olmayan fazla kayıt build'i durdurur.
 */
export function juniorAudioManifestIssues(keys: readonly string[], manifest: JuniorAudioManifest): string[] {
  const issues: string[] = [];
  for (const key of keys) {
    if (!juniorAudioManifestEntry(key, manifest)) {
      issues.push(`manifestte eksik veya bozuk kayıt: ${key}`);
    }
  }
  const listed = new Set(keys);
  for (const key of Object.keys(manifest)) {
    if (!listed.has(key)) {
      issues.push(`manifestte fazla kayıt (anahtar listesinde yok): ${key}`);
    }
  }
  return issues;
}

/** Yerel MP3 manifestle eşleşiyor mu. Bayt ve SHA-256 birlikte denetlenir. */
export function juniorAudioFileIssue(
  lessonKey: string,
  entry: JuniorAudioManifestEntry,
  actual: { bytes: number; sha256: string } | null,
): string | null {
  if (!actual) {
    return `ses dosyası yok veya boş: ${lessonKey}.mp3`;
  }
  if (actual.bytes !== entry.bytes) {
    return `bayt uyuşmuyor: ${lessonKey}.mp3 (${actual.bytes} ≠ ${entry.bytes})`;
  }
  if (actual.sha256 !== entry.sha256) {
    return `SHA-256 uyuşmuyor: ${lessonKey}.mp3`;
  }
  return null;
}

/** CDN HEAD yanıtı: durum 200 ve `content-length` manifest baytıyla aynı olmalı. */
export function juniorAudioCdnIssue(
  lessonKey: string,
  entry: JuniorAudioManifestEntry,
  head: { status: number; contentLength: string | null },
): string | null {
  if (head.status !== 200) {
    return `CDN yanıtı ${head.status}: ${lessonKey}.mp3`;
  }
  const length = head.contentLength === null ? Number.NaN : Number(head.contentLength);
  if (length !== entry.bytes) {
    return `CDN boyutu uyuşmuyor: ${lessonKey}.mp3 (${head.contentLength ?? "yok"} ≠ ${entry.bytes})`;
  }
  return null;
}

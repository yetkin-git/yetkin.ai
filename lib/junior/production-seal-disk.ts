/**
 * Junior ses mührünün disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * `public/media/junior/audio` Vercel paketine girmez; canlı okuma CDN’dedir.
 * Klasör makinede yoksa (dağıtım veya boş klon) tek tek dosya yokluğu kanıtlanamaz.
 * Klasör duruyorsa anahtar listesindeki her dersin MP3’ü `stat` ile aranır.
 * Dosya yoksa veya boyutu sıfırsa konu taze sayılmaz.
 */

import { closeSync, openSync, readSync, statSync } from "node:fs";
import { join } from "node:path";

import { mp3DurationMsFromPrefix } from "@/lib/junior/mp3-duration";

const AUDIO_DIR = ["public", "media", "junior", "audio"] as const;
const LESSON_KEY = /^[a-z0-9_-]+$/u;

export type JuniorAudioDiskRead = {
  filePresent: (lessonKey: string) => boolean;
  treePresent: () => boolean;
  /** Dosya duruyorsa milisaniye. Yoksa veya çözülemezse `null`. */
  mp3DurationMs?: (lessonKey: string) => number | null;
};

function audioDirAbsolute(): string {
  return join(/*turbopackIgnore: true*/ process.cwd(), ...AUDIO_DIR);
}

function audioFileAbsolute(lessonKey: string): string | null {
  const key = lessonKey.trim();
  if (!LESSON_KEY.test(key)) {
    return null;
  }
  return join(audioDirAbsolute(), `${key}.mp3`);
}

/** MP3 duruyor ve boş değilse true. */
export function juniorLessonAudioFilePresent(lessonKey: string): boolean {
  const absolute = audioFileAbsolute(lessonKey);
  if (!absolute) {
    return false;
  }
  try {
    const stat = statSync(absolute);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

/** Ses klasörü bu süreçte okunabiliyor mu? */
export function juniorAudioTreePresent(): boolean {
  try {
    return statSync(audioDirAbsolute()).isDirectory();
  } catch {
    return false;
  }
}

/** İlk 256 KB ve dosya boyu. Tüm MP3 çözülmez. */
export function juniorLessonMp3DurationMs(lessonKey: string): number | null {
  const absolute = audioFileAbsolute(lessonKey);
  if (!absolute) {
    return null;
  }
  let fd: number | null = null;
  try {
    const stat = statSync(absolute);
    if (!stat.isFile() || stat.size <= 0) {
      return null;
    }
    fd = openSync(absolute, "r");
    const prefix = Buffer.alloc(Math.min(stat.size, 262_144));
    readSync(fd, prefix, 0, prefix.length, 0);
    return mp3DurationMsFromPrefix(prefix, stat.size);
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      closeSync(fd);
    }
  }
}

export const defaultJuniorAudioDiskRead: JuniorAudioDiskRead = {
  filePresent: juniorLessonAudioFilePresent,
  treePresent: juniorAudioTreePresent,
  mp3DurationMs: juniorLessonMp3DurationMs,
};

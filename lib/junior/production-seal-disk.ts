/**
 * Junior ses mührünün disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * `public/media/junior/audio` Vercel paketine girmez; canlı okuma CDN’dedir.
 * Klasör makinede yoksa (dağıtım veya boş klon) tek tek dosya yokluğu kanıtlanamaz.
 * Klasör duruyorsa anahtar listesindeki her dersin MP3’ü `stat` ile aranır.
 * Dosya yoksa veya boyutu sıfırsa konu taze sayılmaz.
 */

import { statSync } from "node:fs";
import { join } from "node:path";

const AUDIO_DIR = ["public", "media", "junior", "audio"] as const;
const LESSON_KEY = /^[a-z0-9_-]+$/u;

export type JuniorAudioDiskRead = {
  filePresent: (lessonKey: string) => boolean;
  treePresent: () => boolean;
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

export const defaultJuniorAudioDiskRead: JuniorAudioDiskRead = {
  filePresent: juniorLessonAudioFilePresent,
  treePresent: juniorAudioTreePresent,
};

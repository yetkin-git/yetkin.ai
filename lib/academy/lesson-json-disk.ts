/**
 * Node disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * Kayıt, modül yüklenince bir kez yapılır.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerAcademyJsonReader } from "@/lib/academy/lesson-json-store";

const FOLDERS = {
  "lesson-cues": "lesson-cues",
  "lesson-audio-timings": "lesson-audio-timings",
} as const;

registerAcademyJsonReader((folder, lessonKey) => {
  if (!/^[a-z0-9_-]+$/iu.test(lessonKey)) {
    return null;
  }
  const dir = FOLDERS[folder as keyof typeof FOLDERS];
  if (!dir) {
    return null;
  }
  const file = join(process.cwd(), "lib/academy", dir, `${lessonKey}.json`);
  if (!existsSync(file)) {
    return null;
  }
  return JSON.parse(readFileSync(file, "utf8")) as unknown;
});

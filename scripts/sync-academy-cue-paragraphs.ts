/**
 * T2 hazırlık — karaoke start/end dokunulmaz; cue.paragraphs spoken SSOT’tan dolar.
 * Bake kapısı `assertSpokenScriptMatchesCues` bu hizayı ister.
 *
 *   npx tsx scripts/sync-academy-cue-paragraphs.ts --key=01_office_ai-5
 */
import "@/lib/academy/lesson-json-disk";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import {
  ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS,
  academySpokenScriptDiskPath,
} from "@/lib/academy/spoken-scripts";

function parseKeyFlag(argv: readonly string[]): string | null {
  for (const arg of argv) {
    if (arg.startsWith("--key=")) {
      const value = arg.slice("--key=".length).trim();
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

function rawSpokenParagraphs(lessonKey: string): string[] {
  const raw = readFileSync(academySpokenScriptDiskPath(lessonKey), "utf8");
  return raw
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/[^\S\n]+/gu, " ")
    .replace(/ *\n */gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim()
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function syncLesson(lessonKey: string): void {
  const cues = loadAcademyLessonCues(lessonKey);
  const spoken = rawSpokenParagraphs(lessonKey);
  const counts = cues.map((cue) => (cue.paragraphs ?? []).length);
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (spoken.length !== total) {
    throw new Error(`${lessonKey}: spoken=${spoken.length} cue=${total}`);
  }
  let cursor = 0;
  const next = cues.map((cue) => {
    const n = (cue.paragraphs ?? []).length;
    const paragraphs = spoken.slice(cursor, cursor + n);
    cursor += n;
    return { ...cue, paragraphs };
  });
  const path = join(process.cwd(), "lib/academy/lesson-cues", `${lessonKey}.json`);
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  process.stdout.write(`synced ${lessonKey} counts=${counts.join(",")}\n`);
}

const onlyKey = parseKeyFlag(process.argv.slice(2));
const keys = onlyKey ? [onlyKey] : [...ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS];
for (const key of keys) {
  syncLesson(key);
}

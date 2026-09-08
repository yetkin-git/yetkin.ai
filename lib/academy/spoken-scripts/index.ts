/**
 * Stüdyo konuşma metni — compact makaleden ayrı seslendirme SSOT.
 * Teleprompter cue paragraflarını okur; bake aynı paragrafları taze nefesle sentezler.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanAcademySpokenTextForTts, collapseAcademyLessonProse } from "@/lib/academy/lesson-body";
import { loadAcademyLessonCues } from "@/lib/academy/lesson-cues";

export const ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS = [
  "01_office_ai-1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-4",
  "01_office_ai-5",
  "01_office_ai-6",
] as const;

export type AcademySpokenScriptLessonKey = (typeof ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS)[number];

export function isAcademySpokenScriptLessonKey(lessonKey: string): lessonKey is AcademySpokenScriptLessonKey {
  return (ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS as readonly string[]).includes(lessonKey.trim());
}

export function academySpokenScriptRelativePath(lessonKey: string): string {
  return `lib/academy/spoken-scripts/${lessonKey.trim()}.md`;
}

export function academySpokenScriptDiskPath(lessonKey: string, root = process.cwd()): string {
  return join(root, academySpokenScriptRelativePath(lessonKey));
}

function stripSpokenScriptMarkup(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/gu, " ")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
}

function stripSpokenScriptMarkupPreserveParagraphs(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/[^\S\n]+/gu, " ")
    .replace(/ *\n */gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export function loadAcademySpokenScriptMarkdownParagraphs(
  lessonKey: string,
  root = process.cwd(),
): readonly string[] {
  const path = academySpokenScriptDiskPath(lessonKey, root);
  if (!existsSync(path)) {
    return [];
  }
  return stripSpokenScriptMarkupPreserveParagraphs(readFileSync(path, "utf8"))
    .split(/\n\n+/u)
    .map((part) => cleanAcademySpokenTextForTts(collapseAcademyLessonProse(part)))
    .filter((part) => part.length > 0);
}

export function loadAcademySpokenScriptParagraphs(
  lessonKey: string,
  root = process.cwd(),
): readonly string[] {
  const fromCues = loadAcademyLessonCues(lessonKey).flatMap((cue) => cue.paragraphs ?? []);
  if (fromCues.length > 0) {
    return fromCues
      .map((part) => cleanAcademySpokenTextForTts(collapseAcademyLessonProse(part)))
      .filter((part) => part.length > 0);
  }
  return [...loadAcademySpokenScriptMarkdownParagraphs(lessonKey, root)];
}

export function loadAcademySpokenScriptProse(
  lessonKey: string,
  root = process.cwd(),
): string {
  const paragraphs = loadAcademySpokenScriptParagraphs(lessonKey, root);
  if (paragraphs.length > 0) {
    return collapseAcademyLessonProse(paragraphs.join(" "));
  }
  const path = academySpokenScriptDiskPath(lessonKey, root);
  if (!existsSync(path)) {
    return "";
  }
  return cleanAcademySpokenTextForTts(stripSpokenScriptMarkup(readFileSync(path, "utf8")));
}

export function academySpokenScriptWordCount(prose: string): number {
  const trimmed = prose.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import type { Section } from "../types";

/**
 * EC-102 çalışma sekmesi gövdesi.
 * Tek kaynak `lib/academy/spoken-scripts/<lessonKey>.md`. Sekme kopyası tutulmaz.
 * Bu okuma diskten yapılır. TTS, görsel ve LLM isteği burada yoktur.
 */
export function ecommerceSpokenMarkdown(lessonKey: string): string {
  const path = join(process.cwd(), "lib/academy/spoken-scripts", `${lessonKey.trim()}.md`);
  const raw = readFileSync(path, "utf8")
    .replace(/<!--[\s\S]*?-->/gu, "")
    .trim();
  if (!raw) {
    throw new Error(`spoken script missing: ${lessonKey}`);
  }
  return `\n${raw}\n`;
}

export function ecommerceSection(input: {
  sectionNumber: number;
  lessonKey: string;
  title: string;
  targetDurationMinutes: number;
  pedagogicalObjective: string;
}): Section {
  const contentMarkdown = ecommerceSpokenMarkdown(input.lessonKey);
  return {
    sectionNumber: input.sectionNumber,
    lessonKey: input.lessonKey,
    isPreviewAllowed: false,
    isLocked: true,
    title: input.title,
    targetDurationMinutes: input.targetDurationMinutes,
    estimatedWordCount: countAcademyMarkdownWords(contentMarkdown),
    pedagogicalObjective: input.pedagogicalObjective,
    contentMarkdown,
  };
}

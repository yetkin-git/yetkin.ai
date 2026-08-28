/**
 * YouTube / Udemy ders açıklaması — kısa özet ve kaynak listesi.
 * Tam ders gövdesinin altına kopyalanmaz; yalnız giriş cümleleri.
 * Client-safe.
 */

import {
  classifyAcademyLessonChunk,
  parseAcademyLessonActText,
  splitAcademyLessonChunks,
} from "@/lib/academy/lesson-body";
import type { AcademyLessonDiagramSlot } from "@/lib/academy/lesson-media";

export const ACADEMY_LESSON_SUMMARY_MAX_SENTENCES = 3;

export type AcademyLessonResourceItem = {
  id: string;
  label: string;
};

export function academyLessonShortSummary(
  body: string,
  maxSentences: number = ACADEMY_LESSON_SUMMARY_MAX_SENTENCES,
): string {
  const chunks = splitAcademyLessonChunks(body);
  let intro = "";
  for (const chunk of chunks) {
    const segment = classifyAcademyLessonChunk(chunk);
    if (segment.kind !== "text") {
      continue;
    }
    const parsed = parseAcademyLessonActText(segment.text);
    const prose = (parsed.body || parsed.heading || "").trim();
    if (!prose) {
      continue;
    }
    if (parsed.act === "giris") {
      intro = prose;
      break;
    }
    if (!intro) {
      intro = prose;
    }
  }
  if (!intro) {
    return "";
  }
  const sentences = intro
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (sentences.length === 0) {
    return intro.replace(/\s+/gu, " ").trim();
  }
  return sentences.slice(0, Math.max(1, maxSentences)).join(" ");
}

export function academyLessonResourceItems(input: {
  diagrams?: readonly AcademyLessonDiagramSlot[] | null;
  hasLab?: boolean;
}): AcademyLessonResourceItem[] {
  const items: AcademyLessonResourceItem[] = [];
  for (const diagram of input.diagrams ?? []) {
    const label = diagram.title.trim();
    if (!label) {
      continue;
    }
    items.push({ id: `diagram:${diagram.diagramKey}`, label });
  }
  if (input.hasLab) {
    items.push({ id: "lab", label: "Kod laboratuvarı" });
  }
  return items;
}

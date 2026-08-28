/**
 * Standart ders akışı — 4 bölüm. Ekran düzyazısı ile ses metni aynı kaynaktan okunur.
 * Storyboard kartı = bir bölüm; Koray/Maya replik ayrımı yok.
 */

import {
  ACADEMY_LESSON_ACT_HEADINGS,
  collapseAcademyLessonProse,
  displayAcademyLessonSegment,
  parseAcademyLessonActText,
  type AcademyLessonAct,
  type AcademyLessonSegment,
} from "@/lib/academy/lesson-body";
import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";
import { splitAcademyStudioDialogue } from "@/archived/lib/academy-studio/studio-cast";

export const ACADEMY_LESSON_FLOW_SECTION_COUNT = 4 as const;

export type AcademyLessonFlowSection = {
  act: AcademyLessonAct;
  heading: string;
  index: number;
  blocks: AcademyLessonBlock[];
  /** Ekranda okunan düzyazı (başlık + gövde + parametre/adım/alıştırma). */
  displayText: string;
  /** TTS metni — displayText ile birebir (gümrük sonrası). */
  spokenText: string;
};

function segmentFromBlock(block: AcademyLessonBlock): AcademyLessonSegment | null {
  if (block.kind === "text") {
    return { kind: "text", text: block.text };
  }
  if (block.kind === "params") {
    return { kind: "params", rows: block.rows };
  }
  if (block.kind === "steps") {
    return { kind: "steps", items: block.items };
  }
  if (block.kind === "exercise") {
    return { kind: "exercise", prompt: block.prompt };
  }
  return null;
}

export function academyLessonFlowDisplayText(blocks: readonly AcademyLessonBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    const segment = segmentFromBlock(block);
    if (!segment) {
      continue;
    }
    const display = displayAcademyLessonSegment(segment);
    if (display) {
      parts.push(display);
    }
  }
  return collapseAcademyLessonProse(parts.join(" "));
}

export function academyLessonFlowSpokenText(blocks: readonly AcademyLessonBlock[]): string {
  return academyLessonFlowDisplayText(blocks);
}

/**
 * Blokları dört pedagoji bölümüne ayırır. Yeni perde başlığı yeni bölüm açar;
 * kod / parametre / adım / alıştırma / görsel mevcut bölüme bağlanır.
 */
export function academyLessonFlowFromBlocks(
  blocks: readonly AcademyLessonBlock[],
): AcademyLessonFlowSection[] {
  const buckets: AcademyLessonFlowSection[] = [];
  let current: AcademyLessonFlowSection | null = null;

  function openSection(act: AcademyLessonAct) {
    current = {
      act,
      heading: ACADEMY_LESSON_ACT_HEADINGS[act],
      index: buckets.length,
      blocks: [],
      displayText: "",
      spokenText: "",
    };
    buckets.push(current);
  }

  for (const block of blocks) {
    if (block.kind === "text") {
      const parsed = parseAcademyLessonActText(block.text);
      if (parsed.act) {
        openSection(parsed.act);
      } else if (!current) {
        openSection("giris");
      }
    } else if (!current) {
      openSection("giris");
    }
    current!.blocks.push(block);
  }

  for (const section of buckets) {
    section.displayText = academyLessonFlowDisplayText(section.blocks);
    section.spokenText = academyLessonFlowSpokenText(section.blocks);
  }
  return buckets;
}

export function academyLessonFlowHasFourSections(sections: readonly AcademyLessonFlowSection[]): boolean {
  if (sections.length !== ACADEMY_LESSON_FLOW_SECTION_COUNT) {
    return false;
  }
  const acts = sections.map((section) => section.act);
  return (
    acts[0] === "giris" &&
    acts[1] === "syntax" &&
    acts[2] === "mantik" &&
    acts[3] === "uygulama"
  );
}

/** Ekran düzyazısı ile ses metni aynı (gümrük sonrası). */
export function academyLessonFlowSpeechMatchesDisplay(
  sections: readonly AcademyLessonFlowSection[],
): boolean {
  return sections.every((section) => section.spokenText === section.displayText);
}

/** Bölüm düzyazısında Koray/Maya replik ayrımı yok. */
export function academyLessonFlowHasNoDialogueSplit(
  sections: readonly AcademyLessonFlowSection[],
): boolean {
  return sections.every((section) => {
    for (const block of section.blocks) {
      if (block.kind !== "text") {
        continue;
      }
      const parsed = parseAcademyLessonActText(block.text);
      const body = parsed.body || block.text;
      if (splitAcademyStudioDialogue(body)) {
        return false;
      }
    }
    return true;
  });
}

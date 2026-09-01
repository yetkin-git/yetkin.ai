/** Tohum ders taslağı — mühür, şema ve pratik `curriculum.ts` içinde bağlanır. */

import type { AcademyExamQuestion } from "@/lib/academy/types";

export type DialogueSpeakerId = "maya" | "koray" | "ece" | "can" | "gozde" | "tarik";

/** Çift-AI saha sohbeti — speaker ayrımı JSON mührüdür. */
export const DIALOGUE_SPEAKER_DISPLAY = {
  maya: "Maya",
  koray: "Koray",
  ece: "Ece",
  can: "Can",
  gozde: "Gözde",
  tarik: "Tarık",
} as const satisfies Record<DialogueSpeakerId, string>;

export function academyDialogueSpeakerDisplayName(speaker: DialogueSpeakerId): string {
  return DIALOGUE_SPEAKER_DISPLAY[speaker];
}

export function isAcademyInstructorSpeaker(speaker: DialogueSpeakerId): boolean {
  return speaker === "maya" || speaker === "ece" || speaker === "gozde";
}

export function academyDialogueSpeakerIdFromDisplayName(name: string): DialogueSpeakerId | null {
  const trimmed = name.trim();
  for (const [id, display] of Object.entries(DIALOGUE_SPEAKER_DISPLAY)) {
    if (display === trimmed) {
      return id as DialogueSpeakerId;
    }
  }
  return null;
}

/** Çift-AI saha sohbeti — speaker ayrımı JSON mührüdür. */
export type DialogueTurn = {
  speaker: DialogueSpeakerId;
  text: string;
  /** Bu turdan sonra gösterilen çalışan kod; isteğe bağlı. */
  code?: {
    language: string;
    source: string;
  };
};

export type AcademyFiveActDialogue = {
  warmup: readonly DialogueTurn[];
  problem: readonly DialogueTurn[];
  development: readonly DialogueTurn[];
  conclusion: readonly DialogueTurn[];
};

export type AcademyLessonDraft = {
  key: string;
  order: number;
  title: string;
  intro: string;
  development: string;
  conclusion: string;
  /** five-act varsayılan; compact = Masterclass / tekil SKU (5 perde zorunlu değil). */
  format?: "five-act" | "compact";
  /** PEDAGOJI.md — Koray/Maya DialogueTurn[] mührü. */
  dialogue?: AcademyFiveActDialogue;
  /** Perde 5 — ders sonu çoktan seçmeli; baraj kurs sınavında 70. */
  quiz?: readonly AcademyExamQuestion[];
};

export function academyLessonDraft(
  key: string,
  order: number,
  title: string,
  intro: string,
  development: string,
  conclusion: string,
): AcademyLessonDraft {
  return { key, order, title, intro, development, conclusion };
}

/** Tekil Masterclass / kompakt SKU — 5 perde zorunlu değildir. */
export function academyCompactLessonDraft(
  key: string,
  order: number,
  title: string,
  body: string,
): AcademyLessonDraft {
  return {
    key,
    order,
    title,
    intro: body,
    development: "",
    conclusion: "",
    format: "compact",
  };
}

/** Arşiv uyumluluğu — canlı taslak pusula/ara soru basmaz; gövde düz taslaktır. */
export function academyLessonDraftWithStudio(
  _slug: string,
  key: string,
  order: number,
  title: string,
  intro: string,
  development: string,
  conclusion: string,
): AcademyLessonDraft {
  return academyLessonDraft(key, order, title, intro, development, conclusion);
}

export function dialogueTurn(
  speaker: DialogueSpeakerId,
  text: string,
  code?: DialogueTurn["code"],
): DialogueTurn {
  return code ? { speaker, text, code } : { speaker, text };
}

function serializeTurnsForFallback(turns: readonly DialogueTurn[]): string {
  return turns
    .map((turn) => {
      const name = academyDialogueSpeakerDisplayName(turn.speaker);
      const line = `${name}: ${turn.text.trim()}`;
      if (!turn.code) {
        return line;
      }
      return `${line}\n\n\`\`\`${turn.code.language}\n${turn.code.source.trim()}\n\`\`\``;
    })
    .join("\n\n");
}

/** PEDAGOJI.md 5 perde — DialogueTurn[] mühürlü ders. */
export function academyFiveActLessonDraft(spec: {
  key: string;
  order: number;
  title: string;
  dialogue: AcademyFiveActDialogue;
  quiz: readonly AcademyExamQuestion[];
}): AcademyLessonDraft {
  const { warmup, problem, development, conclusion } = spec.dialogue;
  if (warmup.length === 0 || problem.length === 0 || development.length === 0 || conclusion.length === 0) {
    throw new Error(`Beş perde diyalog eksik: ${spec.key}`);
  }
  if (spec.quiz.length < 3) {
    throw new Error(`Ders sonu quiz 3 soru ister: ${spec.key}`);
  }
  return {
    key: spec.key,
    order: spec.order,
    title: spec.title,
    format: "five-act",
    intro: `${serializeTurnsForFallback(warmup)}\n\n${serializeTurnsForFallback(problem)}`,
    development: serializeTurnsForFallback(development),
    conclusion: serializeTurnsForFallback(conclusion),
    dialogue: spec.dialogue,
    quiz: spec.quiz,
  };
}

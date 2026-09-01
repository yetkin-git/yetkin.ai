/** Tohum ders taslağı — mühür, şema ve pratik `curriculum.ts` içinde bağlanır. */

import type { AcademyExamQuestion } from "@/lib/academy/types";

export type DialogueSpeakerId = "egitmen" | "maya" | "koray" | "ece" | "can" | "gozde" | "tarik";

/** Tek eğitmen — ekranda rol adı «Eğitmen»; cast isimleri vitrin biyografisinde kalır. */
export const DIALOGUE_SPEAKER_DISPLAY = {
  egitmen: "Eğitmen",
  maya: "Eğitmen",
  koray: "Eğitmen",
  ece: "Eğitmen",
  can: "Eğitmen",
  gozde: "Eğitmen",
  tarik: "Eğitmen",
} as const satisfies Record<DialogueSpeakerId, string>;

export function academyDialogueSpeakerDisplayName(speaker: DialogueSpeakerId): string {
  return DIALOGUE_SPEAKER_DISPLAY[speaker];
}

export function isAcademyInstructorSpeaker(speaker: DialogueSpeakerId): boolean {
  return speaker === "egitmen" || speaker === "maya" || speaker === "ece" || speaker === "gozde";
}

export function academyDialogueSpeakerIdFromDisplayName(name: string): DialogueSpeakerId | null {
  const trimmed = name.trim();
  if (trimmed === "Eğitmen") {
    return "egitmen";
  }
  const legacy: Record<string, DialogueSpeakerId> = {
    Maya: "maya",
    Koray: "koray",
    Ece: "ece",
    Can: "can",
    Gözde: "gozde",
    Tarık: "tarik",
  };
  return legacy[trimmed] ?? null;
}

export type DialogueTurn = {
  speaker: DialogueSpeakerId;
  text: string;
  /** Bu turdan sonra gösterilen çalışan kod; isteğe bağlı. */
  code?: {
    language: string;
    source: string;
  };
};

/** Tek eğitmen — 4 perde. Eski warmup/development anahtarları derlemede eşlenir. */
export type AcademyFourActInstructor = {
  intro: readonly DialogueTurn[];
  problem: readonly DialogueTurn[];
  application: readonly DialogueTurn[];
  summary: readonly DialogueTurn[];
};

/** Geriye dönük tohum şekli — Koray/Maya tiyatrosu derlemede tek eğitmene çöker. */
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
  /** four-act = tek eğitmen; compact = Masterclass / düz taslak; five-act = tohum eşlemesi. */
  format?: "five-act" | "four-act" | "compact";
  dialogue?: AcademyFiveActDialogue;
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

/** Tekil Masterclass / kompakt SKU — 4 perde düz metin; WAV mührü yoktur. */
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

const CAST_NAME_PATTERN =
  /\b(?:Koray|Maya|Can|Ece|Tarık|Gözde)(?:\s+(?:Bey|Hanım))?'?(?:a|e|ın|in|un|ün)?\b/gu;
const ANSWER_LEAD_PATTERN =
  /^(?:Değil|Açmaz|Hayır|Evet|O|Kalıyor|Doğru|Aynen(?:\s+öyle)?|Tam olarak bu işte)[,.]?\s+/u;
const BANNED_ANALOGY_SENTENCE =
  /[^.?!]*(?:çağrı merkez|serbest şiir|Moderatör|stüdyo sunucu)[^.?!]*[.?!]?/giu;

function stripCastNames(text: string): string {
  return text.replace(CAST_NAME_PATTERN, " ").replace(/[ \t]+/gu, " ").replace(/ +([,.;!?])/gu, "$1").trim();
}

function stripBannedAnalogies(text: string): string {
  return text.replace(BANNED_ANALOGY_SENTENCE, " ").replace(/\s+/gu, " ").trim();
}

function stripAnswerLead(text: string): string {
  return text.replace(ANSWER_LEAD_PATTERN, "").trim();
}

function cleanInstructorProse(text: string, wasReply: boolean): string {
  let cleaned = stripCastNames(text);
  cleaned = stripBannedAnalogies(cleaned);
  if (wasReply) {
    cleaned = stripAnswerLead(cleaned);
  }
  return cleaned.replace(/\s+/gu, " ").trim();
}

function firstCode(turns: readonly DialogueTurn[]): DialogueTurn["code"] | undefined {
  return turns.find((turn) => turn.code)?.code;
}

function inferInstructorSpeaker(acts: readonly (readonly DialogueTurn[])[]): DialogueSpeakerId {
  for (const turns of acts) {
    for (const turn of turns) {
      if (isAcademyInstructorSpeaker(turn.speaker)) {
        return turn.speaker;
      }
    }
  }
  return "egitmen";
}

function joinActProse(turns: readonly DialogueTurn[]): string {
  return turns
    .map((turn) => cleanInstructorProse(turn.text, isAcademyInstructorSpeaker(turn.speaker)))
    .filter((part) => part.length > 0)
    .join(" ")
    .trim();
}

export function academyInstructorIntro(topic: string, body: string): string {
  const trimmed = body.trim();
  if (trimmed.includes("Hoş geldiniz. Bu bölümde") && trimmed.includes("konusunu ve neden ihtiyaç duyduğunuzu")) {
    return trimmed;
  }
  const rest = trimmed.length > 0 ? ` ${trimmed}` : "";
  return `Hoş geldiniz. Bu bölümde ${topic} konusunu ve neden ihtiyaç duyduğunuzu ele alacağız.${rest}`;
}

export function academyInstructorProblem(body: string, defect = "doğrulanmayan çıktı ve kapısız ilerleme"): string {
  const trimmed = body.trim();
  if (trimmed.includes("Geleneksel yapılarda") && trimmed.includes("Bu yüzden bu mimariyi kullanırız.")) {
    return trimmed;
  }
  const rest = trimmed.length > 0 ? ` ${trimmed}` : "";
  return `Geleneksel yapılarda ${defect} yaşanır. Bu yüzden bu mimariyi kullanırız.${rest}`;
}

export function academyInstructorApplication(body: string): string {
  const trimmed = body.trim();
  if (trimmed.includes("Ekrandaki kod bloğunda gördüğünüz üzere")) {
    return trimmed;
  }
  if (!trimmed) {
    return "Ekrandaki kod bloğunda gördüğünüz üzere bu kapı yazılı durur; uydurma orta değer basılmaz.";
  }
  return `Ekrandaki kod bloğunda gördüğünüz üzere, ${trimmed}`;
}

export function academyInstructorSummary(skill: string, body: string, isLastLesson: boolean): string {
  const trimmed = body.trim();
  if (trimmed.includes("Bu dersle") && trimmed.includes("kazandınız.")) {
    let wrapped = trimmed;
    if (isLastLesson && !/Sınavda seni/.test(wrapped)) {
      wrapped = `${wrapped} Sınavda seni 70 barajı bekliyor.`;
    }
    if (!isLastLesson && !/Bir sonraki bölümde seni/.test(wrapped)) {
      wrapped = `${wrapped} Bir sonraki bölümde seni sonraki kapı bekliyor.`;
    }
    return wrapped;
  }
  const gained = `Bu dersle ${skill} kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz.`;
  let result = trimmed.length > 0 ? `${gained} ${trimmed}` : gained;
  if (isLastLesson && !/Sınavda seni/.test(result)) {
    result = `${result} Sınavda seni 70 barajı bekliyor.`;
  }
  if (!isLastLesson && !/Bir sonraki bölümde seni/.test(result)) {
    result = `${result} Bir sonraki bölümde seni sonraki kapı bekliyor.`;
  }
  return result.replace(/\s+/gu, " ").trim();
}

function serializeTurnsForFallback(turns: readonly DialogueTurn[]): string {
  return turns
    .map((turn) => {
      const line = turn.text.trim();
      if (!turn.code) {
        return line;
      }
      return `${line}\n\n\`\`\`${turn.code.language}\n${turn.code.source.trim()}\n\`\`\``;
    })
    .join("\n\n");
}

function toLegacyDialogue(acts: AcademyFourActInstructor): AcademyFiveActDialogue {
  return {
    warmup: acts.intro,
    problem: acts.problem,
    development: acts.application,
    conclusion: acts.summary,
  };
}

function collapseFiveActToInstructor(
  title: string,
  order: number,
  dialogue: AcademyFiveActDialogue,
  speaker: DialogueSpeakerId,
): AcademyFourActInstructor {
  const introBody = joinActProse(dialogue.warmup);
  const problemBody = joinActProse(dialogue.problem);
  const applicationBody = joinActProse(dialogue.development);
  const summaryBody = joinActProse(dialogue.conclusion);
  const code = firstCode([
    ...dialogue.warmup,
    ...dialogue.problem,
    ...dialogue.development,
    ...dialogue.conclusion,
  ]);
  const isLast = /mini\s*proje|kapanış|sınav/iu.test(title) || order >= 6;
  return {
    intro: [dialogueTurn(speaker, academyInstructorIntro(title, introBody))],
    problem: [dialogueTurn(speaker, academyInstructorProblem(problemBody))],
    application: [dialogueTurn(speaker, academyInstructorApplication(applicationBody), code)],
    summary: [dialogueTurn(speaker, academyInstructorSummary(`${title} becerisini`, summaryBody, isLast))],
  };
}

/** PEDAGOJI.md — tek eğitmen, öğrenciye doğrudan hitap, 4 perde. */
export function academyInstructorLessonDraft(spec: {
  key: string;
  order: number;
  title: string;
  speaker?: DialogueSpeakerId;
  intro: string;
  problem: string;
  application: string;
  summary: string;
  code?: DialogueTurn["code"];
  quiz: readonly AcademyExamQuestion[];
}): AcademyLessonDraft {
  const speaker = spec.speaker ?? "egitmen";
  if (spec.quiz.length < 3) {
    throw new Error(`Ders sonu quiz 3 soru ister: ${spec.key}`);
  }
  const intro = academyInstructorIntro(spec.title, spec.intro);
  const problem = academyInstructorProblem(spec.problem);
  const application = academyInstructorApplication(spec.application);
  const isLast = /mini\s*proje|kapanış|sınav/iu.test(spec.title) || spec.order >= 6;
  const summary = academyInstructorSummary(`${spec.title} becerisini`, spec.summary, isLast);
  const acts: AcademyFourActInstructor = {
    intro: [dialogueTurn(speaker, intro)],
    problem: [dialogueTurn(speaker, problem)],
    application: [dialogueTurn(speaker, application, spec.code)],
    summary: [dialogueTurn(speaker, summary)],
  };
  const dialogue = toLegacyDialogue(acts);
  return {
    key: spec.key,
    order: spec.order,
    title: spec.title,
    format: "four-act",
    intro: `${serializeTurnsForFallback(dialogue.warmup)}\n\n${serializeTurnsForFallback(dialogue.problem)}`,
    development: serializeTurnsForFallback(dialogue.development),
    conclusion: serializeTurnsForFallback(dialogue.conclusion),
    dialogue,
    quiz: spec.quiz,
  };
}

/** Tohum 5 perde diyalog — derlemede tek eğitmen 4 perdeye çöker. */
export function academyFiveActLessonDraft(spec: {
  key: string;
  order: number;
  title: string;
  dialogue: AcademyFiveActDialogue;
  quiz: readonly AcademyExamQuestion[];
}): AcademyLessonDraft {
  const { warmup, problem, development, conclusion } = spec.dialogue;
  if (warmup.length === 0 || problem.length === 0 || development.length === 0 || conclusion.length === 0) {
    throw new Error(`Dört perde eğitmen metni eksik: ${spec.key}`);
  }
  if (spec.quiz.length < 3) {
    throw new Error(`Ders sonu quiz 3 soru ister: ${spec.key}`);
  }
  const speaker = inferInstructorSpeaker([warmup, problem, development, conclusion]);
  const collapsed = collapseFiveActToInstructor(spec.title, spec.order, spec.dialogue, speaker);
  const dialogue = toLegacyDialogue(collapsed);
  return {
    key: spec.key,
    order: spec.order,
    title: spec.title,
    format: "four-act",
    intro: `${serializeTurnsForFallback(dialogue.warmup)}\n\n${serializeTurnsForFallback(dialogue.problem)}`,
    development: serializeTurnsForFallback(dialogue.development),
    conclusion: serializeTurnsForFallback(dialogue.conclusion),
    dialogue,
    quiz: spec.quiz,
  };
}

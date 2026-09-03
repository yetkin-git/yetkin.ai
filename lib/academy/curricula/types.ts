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
  /\b(?:Koray|Can|Tarık)(?:\s+(?:Bey|Hanım))?'?(?:a|e|ın|in|un|ün)?\b/gu;
const ANSWER_LEAD_PATTERN =
  /^(?:Değil|Açmaz|Hayır|Evet|Kalıyor|Doğru|Bakamıyor|Bekleme|Aynen(?:\s+öyle)?|Tam olarak bu işte)[,.]?\s+|^(?:O)[,.]\s+/u;
const BANNED_ANALOGY_SENTENCE =
  /[^.?!]*(?:çağrı merkez|serbest şiir|Moderatör|stüdyo sunucu|tezgâhta fısıltı)[^.?!]*[.?!]?/giu;
const THEATER_RECAP =
  /[^.?!]*(?:Kafamda oturdu|Sonraki adımda ne duruyor|doğru mu anlıyorum|Işık yazılıysa)[^.?!]*[.?!]?/giu;
const SHORT_PING = /^(?:.{0,96}?(?: mi| mı| mu| mü))\.\s*$/u;
const ONE_WORD_THEATER = /^(?:Susar|Durur|Ezer|Açılmaz|Kesilmez|Kovmak|Aynı|Yetiyor|Tek|Daha dürüst)\.?$/u;

function isAcademyModeratorSpeaker(speaker: DialogueSpeakerId): boolean {
  return speaker === "koray" || speaker === "can" || speaker === "tarik";
}

function stripCastNames(text: string): string {
  return text.replace(CAST_NAME_PATTERN, " ").replace(/[ \t]+/gu, " ").replace(/ +([,.;!?])/gu, "$1").trim();
}

function stripBannedAnalogies(text: string): string {
  return text.replace(BANNED_ANALOGY_SENTENCE, " ").replace(/\s+/gu, " ").trim();
}

function stripTheaterRecap(text: string): string {
  return text.replace(THEATER_RECAP, " ").replace(/\s+/gu, " ").trim();
}

function stripAnswerLead(text: string): string {
  return text.replace(ANSWER_LEAD_PATTERN, "").trim();
}

function toStudentFacingProse(text: string, fromModerator: boolean): string {
  let cleaned = stripTheaterRecap(stripBannedAnalogies(stripCastNames(text)));
  if (!fromModerator && ANSWER_LEAD_PATTERN.test(cleaned)) {
    cleaned = stripAnswerLead(cleaned);
  }
  if (fromModerator) {
    cleaned = cleaned.replace(/\?\s*/gu, ". ");
  }
  cleaned = cleaned.replace(/\s+/gu, " ").trim();
  if (!cleaned || SHORT_PING.test(cleaned)) {
    return "";
  }
  return cleaned;
}

function firstCode(turns: readonly DialogueTurn[]): DialogueTurn["code"] | undefined {
  return turns.find((turn) => turn.code)?.code;
}

function joinActProse(turns: readonly DialogueTurn[]): string {
  const instructor = turns.filter((turn) => !isAcademyModeratorSpeaker(turn.speaker));
  const moderator = turns.filter((turn) => isAcademyModeratorSpeaker(turn.speaker));
  const teaching = instructor
    .map((turn) => toStudentFacingProse(turn.text, false))
    .filter((part) => part.length > 0);
  const scene = moderator
    .map((turn) => toStudentFacingProse(turn.text, true))
    .filter((part) => part.length > 0);
  return [...scene, ...teaching].join(" ").replace(/\s+/gu, " ").trim();
}

function isLeftoverTheaterSentence(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return true;
  }
  if (ONE_WORD_THEATER.test(trimmed)) {
    return true;
  }
  if (/(?:çağrı merkez|serbest şiir|Moderatör|stüdyo sunucu|tezgâhta fısıltı)/iu.test(trimmed)) {
    return true;
  }
  if (/(?:Kafamda oturdu|Sonraki adımda ne duruyor|doğru mu anlıyorum|Işık yazılıysa)/iu.test(trimmed)) {
    return true;
  }
  return /(?:Sınava girebilir miyim|Dışarı bakamıyor|Sonraki kapı ne\.|Kapanış o gişe|Kapanış o oda)/iu.test(
    trimmed,
  );
}

function stripTheaterFiller(text: string): string {
  const stripped = stripCastNames(
    text
      .replace(THEATER_RECAP, " ")
      .replace(BANNED_ANALOGY_SENTENCE, " ")
      .replace(/\b(?:Bakamıyor|Bekleme)\.\s*/gu, "")
      .replace(/\bDışarı bakamıyor mu\.\s*/giu, "")
      .replace(/\bSaha tarafında[^.?!]*[.?!]\s*/gu, "")
      .replace(/\bPeki sen[^.?!]*[.?!]\s*/gu, "")
      .replace(/\bBen hâlâ[^.?!]*[.?!]\s*/gu, "")
      .replace(/\b(?:Sonraki adımda ne duruyor|Sonraki derste eline ne geçiyor)\.\s*/giu, ""),
  );
  const kept = stripped
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !isLeftoverTheaterSentence(part));
  return kept.join(" ").replace(/\s+/gu, " ").replace(/ +([,.;!?])/gu, "$1").trim();
}

/** 2. dersten itibaren giriş: 1–2 dk «Ne Öğrenmiştik?» + kontrol listesi köprüsü. */
export const ACADEMY_PREVIOUS_LESSON_RECAP_HEADING = "Ne Öğrenmiştik?";

export function academyPreviousLessonBridge(spec: {
  recap: string;
  checks: readonly [string, string, string];
  whyNext: string;
}): string {
  return `${ACADEMY_PREVIOUS_LESSON_RECAP_HEADING} Bir önceki bölümde ne öğrendik? Acele etmeden geri saralım. Yeni kapı, dünün durduğu yerin üzerine konur. Unutulan kapı bugün yalan doğurur. ${spec.recap.trim()} Kontrol listesini birlikte işaretleyelim. Bir: ${spec.checks[0]} İki: ${spec.checks[1]} Üç: ${spec.checks[2]} Bu üç madde durmuyorsa bugünün işine geçmeyiz. Duruyorsa elimiz temizdir. ${spec.whyNext.trim()}`;
}

/**
 * Kompakt SKU (ai-temel / ux-temel) için giriş sarmalayıcısı.
 * `academyInstructorLessonDraft` bu kapıyı çağırmaz — diyalog müfredatı birebir kalır.
 */
export function academyInstructorIntro(topic: string, body: string): string {
  const trimmed = stripTheaterFiller(body);
  if (trimmed.includes("Hoş geldiniz. Bu bölümde") && trimmed.includes("konusunu ve neden ihtiyaç duyduğunuzu")) {
    return trimmed;
  }
  if (trimmed.includes("Bu bölümde") && /ele alacağız/u.test(trimmed)) {
    return trimmed;
  }
  if (/^(?:Merhaba|Selamlar)\b/u.test(trimmed)) {
    return trimmed;
  }
  const rest = trimmed.length > 0 ? ` ${trimmed}` : "";
  return `Hoş geldiniz. Bu bölümde ${topic} konusunu ve neden ihtiyaç duyduğunuzu ele alacağız.${rest}`;
}

/** Kompakt SKU problem sarmalayıcısı — diyalog taslağı bu kapıyı çağırmaz. */
export function academyInstructorProblem(body: string, defect = "doğrulanmayan çıktı ve kapısız ilerleme"): string {
  const trimmed = stripTheaterFiller(body);
  if (trimmed.includes("Geleneksel yapılarda") && trimmed.includes("Bu yüzden bu mimariyi kullanırız.")) {
    return trimmed;
  }
  if (trimmed.length > 120) {
    return trimmed;
  }
  const rest = trimmed.length > 0 ? ` ${trimmed}` : "";
  return `Geleneksel yapılarda ${defect} yaşanır. Bu yüzden bu mimariyi kullanırız.${rest}`;
}

/** Kompakt SKU uygulama sarmalayıcısı — diyalog taslağı bu kapıyı çağırmaz. */
export function academyInstructorApplication(body: string): string {
  const trimmed = stripTheaterFiller(body);
  if (/Ekrandaki kod bloğunda/u.test(trimmed)) {
    return trimmed;
  }
  if (!trimmed) {
    return "Ekrandaki kod bloğunda gördüğünüz üzere bu kapı yazılı durur; uydurma orta değer basılmaz.";
  }
  const rest = trimmed.charAt(0).toLocaleLowerCase("tr-TR") + trimmed.slice(1);
  return `Ekrandaki kod bloğunda gördüğünüz üzere ${rest}`;
}

/** Müfredat özetinde birebir kullanın; oynatıcı/özet derleyici otomatik eklemez. */
export const ACADEMY_INSTRUCTOR_SECTION_CLOSE = "Bir sonraki bölümde görüşmek üzere.";

/**
 * Kompakt SKU özet sarmalayıcısı — diyalog taslağı (`academyInstructorLessonDraft`) bu kapıyı çağırmaz.
 * Kapanış cümlesi diyalog müfredatında yazılı olmalıdır.
 */
export function academyInstructorSummary(skill: string, body: string, isLastLesson: boolean): string {
  const trimmed = stripTheaterFiller(body);
  if (/^Tebrikler!/.test(trimmed)) {
    return trimmed.replace(/\s+/gu, " ").trim();
  }
  if (trimmed.includes("Bu dersle") && /kazandınız\.|kavradınız\./.test(trimmed)) {
    let wrapped = trimmed;
    if (isLastLesson && !/Sınavda sen[iı]/.test(wrapped)) {
      wrapped = `${wrapped} Sınavda seni 70 barajı bekliyor.`;
    }
    if (!isLastLesson && !/Bir sonraki bölümde/.test(wrapped)) {
      wrapped = `${wrapped} Bir sonraki bölümde seni sonraki kapı bekliyor.`;
    }
    return wrapped.replace(/\s+/gu, " ").trim();
  }
  const gained = `Bu dersle ${skill} kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz.`;
  let result = trimmed.length > 0 ? `${gained} ${trimmed}` : gained;
  if (isLastLesson && !/Sınavda sen[iı]/.test(result)) {
    result = `${result} Sınavda seni 70 barajı bekliyor.`;
  }
  if (!isLastLesson && !/Bir sonraki bölümde sen[iı]/.test(result)) {
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
  _title: string,
  _order: number,
  dialogue: AcademyFiveActDialogue,
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
  const speaker: DialogueSpeakerId = "egitmen";
  return {
    intro: [dialogueTurn(speaker, introBody.trim())],
    problem: [dialogueTurn(speaker, problemBody.trim())],
    application: [dialogueTurn(speaker, applicationBody.trim(), code)],
    summary: [dialogueTurn(speaker, summaryBody.trim())],
  };
}

/** PEDAGOJI.md — tek eğitmen, öğrenciye doğrudan hitap, 4 perde. Metin birebir; şablon eklenmez. */
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
  const speaker: DialogueSpeakerId = "egitmen";
  if (spec.quiz.length < 3) {
    throw new Error(`Ders sonu quiz 3 soru ister: ${spec.key}`);
  }
  const intro = spec.intro.trim();
  const problem = spec.problem.trim();
  const application = spec.application.trim();
  const summary = spec.summary.trim();
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
  const collapsed = collapseFiveActToInstructor(spec.title, spec.order, spec.dialogue);
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

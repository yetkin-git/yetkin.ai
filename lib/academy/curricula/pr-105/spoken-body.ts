import {
  academySpokenMinutesFromWordCount,
  assertAcademyAiLessonSpokenWordCount,
  assertAcademyUtf8Text,
} from "@/lib/academy/production-standard";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import type { Section } from "../types";

/**
 * PR-105 ders kimliği ve bölüm kurulumu.
 * Konuşma metninin evi section_N.ts içindeki spokenScript alanıdır.
 * Bu dosya metin haritası tutmaz. TTS, görsel ve LLM isteği yoktur.
 */

export const PR105_LESSON_KEYS = [
  "05_prompt_practice-1",
  "05_prompt_practice-2",
  "05_prompt_practice-3",
  "05_prompt_practice-4",
  "05_prompt_practice-5",
  "05_prompt_practice-6",
] as const;

export type Pr105LessonKey = (typeof PR105_LESSON_KEYS)[number];

const PR105_GREETING = "Merhaba, ben Oğuz.";
/** Sese giden ad. Kod ve ekran yazımı bu cümlede durmaz. Prompt burada Promt okunur. */
const PR105_COURSE_NAME = "Yapay Zekâ Promt Mühendisliği";

/** Ajans sloganı ve uydurma terim. Konuşma metninde geçerse fail-closed. */
const PR105_FORBIDDEN_PHRASES: readonly RegExp[] = [
  /masterclass/iu,
  /mühürlü\s+(?:istem|şablon)/iu,
  /muazzam\s+dönüşüm/iu,
  /tezgâhın\s+bereketli/iu,
  /satışın\s+hayırlı/iu,
];

/** Ders 2-6 robotik özet açılışı ile başlayamaz. */
const PR105_ROBOTIC_OPENING = /^(?:ne öğrenmiştik|geçen derste|bir önceki derste)/iu;

function assertNoForbiddenPhrases(markdown: string, lessonKey: string): void {
  for (const pattern of PR105_FORBIDDEN_PHRASES) {
    if (pattern.test(markdown)) {
      throw new Error(`PR-105 ${lessonKey} yasaklı slogan veya uydurma terim taşıyor.`);
    }
  }
}

function assertNoRoboticOpening(markdown: string, lessonKey: string): void {
  const afterGreeting = markdown.trim().slice(PR105_GREETING.length).trim();
  if (PR105_ROBOTIC_OPENING.test(afterGreeting)) {
    throw new Error(`PR-105 ${lessonKey} robotik özet açılışı taşıyor.`);
  }
}

function assertLesson1Orientation(markdown: string): void {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith(PR105_GREETING)) {
    throw new Error("PR-105 ders 1 selamı eksik.");
  }
  const body = trimmed.slice(PR105_GREETING.length).trim();
  const where = body.indexOf("Neredeyiz?");
  const series = body.indexOf("Bu seride ne yapacağız?");
  const today = body.indexOf("Bugün bu derste elimize ne geçecek?");
  const firstHeading = body.search(/^## /mu);
  if (where !== 0 || !(where < series && series < today)) {
    throw new Error("PR-105 ders 1 selamdan sonra oryantasyon sırası bozuldu.");
  }
  if (firstHeading !== -1 && firstHeading < today) {
    throw new Error("PR-105 ders 1 oryantasyonu teknik başlıktan önce bitmiyor.");
  }
  const orientation = firstHeading === -1 ? body : body.slice(0, firstHeading);
  if (!orientation.includes(PR105_COURSE_NAME)) {
    throw new Error("PR-105 ders 1 eğitim adını taşımıyor.");
  }
  const todayAnswer = body.slice(today + "Bugün bu derste elimize ne geçecek?".length);
  const todayEnd = todayAnswer.search(/^## /mu);
  const todayText = (todayEnd === -1 ? todayAnswer : todayAnswer.slice(0, todayEnd)).trim();
  if (todayText.split(/\s+/u).filter(Boolean).length < 8) {
    throw new Error("PR-105 ders 1 bugünün çıktısını taşımıyor.");
  }
}

/** Konuşma dakikası. 600 kelime = 5 dakika. Oran üretim standardından okunur. */
export function pr105SpokenDurationMinutes(wordCount: number): number {
  return academySpokenMinutesFromWordCount(wordCount);
}

export function pr105Section(input: {
  sectionNumber: number;
  lessonKey: Pr105LessonKey;
  title: string;
  pedagogicalObjective: string;
  spokenScript: string;
}): Section {
  if (input.sectionNumber < 1 || input.sectionNumber > PR105_LESSON_KEYS.length) {
    throw new Error(`PR-105 ders numarası aralık dışında: ${input.sectionNumber}`);
  }
  const expectedKey = PR105_LESSON_KEYS[input.sectionNumber - 1];
  if (expectedKey !== input.lessonKey) {
    throw new Error(`PR-105 ders anahtarı sıra ile uyuşmuyor: ${input.lessonKey}`);
  }
  const raw = input.spokenScript.trim();
  if (!raw) {
    throw new Error(`PR-105 konuşma gövdesi boş: ${input.lessonKey}`);
  }
  assertAcademyUtf8Text(raw, input.lessonKey);
  assertNoForbiddenPhrases(raw, input.lessonKey);
  if (input.sectionNumber === 1) {
    assertLesson1Orientation(raw);
  } else {
    assertNoRoboticOpening(raw, input.lessonKey);
  }
  const contentMarkdown = `\n${raw}\n`;
  const estimatedWordCount = countAcademyMarkdownWords(contentMarkdown);
  assertAcademyAiLessonSpokenWordCount(estimatedWordCount, input.lessonKey);
  return {
    sectionNumber: input.sectionNumber,
    lessonKey: input.lessonKey,
    isPreviewAllowed: false,
    isLocked: true,
    title: input.title,
    targetDurationMinutes: pr105SpokenDurationMinutes(estimatedWordCount),
    estimatedWordCount,
    pedagogicalObjective: input.pedagogicalObjective,
    contentMarkdown,
  };
}

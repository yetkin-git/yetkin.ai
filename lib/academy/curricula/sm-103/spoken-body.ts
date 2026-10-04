import {
  academySpokenMinutesFromWordCount,
  assertAcademyAiLessonSpokenWordCount,
  assertAcademyUtf8Text,
} from "@/lib/academy/production-standard";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import type { Section } from "../types";

/**
 * SM-103 ders kimliği ve bölüm kurulumu.
 * Konuşma metninin evi section_N.ts içindeki spokenScript alanıdır.
 * Bu dosya metin haritası tutmaz. TTS, görsel ve LLM isteği yoktur.
 */

export const SM103_LESSON_KEYS = [
  "03_social_media_ai-1",
  "03_social_media_ai-2",
  "03_social_media_ai-3",
  "03_social_media_ai-4",
  "03_social_media_ai-5",
  "03_social_media_ai-6",
] as const;

export type Sm103LessonKey = (typeof SM103_LESSON_KEYS)[number];

const SM103_GREETING = "Merhaba, ben Selin.";
const SM103_COURSE_NAME = "Yapay Zekâ ile Sosyal Medya İçeriği";
const SM103_ORIENTATION_WHERE = "Neredeyiz?";
const SM103_ORIENTATION_SERIES = "Bu seride ne yapacağız?";
const SM103_ORIENTATION_TODAY = "Bugün elimize ne geçecek?";

/** Doğal kapanış. Ders 1-5 sonraki derse bağlar, son ders seriyi kapatır. */
const SM103_CLOSING_LEAD = "Zihnine sağlık.";
const SM103_CLOSING_TAIL = "kendine iyi bak.";
const SM103_CLOSING_NEXT = "Bir sonraki derste görüşmek üzere, kendine iyi bak.";

/** Ajans sloganı ve uydurma terim. Konuşma metninde geçerse fail-closed. */
const SM103_FORBIDDEN_PHRASES: readonly RegExp[] = [
  /masterclass/iu,
  /mühürlü/iu,
  /muazzam\s+dönüşüm/iu,
  /tezgâh/iu,
  /satışın\s+hayırlı/iu,
  /saniyeler\s+içinde/iu,
  /mucizevi/iu,
  /devrim\s+niteliğinde/iu,
  /büyü\s+burada\s+başlıyor/iu,
  /prompt\s+mühendisliği/iu,
];

/** Ders 2-6 okulvari özet açılışı ile başlayamaz. */
const SM103_ROBOTIC_OPENING =
  /^(?:ne\s+öğrenmiştik|geçen\s+ders(?:te|ten)?\b|bir\s+önceki\s+ders(?:te|ten)?\b|önceki\s+ders(?:te|ten)?\b|hatırlayalım)/iu;

function assertNoForbiddenPhrases(markdown: string, lessonKey: string): void {
  for (const pattern of SM103_FORBIDDEN_PHRASES) {
    if (pattern.test(markdown)) {
      throw new Error(`SM-103 ${lessonKey} yasaklı slogan veya uydurma terim taşıyor.`);
    }
  }
}

function assertNoRoboticOpening(markdown: string, lessonKey: string): void {
  const afterGreeting = markdown.trim().slice(SM103_GREETING.length).trim();
  if (SM103_ROBOTIC_OPENING.test(afterGreeting)) {
    throw new Error(`SM-103 ${lessonKey} okulvari özet açılışı taşıyor.`);
  }
}

function assertNoDigits(markdown: string, lessonKey: string): void {
  if (/[0-9]/u.test(markdown)) {
    throw new Error(`SM-103 ${lessonKey} konuşma metninde rakam var. Sayılar kelimeyle yazılır.`);
  }
}

function assertClosing(markdown: string, lessonKey: string, isLast: boolean): void {
  const trimmed = markdown.trim();
  const closingAt = trimmed.lastIndexOf(SM103_CLOSING_LEAD);
  if (closingAt === -1) {
    throw new Error(`SM-103 ${lessonKey} doğal kapanış cümlesi eksik.`);
  }
  const closing = trimmed.slice(closingAt);
  if (!closing.endsWith(isLast ? SM103_CLOSING_TAIL : SM103_CLOSING_NEXT)) {
    throw new Error(`SM-103 ${lessonKey} kapanışı doğal bitişle bitmiyor.`);
  }
}

function assertLesson1Orientation(markdown: string): void {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith(SM103_GREETING)) {
    throw new Error("SM-103 ders 1 selamı eksik.");
  }
  const body = trimmed.slice(SM103_GREETING.length).trim();
  const where = body.indexOf(SM103_ORIENTATION_WHERE);
  const series = body.indexOf(SM103_ORIENTATION_SERIES);
  const today = body.indexOf(SM103_ORIENTATION_TODAY);
  const firstHeading = body.search(/^## /mu);
  if (where !== 0 || !(where < series && series < today)) {
    throw new Error("SM-103 ders 1 selamdan sonra oryantasyon sırası bozuldu.");
  }
  if (firstHeading !== -1 && firstHeading < today) {
    throw new Error("SM-103 ders 1 oryantasyonu teknik başlıktan önce bitmiyor.");
  }
  const orientation = firstHeading === -1 ? body : body.slice(0, firstHeading);
  if (!orientation.includes(SM103_COURSE_NAME)) {
    throw new Error("SM-103 ders 1 eğitim adını taşımıyor.");
  }
  const todayAnswer = body.slice(today + SM103_ORIENTATION_TODAY.length);
  const todayEnd = todayAnswer.search(/^## /mu);
  const todayText = (todayEnd === -1 ? todayAnswer : todayAnswer.slice(0, todayEnd)).trim();
  if (todayText.split(/\s+/u).filter(Boolean).length < 8) {
    throw new Error("SM-103 ders 1 bugünün çıktısını taşımıyor.");
  }
}

/** Konuşma dakikası. 600 kelime = 5 dakika. Oran üretim standardından okunur. */
export function sm103SpokenDurationMinutes(wordCount: number): number {
  return academySpokenMinutesFromWordCount(wordCount);
}

export function sm103Section(input: {
  sectionNumber: number;
  lessonKey: Sm103LessonKey;
  title: string;
  pedagogicalObjective: string;
  spokenScript: string;
}): Section {
  if (input.sectionNumber < 1 || input.sectionNumber > SM103_LESSON_KEYS.length) {
    throw new Error(`SM-103 ders numarası aralık dışında: ${input.sectionNumber}`);
  }
  const expectedKey = SM103_LESSON_KEYS[input.sectionNumber - 1];
  if (expectedKey !== input.lessonKey) {
    throw new Error(`SM-103 ders anahtarı sıra ile uyuşmuyor: ${input.lessonKey}`);
  }
  const raw = input.spokenScript.trim();
  if (!raw) {
    throw new Error(`SM-103 konuşma gövdesi boş: ${input.lessonKey}`);
  }
  assertAcademyUtf8Text(raw, input.lessonKey);
  assertNoForbiddenPhrases(raw, input.lessonKey);
  assertNoDigits(raw, input.lessonKey);
  if (!raw.startsWith(SM103_GREETING)) {
    throw new Error(`SM-103 ${input.lessonKey} selamla açılmıyor.`);
  }
  if (input.sectionNumber === 1) {
    assertLesson1Orientation(raw);
  } else {
    assertNoRoboticOpening(raw, input.lessonKey);
  }
  assertClosing(raw, input.lessonKey, input.sectionNumber === SM103_LESSON_KEYS.length);
  const contentMarkdown = `\n${raw}\n`;
  const estimatedWordCount = countAcademyMarkdownWords(contentMarkdown);
  assertAcademyAiLessonSpokenWordCount(estimatedWordCount, input.lessonKey);
  return {
    sectionNumber: input.sectionNumber,
    lessonKey: input.lessonKey,
    isPreviewAllowed: false,
    isLocked: true,
    title: input.title,
    targetDurationMinutes: sm103SpokenDurationMinutes(estimatedWordCount),
    estimatedWordCount,
    pedagogicalObjective: input.pedagogicalObjective,
    contentMarkdown,
  };
}

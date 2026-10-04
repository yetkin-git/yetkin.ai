import {
  academySpokenMinutesFromWordCount,
  assertAcademyAiLessonSpokenWordCount,
  assertAcademyUtf8Text,
} from "@/lib/academy/production-standard";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import type { Section } from "../types";

/**
 * BOT-104 ders kimliği ve bölüm kurulumu.
 * Konuşma metninin evi section_N.ts içindeki spokenScript alanıdır.
 * Bu dosya metin haritası tutmaz. TTS, görsel ve LLM isteği yoktur.
 */

export const BOT104_LESSON_KEYS = [
  "04_chatbot_nocode-1",
  "04_chatbot_nocode-2",
  "04_chatbot_nocode-3",
  "04_chatbot_nocode-4",
  "04_chatbot_nocode-5",
  "04_chatbot_nocode-6",
] as const;

export type Bot104LessonKey = (typeof BOT104_LESSON_KEYS)[number];

const BOT104_GREETING = "Merhaba, ben Mert.";
const BOT104_COURSE_NAME = "Kodsuz WhatsApp ve Web Chatbot Kurulumu";
const BOT104_ORIENTATION_WHERE = "Neredeyiz?";
const BOT104_ORIENTATION_SERIES = "Bu seride ne yapacağız?";
const BOT104_ORIENTATION_TODAY = "Bugün elimize ne geçecek?";

/** Doğal kapanış. Ders 1-5 sonraki derse bağlar, son ders seriyi kapatır. */
const BOT104_CLOSING_LEAD = "Zihnine sağlık.";
const BOT104_CLOSING_TAIL = "kendine iyi bak.";
const BOT104_CLOSING_NEXT = "Bir sonraki derste görüşmek üzere, kendine iyi bak.";

/** Slogan ve yapay ajans dili. Konuşma metninde geçerse fail-closed. */
const BOT104_FORBIDDEN_PHRASES: readonly RegExp[] = [
  /masterclass/iu,
  /mühürlü/iu,
  /muazzam\s+dönüşüm/iu,
  /tezgâh/iu,
  /satışın\s+hayırlı/iu,
  /saniyeler\s+içinde/iu,
  /mucizevi/iu,
  /devrim\s+niteliğinde/iu,
  /büyü\s+burada\s+başlıyor/iu,
  /oyun\s+değiştirici/iu,
  /çığır\s+açan/iu,
  /dijital\s+dönüşüm/iu,
  /ajans/iu,
];

/** Ders 2-6 okulvari özet açılışı ile başlayamaz. */
const BOT104_ROBOTIC_OPENING =
  /^(?:ne\s+öğrenmiştik|geçen\s+ders(?:te|ten)?\b|bir\s+önceki\s+ders(?:te|ten)?\b|önceki\s+ders(?:te|ten)?\b|hatırlayalım)/iu;

function assertNoForbiddenPhrases(markdown: string, lessonKey: string): void {
  for (const pattern of BOT104_FORBIDDEN_PHRASES) {
    if (pattern.test(markdown)) {
      throw new Error(`BOT-104 ${lessonKey} yasaklı slogan veya yapay ajans dili taşıyor.`);
    }
  }
}

function assertNoRoboticOpening(markdown: string, lessonKey: string): void {
  const afterGreeting = markdown.trim().slice(BOT104_GREETING.length).trim();
  if (BOT104_ROBOTIC_OPENING.test(afterGreeting)) {
    throw new Error(`BOT-104 ${lessonKey} okulvari özet açılışı taşıyor.`);
  }
}

function assertNoDigits(markdown: string, lessonKey: string): void {
  if (/[0-9]/u.test(markdown)) {
    throw new Error(`BOT-104 ${lessonKey} konuşma metninde rakam var. Sayılar kelimeyle yazılır.`);
  }
}

function assertClosing(markdown: string, lessonKey: string, isLast: boolean): void {
  const trimmed = markdown.trim();
  const closingAt = trimmed.lastIndexOf(BOT104_CLOSING_LEAD);
  if (closingAt === -1) {
    throw new Error(`BOT-104 ${lessonKey} doğal kapanış cümlesi eksik.`);
  }
  const closing = trimmed.slice(closingAt);
  if (!closing.endsWith(isLast ? BOT104_CLOSING_TAIL : BOT104_CLOSING_NEXT)) {
    throw new Error(`BOT-104 ${lessonKey} kapanışı doğal bitişle bitmiyor.`);
  }
}

function assertLesson1Orientation(markdown: string): void {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith(BOT104_GREETING)) {
    throw new Error("BOT-104 ders 1 selamı eksik.");
  }
  const body = trimmed.slice(BOT104_GREETING.length).trim();
  const where = body.indexOf(BOT104_ORIENTATION_WHERE);
  const series = body.indexOf(BOT104_ORIENTATION_SERIES);
  const today = body.indexOf(BOT104_ORIENTATION_TODAY);
  const firstHeading = body.search(/^## /mu);
  if (where !== 0 || !(where < series && series < today)) {
    throw new Error("BOT-104 ders 1 selamdan sonra oryantasyon sırası bozuldu.");
  }
  if (firstHeading !== -1 && firstHeading < today) {
    throw new Error("BOT-104 ders 1 oryantasyonu teknik başlıktan önce bitmiyor.");
  }
  const orientation = firstHeading === -1 ? body : body.slice(0, firstHeading);
  if (!orientation.includes(BOT104_COURSE_NAME)) {
    throw new Error("BOT-104 ders 1 eğitim adını taşımıyor.");
  }
  const todayAnswer = body.slice(today + BOT104_ORIENTATION_TODAY.length);
  const todayEnd = todayAnswer.search(/^## /mu);
  const todayText = (todayEnd === -1 ? todayAnswer : todayAnswer.slice(0, todayEnd)).trim();
  if (todayText.split(/\s+/u).filter(Boolean).length < 8) {
    throw new Error("BOT-104 ders 1 bugünün çıktısını taşımıyor.");
  }
}

/** Konuşma dakikası. 600 kelime = 5 dakika. Oran üretim standardından okunur. */
export function bot104SpokenDurationMinutes(wordCount: number): number {
  return academySpokenMinutesFromWordCount(wordCount);
}

export function bot104Section(input: {
  sectionNumber: number;
  lessonKey: Bot104LessonKey;
  title: string;
  pedagogicalObjective: string;
  spokenScript: string;
}): Section {
  if (input.sectionNumber < 1 || input.sectionNumber > BOT104_LESSON_KEYS.length) {
    throw new Error(`BOT-104 ders numarası aralık dışında: ${input.sectionNumber}`);
  }
  const expectedKey = BOT104_LESSON_KEYS[input.sectionNumber - 1];
  if (expectedKey !== input.lessonKey) {
    throw new Error(`BOT-104 ders anahtarı sıra ile uyuşmuyor: ${input.lessonKey}`);
  }
  const raw = input.spokenScript.trim();
  if (!raw) {
    throw new Error(`BOT-104 konuşma gövdesi boş: ${input.lessonKey}`);
  }
  assertAcademyUtf8Text(raw, input.lessonKey);
  assertNoForbiddenPhrases(raw, input.lessonKey);
  assertNoDigits(raw, input.lessonKey);
  if (!raw.startsWith(BOT104_GREETING)) {
    throw new Error(`BOT-104 ${input.lessonKey} selamla açılmıyor.`);
  }
  if (input.sectionNumber === 1) {
    assertLesson1Orientation(raw);
  } else {
    assertNoRoboticOpening(raw, input.lessonKey);
  }
  assertClosing(raw, input.lessonKey, input.sectionNumber === BOT104_LESSON_KEYS.length);
  const contentMarkdown = `\n${raw}\n`;
  const estimatedWordCount = countAcademyMarkdownWords(contentMarkdown);
  assertAcademyAiLessonSpokenWordCount(estimatedWordCount, input.lessonKey);
  return {
    sectionNumber: input.sectionNumber,
    lessonKey: input.lessonKey,
    isPreviewAllowed: false,
    isLocked: true,
    title: input.title,
    targetDurationMinutes: bot104SpokenDurationMinutes(estimatedWordCount),
    estimatedWordCount,
    pedagogicalObjective: input.pedagogicalObjective,
    contentMarkdown,
  };
}

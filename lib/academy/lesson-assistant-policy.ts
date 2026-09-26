/** Canlı ders asistanı — kota, ders dışı kapı, SEN dili. İstemci bu dosyayı okuyabilir. */

import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";

/** Ders asistanı model adı burada gömülmez. Kimlik `model-roles.ts` FAST_STREAM rolündedir. */
export const ACADEMY_LESSON_ASSISTANT_ROLE = "FAST_STREAM" as const;
export const ACADEMY_LESSON_ASSISTANT_MODEL = getDefaultModelId(ACADEMY_LESSON_ASSISTANT_ROLE);
export const ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT = 5 as const;
export const ACADEMY_LESSON_ASSISTANT_PATH = "/api/academy/lesson-assistant" as const;

export const ACADEMY_LESSON_ASSISTANT_OFF_TOPIC =
  "Ben bu ders için buradayım, odağımızı kaybetmeyelim. Takıldığın adımı dersin içinden sor." as const;

export const ACADEMY_LESSON_ASSISTANT_LIMIT =
  "Bu derste beş sorun doldu. Takıldığın yeri bir kez daha ders metninden oku; yeni ders yeni hak açar." as const;

export const ACADEMY_LESSON_ASSISTANT_FAIL =
  "Şu an cevap yazılamadı. Takıldığın cümleyi bir kez daha sor." as const;

const OFF_TOPIC_RE =
  /\b(hava durumu|siyaset|seçim|futbol|bitcoin|kripto|şifre kır|hack|yemek tarifi|şiir yaz|aşk mektubu|fal bak|python|javascript|react)\b/iu;

const HERE_RE =
  /\b(burada|bu adım|bu satır|ekranda|şimdi|ne oldu|ne yapt|anlamadım|takıldım)\b/iu;

const STOP = new Set([
  "bir",
  "bu",
  "şu",
  "ve",
  "ile",
  "için",
  "nasıl",
  "neden",
  "ne",
  "mi",
  "mı",
  "mu",
  "mü",
  "sen",
  "ben",
  "de",
  "da",
  "çok",
  "daha",
  "olan",
  "olarak",
]);

function contentTokens(text: string): string[] {
  return text
    .toLocaleLowerCase("tr-TR")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 4 && !STOP.has(token));
}

function sharesLessonToken(question: string, corpus: string): boolean {
  const known = new Set(contentTokens(corpus));
  return contentTokens(question).some((token) => known.has(token));
}

const HYPERBOLE_RE =
  /\b(muazzam dönüşüm|saniyeler içinde|mucizevi yöntem|prompt mühendisliği|devrim niteliğinde)\b/giu;

/** Yalnız ders metni, o saniyedeki satır ve doğrudan iş uygulaması. Başka her şey kapalıdır. */
export function isAcademyLessonAssistantOffTopic(
  question: string,
  corpus = "",
): boolean {
  if (OFF_TOPIC_RE.test(question)) {
    return true;
  }
  const body = corpus.trim();
  if (!body) {
    return true;
  }
  if (sharesLessonToken(question, body)) {
    return false;
  }
  return !HERE_RE.test(question);
}

/** Model ders dışına kayarsa red cümlesi basılır. Empati cümlesi ders kelimesi taşıyorsa kalır. */
export function academyLessonAssistantReplyStaysOnLesson(reply: string, corpus: string): boolean {
  if (reply.includes("Ben bu ders için buradayım")) {
    return true;
  }
  return sharesLessonToken(reply, corpus);
}

export function scrubAcademyLessonAssistantReply(text: string): string {
  return text.replace(HYPERBOLE_RE, "bu iş").replace(/\s+/gu, " ").trim();
}

export function academyLessonAssistantSystemPrompt(input: {
  lessonTitle: string;
  currentTimeSec: number;
  activeLine: string;
  lessonText: string;
}): string {
  const clock = Math.max(0, Math.round(input.currentTimeSec));
  const active = input.activeLine.trim() || "Bu saniyede ayrı bir cümle işaretli değil.";
  return [
    "Sen bu dersin asistanısın. Öğrenciye sen diye konuş.",
    "Amaç sakin öğretmektir. Kısa cümle yaz. Bir cümlede tek iş olsun.",
    "Slogan, abartı ve jargon yazma. Öğrencinin aklına gelecek tereddüdü üstlen: çok haklısın, adım adım bakalım.",
    "Yalnız aktif ders metni, ekrandaki görsel veya veri ve bunlarla doğrudan bağlı iş uygulaması hakkında cevap ver.",
    "Genel sohbet, ders dışı konu ve alakasız teknik soruya cevap yazma.",
    `Bu durumda yalnız şu cümleyi yaz: ${ACADEMY_LESSON_ASSISTANT_OFF_TOPIC}`,
    `Ders: ${input.lessonTitle}`,
    `Öğrencinin bulunduğu saniye: ${clock}`,
    `O saniyedeki cümle: ${active}`,
    "Tam ders metni:",
    input.lessonText.trim(),
  ].join("\n");
}

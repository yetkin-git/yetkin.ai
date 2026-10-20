/**
 * Selim Öğretmen canlı ders koçu — kota, pedagoji, SEN dili.
 * İstemci bu dosyayı okuyabilir. Model kimliği `model-roles.ts` LITE_STREAM rolündedir.
 */

import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";

export const JUNIOR_LIVE_TUTOR_ROLE = "LITE_STREAM" as const;
export const JUNIOR_LIVE_TUTOR_MODEL = getDefaultModelId(JUNIOR_LIVE_TUTOR_ROLE);
export const JUNIOR_LIVE_TUTOR_PATH = "/api/junior/live-tutor" as const;
export const JUNIOR_LIVE_TUTOR_QUESTION_LIMIT = 12 as const;
export const JUNIOR_LIVE_TUTOR_MAX_MESSAGE_CHARS = 500 as const;
export const JUNIOR_LIVE_TUTOR_MAX_HISTORY = 8 as const;

export const JUNIOR_LIVE_TUTOR_TEACHER = "Selim Öğretmen" as const;

export const JUNIOR_LIVE_TUTOR_WELCOME =
  "Merhaba! Ben Selim Öğretmen. Takıldığın yeri birlikte çözelim — cevabı hemen söylemem, seni düşünmeye davet ederim. Hazır mısın?" as const;

export const JUNIOR_LIVE_TUTOR_OFF_TOPIC =
  "Ben bu ders için buradayım, odağımızı kaybetmeyelim. Bölünebilme veya bu sahnedeki kuralı sor, birlikte bakalım." as const;

export const JUNIOR_LIVE_TUTOR_LIMIT =
  "Bugünlük soru hakkın doldu. Derse bir kez daha bak; yarın yeni haklar açılır." as const;

export const JUNIOR_LIVE_TUTOR_FAIL =
  "Şu an cevap yazılamadı. Sorunu bir kez daha kısa yaz, birlikte bakalım." as const;

export const JUNIOR_LIVE_TUTOR_LOGIN_HINT =
  "Canlı cevap için veli girişi gerekir. Yine de ipucu çiplerine dokunabilirsin." as const;

export type JuniorLiveTutorQuickChip = {
  id: string;
  emoji: string;
  label: string;
};

/** Tek tıkla gönderilen pedagojik hızlı sorular. */
export const JUNIOR_LIVE_TUTOR_QUICK_CHIPS: readonly JuniorLiveTutorQuickChip[] = [
  {
    id: "example",
    emoji: "💡",
    label: "Bu kuralı bir örnekle açıklar mısın?",
  },
  {
    id: "digit-sum",
    emoji: "🔍",
    label: "Rakamları toplamı kuralını anlayamadım.",
  },
  {
    id: "ask-one",
    emoji: "🎯",
    label: "Bana bununla ilgili 1 soru sor!",
  },
] as const;

const OFF_TOPIC_RE =
  /\b(hava durumu|siyaset|seçim|futbol|bitcoin|kripto|şifre kır|hack|yemek tarifi|şiir yaz|aşk mektubu|fal bak|python|javascript|react)\b/iu;

const HERE_RE =
  /\b(burada|bu sahne|bu kural|ekranda|şimdi|anlamadım|takıldım|örnek|soru|bölün|çarpan|kat|rakam|basamak|dedektif)\b/iu;

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
    .filter((token) => token.length >= 3 && !STOP.has(token));
}

function sharesLessonToken(question: string, corpus: string): boolean {
  const known = new Set(contentTokens(corpus));
  return contentTokens(question).some((token) => known.has(token));
}

/** Ders dışı sohbet kapalıdır; hızlı çipler ve sahne içi sorular açıktır. */
export function isJuniorLiveTutorOffTopic(question: string, corpus = ""): boolean {
  if (OFF_TOPIC_RE.test(question)) {
    return true;
  }
  if (/(üs|kuvvet|taban|üslü)/iu.test(question)) {
    return false;
  }
  const body = corpus.trim();
  if (!body) {
    return !HERE_RE.test(question);
  }
  if (sharesLessonToken(question, body)) {
    return false;
  }
  return !HERE_RE.test(question);
}

export function juniorLiveTutorReplyStaysOnLesson(reply: string, corpus: string): boolean {
  if (reply.includes("Ben bu ders için buradayım")) {
    return true;
  }
  return sharesLessonToken(reply, corpus);
}

export function scrubJuniorLiveTutorReply(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

export type JuniorLiveTutorPromptContext = {
  lessonKey: string;
  lessonTitle: string;
  teacherName: string;
  activeSceneTitle: string;
  activeSceneSubtitle: string;
  conceptSeal: string;
  notesDigest: string;
  outcomesDigest: string;
};

/** Sokratik, 6. sınıf dostu Selim üslubu — doğrudan cevap vermez. */
export function juniorLiveTutorSystemPrompt(ctx: JuniorLiveTutorPromptContext): string {
  const scene =
    [ctx.activeSceneTitle, ctx.activeSceneSubtitle].filter(Boolean).join(" — ") ||
    "Sahne henüz seçilmedi; dersin genelinden yardım et.";
  return [
    `Sen Yetkin.ai Junior Matematik öğretmeni ${ctx.teacherName}'sin.`,
    "6. sınıf öğrencisine arkadaş canlısı, cesaretlendirici ve kısa konuş.",
    "Doğrudan cevabı verme. Sokratik yönlendir: ipucu ver, bir soru sor, öğrenciyi düşündür.",
    "En fazla 4 kısa cümle yaz. Madde işareti kullanma.",
    "Ders dışı konulara girme. Model veya marka adı söyleme.",
    "",
    `Ders anahtarı: ${ctx.lessonKey}`,
    `Ders başlığı: ${ctx.lessonTitle}`,
    `Aktif sahne: ${scene}`,
    `Mühürlü özet: ${ctx.conceptSeal || "—"}`,
    `Ders notu özeti: ${ctx.notesDigest || "—"}`,
    `Kazanımlar: ${ctx.outcomesDigest || "—"}`,
  ].join("\n");
}

/**
 * Oturumsuz / LLM yokken deterministik Sokratik ipucu.
 * Hızlı çipler ve sık takılma noktaları için.
 */
export function resolveJuniorLiveTutorLocalReply(
  question: string,
  ctx: Pick<JuniorLiveTutorPromptContext, "activeSceneTitle" | "activeSceneSubtitle">,
): string | null {
  const q = question.toLocaleLowerCase("tr-TR");
  const sceneHint = ctx.activeSceneTitle.trim()
    ? `Şu an «${ctx.activeSceneTitle}» sahnesindesin.`
    : "Önce ekrandaki sahne başlığına bir bak.";

  if (q.includes("10") && (q.includes("kuvvet") || q.includes("üs") || q.includes("sıfır"))) {
    return `${sceneHint} 10² yaz. Sonda kaç sıfır duruyor? Üs ile o sayıyı karşılaştır — aynı mı? 10³ için bir kez daha say.`;
  }
  if (
    (q.includes("0") || q.includes("sıfır")) &&
    q.includes("1") &&
    (q.includes("kuvvet") || q.includes("üs"))
  ) {
    return `${sceneHint} 5¹ tabanı bir kez yazar. 5⁰ ise tabanı hiç çarpmaz; boş çarpımın değeri neydi? 1⁵ ile de aynı soruyu sor.`;
  }
  if (q.includes("üs") || q.includes("kuvvet") || q.includes("taban")) {
    return `${sceneHint} Taban çarpılan sayıdır, üs kaç kez yan yana yazılacağını söyler. 2³ için 2'yi üç kez çarp. Bu, 2 × 3 ile aynı şey mi?`;
  }

  if (q.includes("örnekle açıkla") || q.includes("bir örnekle")) {
    return `${sceneHint} Küçük bir örnek düşün: 24. Son rakamı çift mi? Evet — o zaman 2 kuralı için ne dersin? Sen söyle, ben yanında duruyorum.`;
  }
  if (q.includes("rakamları toplam") || q.includes("rakamlar toplam")) {
    return `${sceneHint} 3 ve 9 için büyüteci son rakama değil, bütün rakamlara çevir. 2+4=6; 6, 3'ün katı mı? Bir de 18 için 1+8'i dene — ne buldun?`;
  }
  if (q.includes("1 soru sor") || q.includes("bir soru sor")) {
    return `${sceneHint} Mini sorum: 15 sayısı 5'e bölünür mü? Nedenini tek cümleyle yaz — ipucu son rakamda!`;
  }
  if (q.includes("anlamadım") || q.includes("takıldım") || q.includes("nasıl")) {
    return `${sceneHint} Endişelenme. Önce hangi kurala bakıyorsun: son basamak mı, rakam toplamı mı? Birini seç, birlikte adım adım gidelim.`;
  }
  return null;
}

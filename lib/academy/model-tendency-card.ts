/**
 * Model eğilim kartı — canlı kutu SSOT (Ders 1, 01_office_ai-1).
 *
 * Sorun (Tespit H1): ChatGPT / Claude / Gemini davranış cümleleri mühürlü kasette
 * (TTS) donmuştu; model dünyası haftalık değişirken kaset 6 ayda bir re-bake görür.
 * Yanlışlanabilir genelleme 6 ay vitrinde kalırdı.
 *
 * Çözüm: eğilim cümleleri kasette dondurulmuş anlık görüntü sayılır; yaşayan kaynak
 * bu dosyadır. Makale (section_1.ts) bu kutuyu `Tazelik Garantisi: [Ay Yıl]` damgasıyla
 * basar. Kutu aylık güncellenir; kaset re-bake istemez. Pedagoji §C tazelik ilkesi
 * takvim riski taşımadan işletilir.
 *
 * Kural:
 * - Bu dosyadaki cümleler eğilim dilinde yazılır (yatkındır / eğilimindedir); sabit
 *   karakter iddiası kurulmaz. SEN dili korunur.
 * - `ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_AT_ISO` her gözden geçirmede ilerletilir.
 * - `isAcademyModelTendencyCardStale` 6 ayı aşan kartı bayraklar (gözlem; kilit değil).
 * - Vatandaş Lisanı: ham uzantı / URL yok; model adları yazıyla durur.
 */

export const ACADEMY_MODEL_TENDENCY_REVIEW_MONTHS = 6 as const;

/** Son gözden geçirme — ISO (karşılaştırma) + Türkçe etiket (vitrin damgası). */
export const ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_AT_ISO = "2026-09-20" as const;
export const ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_LABEL_TR = "Eylül 2026" as const;

/** Makale damgası — `Tazelik Garantisi: [Tarih]` standardı. */
export const ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL =
  `Tazelik Garantisi: ${ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_LABEL_TR}` as const;

export type AcademyModelTendency = {
  model: string;
  tendency: string;
};

/**
 * Yaşayan eğilim satırları — kasetteki Eylül 2026 anlık görüntüsünün güncel karşılığı.
 * Satır ekleme/çıkarma serbesttir (yeşil kilit); sıra: ChatGPT → Claude → Gemini →
 * Grok, Kimi, Muse Spark vb. → şirket paneli.
 * Sohbet kapısı bu listedeki modellere ortaktır.
 */
export const ACADEMY_CHAT_MODEL_LIST =
  "ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb." as const;

export const ACADEMY_MODEL_TENDENCIES: readonly AcademyModelTendency[] = [
  {
    model: "ChatGPT",
    tendency: "çoğu zaman hızlı taslak üretmeye yatkındır",
  },
  {
    model: "Claude",
    tendency: "uzun satırları dikkatle okumaya yatkındır",
  },
  {
    model: "Gemini",
    tendency: "adımları net sıralamaya yatkındır",
  },
  {
    model: "Grok, Kimi, Muse Spark vb.",
    tendency: "aynı sohbet kapısından geçmeye yatkındır",
  },
  {
    model: "Şirket paneli (kurumsal model)",
    tendency: "evdeki format ve gizlilik kuralını kilitlemeye yatkındır",
  },
] as const;

function tendencyLine(item: AcademyModelTendency): string {
  return `- ${item.model} ${item.tendency}.`;
}

/**
 * Makaleye gömülen canlı kutu (markdown blockquote).
 * Kaset cümlesi dondurulmuş alıntıdır; bu kutu güncel kaynaktır.
 */
export function renderAcademyModelTendencyCardMarkdown(): string {
  const lines = ACADEMY_MODEL_TENDENCIES.map(tendencyLine).join("\n");
  return [
    `> **Model eğilim kartı (canlı kutu)** — ${ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL}.`,
    `> Bu kutu makalede güncellenir; ses kasetindeki eğilim cümleleri Eylül 2026 anlık görüntüsüdür.`,
    `> Hiçbiri sabit karakter değildir; sürümde değişir.`,
    `>`,
    ...lines.split("\n").map((line) => `> ${line}`),
  ].join("\n");
}

/**
 * Tazelik bekçisi — gözden geçirme tarihi `reviewMonths` ayı aşmışsa true döner.
 * Test / gözlem amaçlıdır; oynatıcıyı kilitlemez (dürüst yüzey: eski kart gizlenmez,
 * damga tarihiyle basılır).
 */
export function isAcademyModelTendencyCardStale(
  nowIso: string,
  reviewedAtIso: string = ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_AT_ISO,
  reviewMonths: number = ACADEMY_MODEL_TENDENCY_REVIEW_MONTHS,
): boolean {
  const now = new Date(nowIso);
  const reviewed = new Date(reviewedAtIso);
  if (Number.isNaN(now.getTime()) || Number.isNaN(reviewed.getTime())) {
    return true;
  }
  const months =
    (now.getUTCFullYear() - reviewed.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - reviewed.getUTCMonth());
  if (months < reviewMonths) {
    return false;
  }
  if (months > reviewMonths) {
    return true;
  }
  return now.getUTCDate() >= reviewed.getUTCDate();
}

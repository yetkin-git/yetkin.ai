import { academyInstructorBySlugOrNull } from "@/lib/academy/instructors";

/**
 * Odak satış antresi — sonuç, içerik, somut çıktı, iade.
 * İade cümlesi `/legal/iade` ile aynı hükümdür: açılan derse bedel dönmez.
 */

export const FOCUS_SALE_PITCH_ORDER = ["result", "content", "output", "refund"] as const;

export type FocusSalePitchStepId = (typeof FOCUS_SALE_PITCH_ORDER)[number];

export type FocusSalePitchRow = {
  id: FocusSalePitchStepId;
  label: string;
  text: string;
};

const FOCUS_SALE_REFUND =
  "Ders erişimi açılınca bedel iade edilmez; henüz harcanmamış cüzdan yüklemesi kendiliğinden karta dönmez ve iade talebi destek kanalından alınır.";

const FOCUS_SALE_COPY = {
  "01_office_ai": {
    result:
      "Dağınık Excel tablosunu düzenli tabloya çevirir, üç maddelik yönetim özeti çıkarırsın; gelen kutuyu etiket ve taslakla sıfırlarsın.",
    content: (name: string) =>
      `${name} anlatır. 8 ders: Excel temizliği, slayt, sayı kilidi, Gmail veya Outlook, Word ve Cuma 30 dakikalık kapanış.`,
    output:
      "Elinde temiz tablo, üç maddelik karar cümlesi ve slayt başına tek fikir kalır; sertifika dersler bitip test 70+ olunca basılır, satın alma tek başına belge basmaz.",
  },
  "02_ecommerce_ai": {
    result:
      "Pazaryeri ilanında ölçülü başlık, beyaz ana görsel ve maliyetin üstünde fiyat kurarsın; metni Listing'e sen koyarsın.",
    content: (name: string) =>
      `${name} anlatır. 6 ders: ürün açıklaması, görsel standardı, yorum ve iade, fiyat tabanı, toplu şablon ve mağaza mesajı.`,
    output:
      "Elinde ölçülü başlık, beyaz kare, iade kök nedeni, tabanın üstünde fiyat ve senin gönderdiğin müşteri taslağı kalır; sertifika test 70+ ile basılır.",
  },
} as const;

const FOCUS_SALE_LABELS: Record<FocusSalePitchStepId, string> = {
  result: "Sonuç",
  content: "İçerik",
  output: "Somut çıktı",
  refund: "İade",
};

export function academyFocusSalePitch(slug: string): readonly FocusSalePitchRow[] | null {
  const spec = FOCUS_SALE_COPY[slug as keyof typeof FOCUS_SALE_COPY];
  if (!spec) {
    return null;
  }
  const name = academyInstructorBySlugOrNull(slug)?.name?.trim();
  if (!name) {
    return null;
  }
  const text: Record<FocusSalePitchStepId, string> = {
    result: spec.result,
    content: spec.content(name),
    output: spec.output,
    refund: FOCUS_SALE_REFUND,
  };
  return FOCUS_SALE_PITCH_ORDER.map((id) => ({
    id,
    label: FOCUS_SALE_LABELS[id],
    text: text[id],
  }));
}

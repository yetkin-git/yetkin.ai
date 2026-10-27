import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { academyInstructorBySlugOrNull } from "@/lib/academy/instructors";

/**
 * Kurs antresi — iş sonucu, pratik çıktı, ücretsiz önizleme, güven.
 * Cümleler ders başlığı ve `teaches` listesiyle aynı işi söyler.
 * İade cümlesi `/legal/iade` ile aynı hükümdür: açılan derse bedel dönmez.
 */

export const FOCUS_SALE_PITCH_ORDER = ["result", "output", "preview", "trust"] as const;

export type FocusSalePitchStepId = (typeof FOCUS_SALE_PITCH_ORDER)[number];

export type FocusSalePitchRow = {
  id: FocusSalePitchStepId;
  label: string;
  text: string;
};

const FOCUS_SALE_REFUND =
  "Ders erişimi açılınca bedel iade edilmez; henüz harcanmamış cüzdan yüklemesi kendiliğinden karta dönmez ve iade talebi destek kanalından alınır.";

const FOCUS_SALE_LABELS: Record<FocusSalePitchStepId, string> = {
  result: "Somut sonuç / kazanım",
  output: "Pratik çıktı",
  preview: "Ücretsiz önizleme",
  trust: "Güven ve şeffaflık",
};

const FOCUS_SALE_JOBS = {
  "01_office_ai": {
    result:
      "Dağınık Excel tablosunu düzenli tabloya çevirir, üç maddelik yönetim özeti çıkarırsın; gelen kutuyu etiket ve taslakla sıfırlarsın.",
    output:
      "Elinde temiz tablo, üç maddelik karar cümlesi, slayt başına tek fikir ve Cuma 30 kapanış listesi kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan dağınık tabloyu A1 hücresinden düzenli tabloya nasıl çevirdiğini izle. Sonraki dersler lisans ister.",
  },
  "01_office_ai_ileri": {
    result:
      "Toplantı notundan eylem listesi çıkarırsın; e-posta yanıt taslağını sınıflandırır, üç dosyada sayıyı yan yana denetlersin.",
    output:
      "Elinde dört parçalı istem, toplantı eylem listesi, formül ve grafik notu ve sayı denetim çizelgesi kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan dört parçalı istemin nasıl kurulduğunu izle. Sonraki dersler lisans ister.",
  },
  "02_ecommerce_ai": {
    result:
      "E-ticaret ürün açıklamalarını yapay zekâyla aynı ölçüye oturtursun: başlıkta tür, renk, ölçü ve adet durur; övgü cümlesini Listing'e koymazsın.",
    output:
      "Elinde ölçülü başlık, beyaz kare görsel, iade kök nedeni, maliyetin üstünde fiyat, toplu açıklama şablonu ve senin gönderdiğin müşteri taslağı kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan ölçülü ürün başlığının nasıl kurulduğunu izle. Sonraki dersler lisans ister.",
  },
  "03_social_media_ai": {
    result:
      "Fikirden künye çıkarırsın; aynı stil ve üç saniyelik kancayla kısa içeriği yayından önce kontrol edersin.",
    output:
      "Elinde künye, tek stile bağlı beş kare, üç saniyelik kanca, altyazı notu ve haftalık akış çizgisi kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan fikirden künyeye nasıl geçildiğini izle. Sonraki dersler lisans ister.",
  },
  "04_chatbot_nocode": {
    result:
      "Kaçan müşteri mesajını karşılama, soru ve randevu akışına bağlarsın; WhatsApp veya web sohbetinde kod yazmadan ilk denemeyi kurarsın.",
    output: "Elinde karşılama akışı, randevu adımı, yanlış anlama kuralı ve teslim listesi kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan kaçan mesajın nasıl karşılandığını izle. Sonraki dersler lisans ister.",
  },
  "05_prompt_practice": {
    result:
      "Yapay zekâya rol, bağlam ve biçimle talimat verirsin; kaynakta olmayan cümleyi çıktıya almazsın.",
    output: "Elinde günlük istem seti, tablo ve plan şablonu ve kaynak sınırı kuralı kalır.",
    preview:
      "İlk ders herkese açık. Ödeme olmadan istemin anatomisini izle. Sonraki dersler lisans ister.",
  },
} as const;

function trustText(name: string, title: string, lessons: number): string {
  return `${name}, ${title}, bu ${lessons} dersi anlatır. İlk ders ücretsizdir; sonraki dersler ödeme sonrası açılır. Lisans 365 gündür. ${FOCUS_SALE_REFUND} Sertifika testi 70+ ile basılır; satın alma tek başına belge basmaz.`;
}

export function academyFocusSalePitch(slug: string): readonly FocusSalePitchRow[] | null {
  const spec = FOCUS_SALE_JOBS[slug as keyof typeof FOCUS_SALE_JOBS];
  if (!spec) {
    return null;
  }
  const instructor = academyInstructorBySlugOrNull(slug);
  const name = instructor?.name?.trim();
  const title = instructor?.title?.trim();
  const lessons = curriculumLessonCountForSlug(slug);
  if (!name || !title || lessons < 1) {
    return null;
  }
  const text: Record<FocusSalePitchStepId, string> = {
    result: spec.result,
    output: spec.output,
    preview: spec.preview,
    trust: trustText(name, title, lessons),
  };
  return FOCUS_SALE_PITCH_ORDER.map((id) => ({
    id,
    label: FOCUS_SALE_LABELS[id],
    text: text[id],
  }));
}

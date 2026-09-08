/**
 * Tohum ilan extras — format / gereksinim vitrin kartı değildir.
 * Süre `freelancer_jobs.due_days`, özet `brief` satırındandır.
 * Resmî yetkin.ai Örnek Görevleri: Büyüme Beşlisi 1:1 + Açık Deneme.
 */

export type JobListingExtras = {
  formats: readonly string[];
  durationDays: number;
  requirements: readonly string[];
  revisionAllowance: number;
};

export const FREELANCER_JOB_LISTING_EXTRAS = {
  fj_rail_icon_set: {
    formats: ["XLSX"],
    durationDays: 7,
    requirements: [
      "Power Query ile üç özet sayfa ve bir gösterge paneli",
      "Ham CSV birleştirilir; makro zorunlu değildir",
      "Kişisel öğrenci verisi yüzeye girmez",
    ],
    revisionAllowance: 3,
  },
  fj_rail_ql_banners: {
    formats: ["MD"],
    durationDays: 7,
    requirements: [
      "Beş compact SKU için pazaryeri ürün kartı",
      "Başlık, özellik maddeleri, 150–200 sözcük açıklama, 5 SSS",
      "Rakip mağaza kopyası kullanılmaz",
    ],
    revisionAllowance: 3,
  },
  fj_rail_seal_social: {
    formats: ["PNG"],
    durationDays: 7,
    requirements: [
      "1080×1080 ve 1200×630 şablonlar",
      "Açık ve koyu tema",
      "Kişisel hesap bilgisi yüzeye girmez",
    ],
    revisionAllowance: 3,
  },
  fj_rail_academy_copy: {
    formats: ["JSON"],
    durationDays: 7,
    requirements: [
      "WhatsApp chatbot akışı: karşılama, 8 SSS, insan devri",
      "Voiceflow JSON dışa aktarım",
      "Gizli anahtar veya kişisel veri akışa girmez",
    ],
    revisionAllowance: 3,
  },
  fj_rail_devlabs_prompts: {
    formats: ["MD"],
    durationDays: 5,
    requirements: [
      "8 adet hazır prompt şablonu",
      "Her şablon sistem + kullanıcı + örnek taşır",
      "Gizli anahtar veya kişisel veri prompta girmez",
    ],
    revisionAllowance: 3,
  },
  fj_yetkin_acik_deneme: {
    formats: ["MD"],
    durationDays: 5,
    requirements: [
      "Akademi antre sayfası için 8 maddelik dürüst kontrol listesi",
      "Başlık, fiyat, kasa ve vize cümlesi ayrı madde",
      "Erişim Hakkı istenmez",
    ],
    revisionAllowance: 3,
  },
} as const satisfies Record<string, JobListingExtras>;

export function jobListingExtrasById(id: string): JobListingExtras | undefined {
  if (id in FREELANCER_JOB_LISTING_EXTRAS) {
    return FREELANCER_JOB_LISTING_EXTRAS[id as keyof typeof FREELANCER_JOB_LISTING_EXTRAS];
  }
  return undefined;
}

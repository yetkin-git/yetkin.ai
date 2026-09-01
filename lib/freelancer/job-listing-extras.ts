/**
 * Tohum ilan extras — format / gereksinim vitrin kartı değildir.
 * Süre `freelancer_jobs.due_days`, özet `brief` satırındandır.
 */

export type JobListingExtras = {
  formats: readonly string[];
  durationDays: number;
  requirements: readonly string[];
  revisionAllowance: number;
};

export const FREELANCER_JOB_LISTING_EXTRAS = {
  fj_rail_icon_set: {
    formats: ["SVG", "PNG"],
    durationDays: 7,
    requirements: [
      "16 adet özel ikon hazırlanması",
      "Tek renk SVG, 24px ızgara",
      "Hazır ikon seti kullanılmaz",
    ],
    revisionAllowance: 3,
  },
  fj_rail_ql_banners: {
    formats: ["PNG"],
    durationDays: 7,
    requirements: [
      "3 ölçü tanıtım görseli",
      "1440×480 web şeridi, 1080×1080 kare, 1200×630 paylaşım kartı",
      "Stok insan fotoğrafı kullanılmaz",
    ],
    revisionAllowance: 3,
  },
  fj_rail_academy_copy: {
    formats: ["MD"],
    durationDays: 5,
    requirements: [
      "5 ders özeti, her biri 120–180 sözcük",
      "Sade Türkçe",
      "Sınav şıkları metne girmez",
    ],
    revisionAllowance: 3,
  },
  fj_rail_devlabs_prompts: {
    formats: ["MD"],
    durationDays: 5,
    requirements: [
      "8 adet hazır prompt şablonu",
      "Her şablon ayrı başlık altında",
      "Gizli anahtar veya kişisel veri prompta girmez",
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
} as const satisfies Record<string, JobListingExtras>;

export function jobListingExtrasById(id: string): JobListingExtras | undefined {
  if (id in FREELANCER_JOB_LISTING_EXTRAS) {
    return FREELANCER_JOB_LISTING_EXTRAS[id as keyof typeof FREELANCER_JOB_LISTING_EXTRAS];
  }
  return undefined;
}

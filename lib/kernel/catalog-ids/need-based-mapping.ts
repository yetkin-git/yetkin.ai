/**
 * İhtiyaç Odaklı Eşleme (Need-Based Mapping).
 * İşveren gündelik ihtiyaç seçer; teklif kapısı Akademi SKU slug'ına kilitlenir.
 * Client-safe: Prisma / node:crypto / müfredat gövdesi yok.
 * Sicil: 6 kapı × canlı 20 SKU.
 */

import {
  catalogPathwayTitleById,
  isAcademyPathwayId,
  parseAcademyPathwayId,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids/pathway-ids";
import type { AcademyCourseTitleSlug } from "@/lib/kernel/catalog-ids/course-slugs";

export const FREELANCER_NEED_IDS = [
  "logo-gorsel-sosyal-medya",
  "web-sitesi-yazilim",
  "reklam-kampanyasi",
  "excel-veri-otomasyon",
  "siber-guvenlik-sunucu-test",
  "ai-agent-entegrasyon",
] as const;

export type FreelancerNeedId = (typeof FREELANCER_NEED_IDS)[number];

export type ListingVisaLockId = FreelancerNeedId | AcademyPathwayId;

export const FREELANCER_NEED_TITLES = {
  "logo-gorsel-sosyal-medya": "Logo, Görsel & Sosyal Medya Tasarımı",
  "web-sitesi-yazilim": "Web Sitesi & Yazılım Geliştirme",
  "reklam-kampanyasi": "Google & Instagram Reklam Kampanyası",
  "excel-veri-otomasyon": "Excel, Veri Analizi & Otomasyon",
  "siber-guvenlik-sunucu-test": "Siber Güvenlik, Sunucu & Test",
  "ai-agent-entegrasyon": "AI Agent & Yapay Zekâ Entegrasyonu",
} as const satisfies Record<FreelancerNeedId, string>;

/** Organik ilan kilidi — işveren seçmezse tasarım ihtiyacı. */
export const FREELANCER_DEFAULT_NEED_ID = "logo-gorsel-sosyal-medya" satisfies FreelancerNeedId;

export const ACADEMY_NEED_SKU_CODES = [
  "CNV-MC",
  "UIUX-101",
  "LNK-MC",
  "FS-101",
  "FS-102",
  "FS-103",
  "PY-101",
  "PY-103",
  "GADS-MC",
  "META-MC",
  "ETIC-MC",
  "EXC-MC",
  "PY-102",
  "SEC-101",
  "SEC-102",
  "SEC-103",
  "AI-101",
  "AI-102",
  "AI-103",
  "YZ-101",
] as const;

export type AcademyNeedSkuCode = (typeof ACADEMY_NEED_SKU_CODES)[number];

export const FREELANCER_NEED_SKU_CODES = {
  "logo-gorsel-sosyal-medya": ["CNV-MC", "UIUX-101", "LNK-MC"],
  "web-sitesi-yazilim": ["FS-101", "FS-102", "FS-103", "PY-101", "PY-103"],
  "reklam-kampanyasi": ["GADS-MC", "META-MC", "ETIC-MC"],
  "excel-veri-otomasyon": ["EXC-MC", "PY-102"],
  "siber-guvenlik-sunucu-test": ["SEC-101", "SEC-102", "SEC-103"],
  "ai-agent-entegrasyon": ["AI-101", "AI-102", "AI-103", "YZ-101"],
} as const satisfies Record<FreelancerNeedId, readonly AcademyNeedSkuCode[]>;

/** SKU → yayın kurs slug'ı. Visa kapısı slug ile eşler; işveren SKU görmez. */
export const ACADEMY_SKU_SLUG_BY_CODE = {
  "CNV-MC": "canva-masterclass",
  "UIUX-101": "ux-temel",
  "LNK-MC": "linkedin-masterclass",
  "FS-101": "fullstack-temel",
  "FS-102": "fullstack-orta",
  "FS-103": "fullstack-ileri",
  "PY-101": "python-temel",
  "PY-103": "python-ileri",
  "GADS-MC": "google-ads-masterclass",
  "META-MC": "meta-ads-masterclass",
  "ETIC-MC": "eticaret-masterclass",
  "EXC-MC": "excel-masterclass",
  "PY-102": "python-orta",
  "SEC-101": "security-temel",
  "SEC-102": "security-orta",
  "SEC-103": "security-ileri",
  "AI-101": "ai-agent-temel",
  "AI-102": "ai-agent-orta",
  "AI-103": "ai-agent-ileri",
  "YZ-101": "ai-temel",
} as const satisfies Record<AcademyNeedSkuCode, AcademyCourseTitleSlug>;

const NEED_ID_SET = new Set<string>(FREELANCER_NEED_IDS);

export const FREELANCER_NEED_CATALOG: readonly { id: FreelancerNeedId; title: string }[] =
  FREELANCER_NEED_IDS.map((id) => ({
    id,
    title: FREELANCER_NEED_TITLES[id],
  }));

/** Eski dikey id → ihtiyaç. Filtre ve tabelada geriye dönük okuma. */
export const LEGACY_PATHWAY_TO_NEED = {
  "uiux-tasarim-sistemleri": "logo-gorsel-sosyal-medya",
  "pratik-beceriler-vatandas": "logo-gorsel-sosyal-medya",
  "pratik-linkedin-vatandas": "logo-gorsel-sosyal-medya",
  "fullstack-web-api": "web-sitesi-yazilim",
  "python-yazilim-veri": "web-sitesi-yazilim",
  "dijital-pazarlama": "reklam-kampanyasi",
  "icerik-e-ticaret": "reklam-kampanyasi",
  "is-uretkenligi-veri": "excel-veri-otomasyon",
  "siber-guvenlik-pentest": "siber-guvenlik-sunucu-test",
  "yz-muhendislik-agent": "ai-agent-entegrasyon",
  "ai-agent-mimarligi": "ai-agent-entegrasyon",
} as const satisfies Partial<Record<AcademyPathwayId, FreelancerNeedId>>;

export function isFreelancerNeedId(value: string): value is FreelancerNeedId {
  return NEED_ID_SET.has(value);
}

export function parseFreelancerNeedId(value: string | null | undefined): FreelancerNeedId | null {
  if (!value) {
    return null;
  }
  return isFreelancerNeedId(value) ? value : null;
}

export function parseListingVisaLockId(value: string | null | undefined): ListingVisaLockId | null {
  return parseFreelancerNeedId(value) ?? parseAcademyPathwayId(value);
}

export function isListingVisaLockId(value: string): value is ListingVisaLockId {
  return isFreelancerNeedId(value) || isAcademyPathwayId(value);
}

export function academySlugForNeedSku(code: string): AcademyCourseTitleSlug | null {
  if (!(code in ACADEMY_SKU_SLUG_BY_CODE)) {
    return null;
  }
  return ACADEMY_SKU_SLUG_BY_CODE[code as AcademyNeedSkuCode];
}

/**
 * İhtiyacın teklif kapısını açan kurs slug'ları.
 * SKU çözülemezse satır düşer; boş küme kapıyı kapatır (fail-closed).
 */
export function qualifyingCourseSlugsForNeed(needId: FreelancerNeedId): readonly string[] {
  const slugs: string[] = [];
  for (const code of FREELANCER_NEED_SKU_CODES[needId]) {
    const slug = academySlugForNeedSku(code);
    if (slug) {
      slugs.push(slug);
    }
  }
  return slugs;
}

export function catalogNeedTitleById(id: string): string | null {
  if (!isFreelancerNeedId(id)) {
    return null;
  }
  return FREELANCER_NEED_TITLES[id];
}

export function listingNeedId(lockId: string): FreelancerNeedId | null {
  if (isFreelancerNeedId(lockId)) {
    return lockId;
  }
  if (isAcademyPathwayId(lockId) && lockId in LEGACY_PATHWAY_TO_NEED) {
    return LEGACY_PATHWAY_TO_NEED[lockId as keyof typeof LEGACY_PATHWAY_TO_NEED] ?? null;
  }
  return null;
}

export function listingVisaLockTitle(lockId: string): string | null {
  return catalogNeedTitleById(lockId) ?? catalogPathwayTitleById(lockId);
}

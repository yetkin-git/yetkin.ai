/**
 * İhtiyaç Odaklı Eşleme (Need-Based Mapping).
 * İşveren gündelik ihtiyaç seçer; teklif kapısı Akademi SKU slug'ına kilitlenir.
 * Client-safe: Prisma / node:crypto / müfredat gövdesi yok.
 *
 * Bölüm A: 5 compact SKU ile birebir dürüst kapı (vize/rozet şartı).
 * Bölüm B: serbest örnek kategorileri — arka planda Açık Deneme mantığı (vize yok, OPEN).
 * Eski meslek id'leri (fullstack / sızma testi / UI-UX) okumada kanona düşer.
 */

import {
  catalogPathwayTitleById,
  isAcademyPathwayId,
  parseAcademyPathwayId,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids/pathway-ids";
import type { AcademyCourseTitleSlug } from "@/lib/kernel/catalog-ids/course-slugs";

/** Bölüm A — Yetkin.ai Garantili Kapılar. Vize/rozet şartı aranır. */
export const FREELANCER_GUARANTEED_NEED_IDS = [
  "excel-veri-otomasyon",
  "eticaret-pazaryeri",
  "logo-gorsel-sosyal-medya",
  "chatbot-musteri-hizmetleri",
  "prompt-uretkenlik",
] as const;

/** Bölüm B — Açık Deneme. Vize istenmez; Açık Deneme mantığına bağlanır. */
export const FREELANCER_MARKETPLACE_NEED_IDS = [
  "yazilim-web-mobil",
  "grafik-tasarim-kimlik",
  "dijital-pazarlama-seo",
  "ceviri-metin-yazarligi",
  "diger-genel-isler",
] as const;

export const FREELANCER_NEED_IDS = [
  ...FREELANCER_GUARANTEED_NEED_IDS,
  ...FREELANCER_MARKETPLACE_NEED_IDS,
  "acik-deneme",
] as const;

export type FreelancerGuaranteedNeedId = (typeof FREELANCER_GUARANTEED_NEED_IDS)[number];
export type FreelancerMarketplaceNeedId = (typeof FREELANCER_MARKETPLACE_NEED_IDS)[number];
export type FreelancerNeedId = (typeof FREELANCER_NEED_IDS)[number];

export const FREELANCER_OPEN_TRIAL_NEED_ID = "acik-deneme" satisfies FreelancerNeedId;

export type ListingVisaLockId = FreelancerNeedId | AcademyPathwayId;

export const FREELANCER_NEED_TITLES = {
  "excel-veri-otomasyon": "Ofis Yapay Zekâ (Excel, Word, e-posta)",
  "eticaret-pazaryeri": "E-Ticaret Asistanlığı",
  "logo-gorsel-sosyal-medya": "Sosyal Medya İçerik ve Görsel Üretimi",
  "chatbot-musteri-hizmetleri": "Kodsuz Chatbot ve Müşteri Hizmetleri",
  "prompt-uretkenlik": "Prompt ve Günlük Üretkenlik",
  "yazilim-web-mobil": "Yazılım, Web & Mobil Uygulama",
  "grafik-tasarim-kimlik": "Grafik Tasarım & Kurumsal Kimlik",
  "dijital-pazarlama-seo": "Dijital Pazarlama, SEO & Reklam",
  "ceviri-metin-yazarligi": "Çeviri & Metin Yazarlığı",
  "diger-genel-isler": "Diğer / Genel İşler",
  "acik-deneme": "Açık Deneme (Erişim Hakkı istenmez)",
} as const satisfies Record<FreelancerNeedId, string>;

/** Organik ilan kilidi — işveren seçmezse sosyal içerik ihtiyacı. */
export const FREELANCER_DEFAULT_NEED_ID = "logo-gorsel-sosyal-medya" satisfies FreelancerNeedId;

/**
 * Vitrin SKU kodları — `academyModuleCodeBySlug` ile aynı harf.
 * UIUX-101 / FS-101 / GADS-MC / SEC-101 / YZ-101 yayında değildir.
 */
export const ACADEMY_NEED_SKU_CODES = [
  "OFF-101",
  "EC-102",
  "SM-103",
  "BOT-104",
  "PR-105",
] as const;

export type AcademyNeedSkuCode = (typeof ACADEMY_NEED_SKU_CODES)[number];

export const FREELANCER_NEED_SKU_CODES = {
  "excel-veri-otomasyon": ["OFF-101"],
  "eticaret-pazaryeri": ["EC-102"],
  "logo-gorsel-sosyal-medya": ["SM-103"],
  "chatbot-musteri-hizmetleri": ["BOT-104"],
  "prompt-uretkenlik": ["PR-105"],
  "yazilim-web-mobil": [],
  "grafik-tasarim-kimlik": [],
  "dijital-pazarlama-seo": [],
  "ceviri-metin-yazarligi": [],
  "diger-genel-isler": [],
  "acik-deneme": [],
} as const satisfies Record<FreelancerNeedId, readonly AcademyNeedSkuCode[]>;

/** SKU → yayın kurs slug'ı. Visa kapısı slug ile eşler; işveren SKU görmez. */
export const ACADEMY_SKU_SLUG_BY_CODE: Record<AcademyNeedSkuCode, AcademyCourseTitleSlug> = {
  "OFF-101": "01_office_ai",
  "EC-102": "02_ecommerce_ai",
  "SM-103": "03_social_media_ai",
  "BOT-104": "04_chatbot_nocode",
  "PR-105": "05_prompt_practice",
};

/**
 * Diskte kalmış eski ihtiyaç id → yayın kanonu.
 * Siber/sızma kapısı prompt belgesine bağlanmaz; Açık Deneme'ye düşer.
 */
export const FREELANCER_LEGACY_NEED_ALIASES = {
  "web-sitesi-yazilim": "eticaret-pazaryeri",
  "reklam-kampanyasi": "logo-gorsel-sosyal-medya",
  "siber-guvenlik-sunucu-test": "acik-deneme",
  "siber-guvenlik-pentest": "acik-deneme",
  "ai-agent-entegrasyon": "chatbot-musteri-hizmetleri",
  "fullstack-web-api": "eticaret-pazaryeri",
  "uiux-tasarim-sistemleri": "logo-gorsel-sosyal-medya",
  "yz-muhendislik-agent": "chatbot-musteri-hizmetleri",
} as const satisfies Record<string, FreelancerNeedId>;

const NEED_ID_SET = new Set<string>(FREELANCER_NEED_IDS);
const OPEN_TRIAL_NEED_SET = new Set<string>([
  FREELANCER_OPEN_TRIAL_NEED_ID,
  ...FREELANCER_MARKETPLACE_NEED_IDS,
]);

function catalogRows(
  ids: readonly FreelancerNeedId[],
): readonly { id: FreelancerNeedId; title: string }[] {
  return ids.map((id) => ({
    id,
    title: FREELANCER_NEED_TITLES[id],
  }));
}

export const FREELANCER_GUARANTEED_NEED_CATALOG = catalogRows(FREELANCER_GUARANTEED_NEED_IDS);
export const FREELANCER_MARKETPLACE_NEED_CATALOG = catalogRows(FREELANCER_MARKETPLACE_NEED_IDS);
export const FREELANCER_NEED_CATALOG: readonly { id: FreelancerNeedId; title: string }[] =
  catalogRows(FREELANCER_NEED_IDS);

/** Eski dikey id → ihtiyaç. Filtre ve tabelada geriye dönük okuma. */
export const LEGACY_PATHWAY_TO_NEED = {} as const satisfies Partial<
  Record<AcademyPathwayId, FreelancerNeedId>
>;

export function isFreelancerNeedId(value: string): value is FreelancerNeedId {
  return NEED_ID_SET.has(value);
}

export function isFreelancerGuaranteedNeedId(value: string): value is FreelancerGuaranteedNeedId {
  return (FREELANCER_GUARANTEED_NEED_IDS as readonly string[]).includes(value);
}

export function isFreelancerMarketplaceNeedId(value: string): value is FreelancerMarketplaceNeedId {
  return (FREELANCER_MARKETPLACE_NEED_IDS as readonly string[]).includes(value);
}

/** Açık Deneme ve Bölüm B pazaryeri kategorileri — vize kalkanı çalışmaz. */
export function isOpenTrialNeed(value: string): boolean {
  return OPEN_TRIAL_NEED_SET.has(value);
}

export function parseFreelancerNeedId(value: string | null | undefined): FreelancerNeedId | null {
  if (!value) {
    return null;
  }
  if (isFreelancerNeedId(value)) {
    return value;
  }
  if (Object.prototype.hasOwnProperty.call(FREELANCER_LEGACY_NEED_ALIASES, value)) {
    return FREELANCER_LEGACY_NEED_ALIASES[value as keyof typeof FREELANCER_LEGACY_NEED_ALIASES];
  }
  return null;
}

export function parseListingVisaLockId(value: string | null | undefined): ListingVisaLockId | null {
  return parseFreelancerNeedId(value) ?? parseAcademyPathwayId(value);
}

export function isListingVisaLockId(value: string): value is ListingVisaLockId {
  return parseListingVisaLockId(value) !== null;
}

export function academySlugForNeedSku(code: string): string | null {
  if (!(code in ACADEMY_SKU_SLUG_BY_CODE)) {
    return null;
  }
  return ACADEMY_SKU_SLUG_BY_CODE[code as AcademyNeedSkuCode];
}

/**
 * İhtiyacın teklif kapısını açan kurs slug'ları.
 * SKU çözülemezse satır düşer; boş küme nitelikli kapıyı kapatır (fail-closed).
 * Açık Deneme ve Bölüm B pazaryeri bilinçli boştur — Erişim Hakkı istenmez.
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
  const canonical = parseFreelancerNeedId(id);
  if (!canonical) {
    return null;
  }
  return FREELANCER_NEED_TITLES[canonical];
}

export function listingNeedId(lockId: string): FreelancerNeedId | null {
  const fromNeed = parseFreelancerNeedId(lockId);
  if (fromNeed) {
    return fromNeed;
  }
  if (isAcademyPathwayId(lockId) && lockId in LEGACY_PATHWAY_TO_NEED) {
    return LEGACY_PATHWAY_TO_NEED[lockId as keyof typeof LEGACY_PATHWAY_TO_NEED] ?? null;
  }
  return null;
}

export function listingVisaLockTitle(lockId: string): string | null {
  return catalogNeedTitleById(lockId) ?? catalogPathwayTitleById(lockId);
}

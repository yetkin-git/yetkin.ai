import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import type { ListingVisaLockId } from "@/lib/kernel/catalog-ids";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { FREELANCER_JOB_LISTING_EXTRAS } from "@/lib/freelancer/job-listing-extras";

/**
 * Ops freelancer vitrin tohum sicili (ADIM 11).
 * Resmî yetkin.ai Örnek Görevleri: Büyüme Beşlisi 5 kapı (OFF-101…PR-105) + Açık Deneme.
 * Vitrin başlığı «Örnek Görev» der; kartta OPEN «Açık» basılmaz (piyasa yanılsaması yok).
 * İlan tutarı `freelancer_jobs.budget_minor` satırındadır; katalog taban/hold
 * bandı Admin sicilidir (S11-A). Motor bütçe bandını hâlâ kod sabitinden keser.
 * SQL: `supabase/migrations/20260814110000_freelancer_job_seed.sql`.
 * Sahte bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
 */
export type FreelancerCatalogSeed = {
  id: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  seedAmountMinor: number;
  seedMinMinor: number;
  seedMaxMinor: number;
  description: string;
};

export type FreelancerJobSeed = {
  id: string;
  title: string;
  brief: string;
  budgetMinor: number;
  visaPathwayId: ListingVisaLockId;
  formats: readonly string[];
  durationDays: number;
  requirements: readonly string[];
  revisionAllowance: number;
};

export const FREELANCER_SEED_MODULE_KEY = "freelancer" as const;

export const FREELANCER_SEED_CURRENCY = SETTLEMENT_CURRENCY;

/** Hazine sentinel — Auth login değildir. Sahte kullanıcı INSERT yok. */
export const FREELANCER_SEED_CLIENT_ID = PLATFORM_TREASURY_USER_ID;

export const FREELANCER_JOB_FLOOR_UNIT_KEY = "job-posting:floor" as const;

export const FREELANCER_ESCROW_HOLD_UNIT_KEY = "escrow:hold" as const;

export const FREELANCER_CATALOG_SEEDS: readonly FreelancerCatalogSeed[] = [
  {
    id: "cat_freelancer_job_posting_floor",
    unitKey: FREELANCER_JOB_FLOOR_UNIT_KEY,
    unitType: "MINOR",
    seedAmountMinor: FREELANCER_JOB_MIN_MINOR,
    seedMinMinor: FREELANCER_JOB_MIN_MINOR,
    seedMaxMinor: FREELANCER_JOB_MAX_MINOR,
    description: "Freelancer mühürlü ilan bütçe tabanı / tavanı.",
  },
  {
    id: "cat_freelancer_escrow_hold",
    unitKey: FREELANCER_ESCROW_HOLD_UNIT_KEY,
    unitType: "BPS",
    seedAmountMinor: HOLD_BPS_DEFAULT,
    seedMinMinor: HOLD_BPS_MIN,
    seedMaxMinor: HOLD_BPS_MAX,
    description: "Freelancer emanet platform hold bandı (1000–1500 bps).",
  },
];

const SEED_EMPLOYER = `İşveren: ${YETKIN_BRAND} Ekosistem.`;

/** Tohum vitrin başlık öneki — gerçek işveren ilanı değildir. */
export const FREELANCER_EXAMPLE_JOB_TITLE_PREFIX = `${YETKIN_BRAND} Örnek Görev` as const;

function exampleJobTitle(skill: string): string {
  return `${FREELANCER_EXAMPLE_JOB_TITLE_PREFIX} — ${skill}`;
}

export const FREELANCER_JOB_SEEDS: readonly FreelancerJobSeed[] = [
  {
    id: "fj_rail_icon_set",
    title: exampleJobTitle("Excel Veri Otomasyonu"),
    brief: `Akademi ilerleme CSV'sinden Power Query ile üç özet sayfa ve bir gösterge paneli. Teslim formatı: XLSX. Süre: 7 gün. 3 revizyon hakkı. Teklif için Ofis Yapay Zekâ belgesi gerekir. ${SEED_EMPLOYER}`,
    budgetMinor: 850_000,
    visaPathwayId: "excel-veri-otomasyon",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_icon_set,
  },
  {
    id: "fj_rail_ql_banners",
    title: exampleJobTitle("E-Ticaret Pazaryeri Asistanlığı"),
    brief: `Beş compact SKU için pazaryeri ürün kartı: başlık, özellik maddeleri, 150–200 sözcük açıklama ve 5 SSS. Teslim formatı: Markdown. Süre: 7 gün. 3 revizyon hakkı. Teklif için E-Ticaret Asistanlığı belgesi gerekir. ${SEED_EMPLOYER}`,
    budgetMinor: 750_000,
    visaPathwayId: "eticaret-pazaryeri",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_ql_banners,
  },
  {
    id: "fj_rail_seal_social",
    title: exampleJobTitle("Sosyal Medya İçerik Üretimi"),
    brief: `Sertifika paylaşımı için 1080×1080 ve 1200×630 şablonlar; açık ve koyu tema. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Sosyal Medya İçerik belgesi gerekir. ${SEED_EMPLOYER}`,
    budgetMinor: 600_000,
    visaPathwayId: "logo-gorsel-sosyal-medya",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_seal_social,
  },
  {
    id: "fj_rail_academy_copy",
    title: exampleJobTitle("WhatsApp Chatbot Kurulumu"),
    brief: `Akademi destek SSS için WhatsApp chatbot akışı: karşılama, 8 soru ve insan devri. Teslim formatı: Voiceflow JSON. Süre: 7 gün. 3 revizyon hakkı. Teklif için Kodsuz Chatbot belgesi gerekir. ${SEED_EMPLOYER}`,
    budgetMinor: 650_000,
    visaPathwayId: "chatbot-musteri-hizmetleri",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_academy_copy,
  },
  {
    id: "fj_rail_devlabs_prompts",
    title: exampleJobTitle("Prompt ve Günlük Üretkenlik"),
    brief: `Beş compact SKU için 8 kullanıma hazır prompt şablonu (sistem, kullanıcı, örnek). Teslim formatı: Markdown. Süre: 5 gün. 3 revizyon hakkı. Teklif için Prompt Üretkenlik belgesi gerekir. ${SEED_EMPLOYER}`,
    budgetMinor: 400_000,
    visaPathwayId: "prompt-uretkenlik",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_devlabs_prompts,
  },
  {
    id: "fj_yetkin_acik_deneme",
    title: exampleJobTitle("Açık Deneme"),
    brief: `Akademi antre sayfası için 8 maddelik dürüst kontrol listesi. Teslim formatı: Markdown. Süre: 5 gün. 3 revizyon hakkı. Açık Deneme — Erişim Hakkı istenmez. ${SEED_EMPLOYER}`,
    budgetMinor: 250_000,
    visaPathwayId: "acik-deneme",
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_yetkin_acik_deneme,
  },
];

export function freelancerJobSeedById(id: string): FreelancerJobSeed | undefined {
  return FREELANCER_JOB_SEEDS.find((row) => row.id === id);
}

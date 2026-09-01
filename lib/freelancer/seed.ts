import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import type { ListingVisaLockId } from "@/lib/kernel/catalog-ids";
import { FREELANCER_SEED_VISA_PATHWAY } from "@/lib/freelancer/job-visa-lock";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { FREELANCER_JOB_LISTING_EXTRAS } from "@/lib/freelancer/job-listing-extras";

/**
 * Ops freelancer vitrin tohum sicili (ADIM 11).
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

export const FREELANCER_JOB_SEEDS: readonly FreelancerJobSeed[] = [
  {
    id: "fj_rail_icon_set",
    title: "SVG İkon Seti Tasarımı",
    brief: `16 adet özel ikon hazırlanması. Teslim formatı: SVG kaynak dosyaları ve 256px PNG önizlemeler. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: ${YETKIN_BRAND}.`,
    budgetMinor: 850_000,
    visaPathwayId: FREELANCER_SEED_VISA_PATHWAY,
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_icon_set,
  },
  {
    id: "fj_rail_ql_banners",
    title: "Web ve Sosyal Medya Banner Tasarımı",
    brief: `Üç ölçü tanıtım görseli: 1440×480 web şeridi, 1080×1080 kare ve 1200×630 paylaşım kartı. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: ${YETKIN_BRAND}.`,
    budgetMinor: 750_000,
    visaPathwayId: FREELANCER_SEED_VISA_PATHWAY,
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_ql_banners,
  },
  {
    id: "fj_rail_academy_copy",
    title: "Akademi Ders Özetlerinin Düzenlenmesi",
    brief: `Beş ders özetinin sade Türkçeye çekilmesi (her özet 120–180 sözcük). Teslim formatı: Markdown (.md). Süre: 5 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: ${YETKIN_BRAND}.`,
    budgetMinor: 350_000,
    visaPathwayId: FREELANCER_SEED_VISA_PATHWAY,
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_academy_copy,
  },
  {
    id: "fj_rail_devlabs_prompts",
    title: "Prompt Şablonları Dokümantasyonu",
    brief: `8 adet kullanıma hazır prompt şablonu. Teslim formatı: Markdown (.md). Süre: 5 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: ${YETKIN_BRAND}.`,
    budgetMinor: 400_000,
    visaPathwayId: FREELANCER_SEED_VISA_PATHWAY,
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_devlabs_prompts,
  },
  {
    id: "fj_rail_seal_social",
    title: "Sosyal Medya Paylaşım Şablonları",
    brief: `Sertifika paylaşımı için 1080×1080 ve 1200×630 şablonlar; açık ve koyu tema. Teslim formatı: PNG. Süre: 7 gün. 3 revizyon hakkı. Teklif için Yapay Zekâ Mühendisliği sertifikası gerekir. İşveren: ${YETKIN_BRAND}.`,
    budgetMinor: 600_000,
    visaPathwayId: FREELANCER_SEED_VISA_PATHWAY,
    ...FREELANCER_JOB_LISTING_EXTRAS.fj_rail_seal_social,
  },
];

export function freelancerJobSeedById(id: string): FreelancerJobSeed | undefined {
  return FREELANCER_JOB_SEEDS.find((row) => row.id === id);
}

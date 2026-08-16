import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";

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
    id: "fj_rail_escrow_audit",
    title: "Yetkin Rail: EscrowHold kilit denetimi",
    brief:
      "Yayında OPEN ilan. Teklif kabulünde tutar EscrowHold ile kilitlenir; teslim teyidine kadar serbest kalmaz. Teslimat: mühürlü emek yolunun (ilan, emanet, RELEASED) yazılı denetimi. Sahte settlement yok. Platform hold bps katalog bandındadır.",
    budgetMinor: 1_250_000,
  },
  {
    id: "fj_ray_sinyal_brief",
    title: "Raylı sinyal: Fail-safe brief ve anklaşman özeti",
    brief:
      "Anklaşman (interlocking) fail-safe ilkesi, ray devresi tespiti ve kırmızı aspekt işletme anlamı için mühürlü teknik brief. Teslim: sözleşme mesajı ve artifact. Ödeme EscrowHold içinde kalır; serbest bırakma RELEASED ve kariyer vizesi kapısıdır.",
    budgetMinor: 875_000,
  },
];

export function freelancerJobSeedById(id: string): FreelancerJobSeed | undefined {
  return FREELANCER_JOB_SEEDS.find((row) => row.id === id);
}

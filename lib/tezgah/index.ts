export const MODULE_ID = "tezgah" as const;

/** Seç → doldur → üret → kopyala. Cüzdan adımı yoktur. */
export const TEZGAH_HAPPY_PATH = ["pick-tool", "fill", "generate", "copy"] as const;

export {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_PATH,
  TEZGAH_PRO_MONTHLY_CREDITS,
  TEZGAH_ROLLOVER_BPS,
  TEZGAH_TOOLS,
  tezgahQuotaLine,
  tezgahToolById,
} from "@/lib/tezgah/catalog";

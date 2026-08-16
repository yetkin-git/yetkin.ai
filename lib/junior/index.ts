export const MODULE_ID = "junior" as const;

/** Faz 7A — yaş kapısı → ebeveyn onayı → harçlık tavanı. Yetişkin Wallet kopyası yok. */
export const JUNIOR_HAPPY_PATH = ["age-gate", "guardian-consent", "allowance"] as const;

export type JuniorHappyPathStep = (typeof JUNIOR_HAPPY_PATH)[number];

export {
  isAdultInTurkey,
  evaluateJuniorAge,
  assertEligibleJuniorMinor,
  type JuniorAgeGate,
} from "@/lib/junior/age-gate";
export { MEB_TRACKS, mebTrackForAge, listMebTracksForAge } from "@/lib/junior/meb-catalog";
export {
  upsertJuniorProfile,
  consentJuniorProfile,
  setJuniorWeeklyCap,
  grantJuniorAllowance,
  buildJuniorPulse,
} from "@/lib/junior/engine";
export {
  upsertJuniorProfileInputSchema,
  juniorConsentInputSchema,
  setJuniorWeeklyCapInputSchema,
  grantJuniorAllowanceInputSchema,
} from "@/lib/junior/schemas";
export type {
  JuniorAllowanceRecord,
  JuniorProfileRecord,
  JuniorPulse,
  JuniorStore,
} from "@/lib/junior/types";

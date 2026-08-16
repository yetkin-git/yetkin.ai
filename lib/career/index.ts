export const MODULE_ID = "career" as const;

/** Faz 3B dar yüzey — prova/yol haritası yok; kanıt → vize → portföy. */
export const CAREER_HAPPY_PATH = ["proof", "visa-stamp", "portfolio"] as const;

export type CareerHappyPathStep = (typeof CAREER_HAPPY_PATH)[number];

export {
  isCareerUniqueViolation,
  issueCareerVisaStamp,
  syncCareerVisaStamps,
  tryIssueCareerVisaStamp,
} from "@/lib/career/engine";
export {
  LISTING_ACCESS_VISA_DENIED,
  LISTING_ACCESS_VISA_KIND,
  assertAcademyCareerVisaForListing,
  hasValidAcademyCareerVisa,
} from "@/lib/career/visa-gate";
export {
  careerSourceModuleId,
  careerVisaKey,
  toPassportVisaStamp,
} from "@/lib/career/types";
export type {
  CareerPortfolioItemRecord,
  CareerProofStore,
  CareerPulse,
  CareerStampWriteClient,
  CareerStore,
  CareerVisaSourceKind,
  CareerVisaStampRecord,
  SealedCareerProof,
} from "@/lib/career/types";

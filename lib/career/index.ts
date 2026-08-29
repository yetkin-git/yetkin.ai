export const MODULE_ID = "career" as const;

/** Kanıt → vize → portföy. Tabela vize-ilan eşleşmesidir; SWOT/mülakat canlı tavan değildir. */
export const CAREER_HAPPY_PATH = ["proof", "visa-stamp", "portfolio"] as const;

export {
  careerPulseFromLiveBoard,
  projectLiveCareerBoard,
} from "@/lib/career/live";
export type { LiveCareerBoard, LiveCareerStamp } from "@/lib/career/live";
export {
  careerStampContractHref,
  careerStampCourseHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
export {
  buildCareerVisaScopeBoard,
  listingVisaScopeSign,
} from "@/lib/career/visa-scope-board";
export type {
  ListingVisaScopeSignView,
  VisaScopeCourse,
  VisaScopeDoor,
} from "@/lib/career/visa-scope-board";

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
  inspectAcademyCareerVisaForListing,
} from "@/lib/career/visa-gate";
export type { ListingVisaGateCode, ListingVisaGateDecision } from "@/lib/career/visa-gate";
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

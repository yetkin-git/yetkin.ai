import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const KURUMSAL_MODULE_KEY = "kurumsal" as const;
export const KURUMSAL_JOB_FLOOR_UNIT_KEY = "job-posting:floor" as const;

export type CorporateCompanyStatus = "ACTIVE" | "SUSPENDED";
export type CorporateJobPostingStatus = "SEALED" | "AWARDED" | "RELEASED" | "REFUNDED";
export type CorporateWorkbenchKind = "FREELANCER" | "DEVLABS";
export type CorporateJobOfferStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";

export type CorporateCompanyRecord = {
  id: string;
  userId: string;
  legalName: string;
  tradeName: string | null;
  jurisdiction: string;
  taxId: string | null;
  status: CorporateCompanyStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CorporateJobPostingRecord = {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  brief: string;
  budgetMinor: AmountMinor;
  currencyCode: CurrencyCode;
  workbenchKind: CorporateWorkbenchKind;
  escrowHoldId: string;
  status: CorporateJobPostingStatus;
  awardedUserId: string | null;
  awardedDevLabsProjectId: string | null;
  holdBps: number;
  grossMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  sealedAt: Date;
  awardedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CorporateJobOfferRecord = {
  id: string;
  postingId: string;
  bidderId: string;
  coverNote: string;
  status: CorporateJobOfferStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type KurumsalPulse = {
  companiesOwned: number;
  sealedPostings: number;
  awardedPostings: number;
  releasedPostings: number;
  pendingEscrowMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export type KurumsalStore = {
  insertCompany(company: CorporateCompanyRecord): Promise<CorporateCompanyRecord>;
  getCompany(id: string): Promise<CorporateCompanyRecord | null>;
  getCompanyByUserId(userId: string): Promise<CorporateCompanyRecord | null>;
  updateCompany(
    id: string,
    patch: Partial<
      Pick<
        CorporateCompanyRecord,
        "legalName" | "tradeName" | "jurisdiction" | "taxId" | "status" | "updatedAt"
      >
    >,
  ): Promise<CorporateCompanyRecord>;
  insertPosting(posting: CorporateJobPostingRecord): Promise<CorporateJobPostingRecord>;
  getPosting(id: string): Promise<CorporateJobPostingRecord | null>;
  getPostingByEscrowHoldId(escrowHoldId: string): Promise<CorporateJobPostingRecord | null>;
  listPostingsByOwner(userId: string): Promise<CorporateJobPostingRecord[]>;
  listSealedPostings(): Promise<CorporateJobPostingRecord[]>;
  insertOffer(offer: CorporateJobOfferRecord): Promise<CorporateJobOfferRecord>;
  getOffer(id: string): Promise<CorporateJobOfferRecord | null>;
  getOfferByPostingAndBidder(
    postingId: string,
    bidderId: string,
  ): Promise<CorporateJobOfferRecord | null>;
  listOffersForPosting(postingId: string): Promise<CorporateJobOfferRecord[]>;
  updateOffer(
    id: string,
    patch: Partial<Pick<CorporateJobOfferRecord, "status" | "updatedAt">>,
  ): Promise<CorporateJobOfferRecord>;
  updatePosting(
    id: string,
    patch: Partial<
      Pick<
        CorporateJobPostingRecord,
        | "status"
        | "awardedUserId"
        | "awardedDevLabsProjectId"
        | "awardedAt"
        | "releasedAt"
        | "refundedAt"
        | "updatedAt"
      >
    >,
  ): Promise<CorporateJobPostingRecord>;
  pulseForUser(userId: string): Promise<KurumsalPulse>;
};

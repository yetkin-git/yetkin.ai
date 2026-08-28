import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const JUNIOR_MODULE_KEY = "junior" as const;
export const JUNIOR_JURISDICTION = "TR" as const;
export const JUNIOR_MIN_AGE_YEARS = 10;
export const JUNIOR_ADULT_AGE_YEARS = 18;
export const JUNIOR_ALLOWANCE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

export type JuniorProfileStatus = "PENDING_GUARDIAN" | "GUARDIAN_LINKED";
export type GuardianBondStatus = "PENDING" | "ACTIVE";
export type GuardianInviteInitiator = "CHILD" | "GUARDIAN";
export type GuardianInviteStatus = "PENDING" | "CONSUMED" | "REVOKED";

export type JuniorAgeVerdict = {
  dateOfBirth: string;
  years: number;
  isAdult: boolean;
  isEligibleMinor: boolean;
};

export type JuniorProfileRecord = {
  id: string;
  userId: string;
  dateOfBirth: string;
  guardianUserId: string | null;
  jurisdiction: typeof JUNIOR_JURISDICTION;
  status: JuniorProfileStatus;
  guardianConsentAt: Date | null;
  mebTrackKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuardianInviteRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  tokenPrefix: string;
  initiatorRole: GuardianInviteInitiator;
  juniorProfileId: string | null;
  counterpartUserId: string | null;
  status: GuardianInviteStatus;
  childApprovedAt: Date | null;
  guardianApprovedAt: Date | null;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JuniorAllowanceRecord = {
  id: string;
  juniorProfileId: string;
  userId: string;
  guardianUserId: string;
  currencyCode: CurrencyCode;
  amountMinor: AmountMinor;
  weeklyCapMinor: AmountMinor;
  grantedThisPeriodMinor: AmountMinor;
  periodStartedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type JuniorPulse = {
  status: JuniorProfileStatus | null;
  bondStatus: GuardianBondStatus | null;
  hasGuardianConsent: boolean;
  remainingMinor: AmountMinor;
  weeklyCapMinor: AmountMinor;
  mebTrackKey: string | null;
  currencyCode: CurrencyCode;
  wardsPending: number;
  wardsLinked: number;
  pendingInvites: number;
};

export type JuniorStore = {
  insertProfile(profile: JuniorProfileRecord): Promise<JuniorProfileRecord>;
  getProfileByUserId(userId: string): Promise<JuniorProfileRecord | null>;
  getProfile(id: string): Promise<JuniorProfileRecord | null>;
  listWardsForGuardian(guardianUserId: string): Promise<JuniorProfileRecord[]>;
  updateProfile(
    id: string,
    patch: Partial<
      Pick<
        JuniorProfileRecord,
        "status" | "guardianConsentAt" | "mebTrackKey" | "guardianUserId" | "updatedAt"
      >
    >,
  ): Promise<JuniorProfileRecord>;
  insertInvite(invite: GuardianInviteRecord): Promise<GuardianInviteRecord>;
  getInviteByTokenHash(tokenHash: string): Promise<GuardianInviteRecord | null>;
  listPendingInvitesForUser(userId: string, now?: Date): Promise<GuardianInviteRecord[]>;
  updateInvite(
    id: string,
    patch: Partial<
      Pick<
        GuardianInviteRecord,
        | "status"
        | "juniorProfileId"
        | "counterpartUserId"
        | "childApprovedAt"
        | "guardianApprovedAt"
        | "consumedAt"
        | "updatedAt"
      >
    >,
  ): Promise<GuardianInviteRecord>;
  /** PENDING + TTL geçerli iken tek satır tüketir; yarışta ikinci çağrı null. */
  consumePendingInvite(
    id: string,
    now: Date,
    patch: Pick<
      GuardianInviteRecord,
      "juniorProfileId" | "counterpartUserId" | "childApprovedAt" | "guardianApprovedAt" | "consumedAt" | "updatedAt"
    >,
  ): Promise<GuardianInviteRecord | null>;
  insertAllowance(allowance: JuniorAllowanceRecord): Promise<JuniorAllowanceRecord>;
  getAllowanceByProfileId(juniorProfileId: string): Promise<JuniorAllowanceRecord | null>;
  updateAllowance(
    id: string,
    patch: Partial<
      Pick<
        JuniorAllowanceRecord,
        | "amountMinor"
        | "weeklyCapMinor"
        | "grantedThisPeriodMinor"
        | "periodStartedAt"
        | "updatedAt"
      >
    >,
  ): Promise<JuniorAllowanceRecord>;
  pulseForUser(userId: string): Promise<JuniorPulse>;
};

import type { JuniorSubscriptionRow } from "@/lib/junior/plan";

export type { JuniorSubscriptionRow };

export type JuniorProfileRow = {
  id: string;
  userId: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  consentAt: Date;
  activeConsentId: string | null;
  activeConsentVersion: string | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
  createdAt: Date;
};

export type JuniorProfileInsert = Omit<
  JuniorProfileRow,
  "id" | "createdAt" | "activeConsentId" | "activeConsentVersion"
> & {
  birthYear: number;
};

export type JuniorGuardianConsentDraft = {
  consentVersion: string;
  noticeSha256: string;
  guardianBirthYear: number;
  consentAt: Date;
};

export type JuniorGuardianConsentRow = {
  id: string;
  guardianUserId: string;
  profileId: string | null;
  consentVersion: string;
  noticeSha256: string;
  guardianDeclaredAdult: true;
  guardianBirthYear: number;
  consentAt: Date;
  createdAt: Date;
  erasedAt: Date | null;
};

export type JuniorChildEraseResult = {
  profileId: string;
  progressRemoved: number;
  quizAttemptsRemoved: number;
  xpRemoved: boolean;
  consentsUnlinked: number;
};

export type JuniorActiveSubscriptionWrite = Omit<JuniorSubscriptionRow, "id" | "appliedMerchantOids"> & {
  appliedMerchantOids?: readonly string[];
};

export type JuniorProgressRow = {
  id: string;
  userId: string;
  profileId: string;
  lessonKey: string;
  mode: "speak" | "write" | "practice" | "quiz";
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  createdAt: Date;
};

export type JuniorXpRow = {
  profileId: string;
  userId: string;
  points: number;
  badges: string[];
};

export type JuniorOutcomeWrite = {
  progress: Omit<JuniorProgressRow, "id" | "createdAt">;
  points: number;
  badges: string[];
};

export type JuniorStore = {
  listProfiles(userId: string): Promise<JuniorProfileRow[]>;
  insertProfile(
    row: JuniorProfileInsert,
    consent?: JuniorGuardianConsentDraft | null,
  ): Promise<JuniorProfileRow>;
  getProfile(userId: string, profileId: string): Promise<JuniorProfileRow | null>;
  listGuardianConsents(guardianUserId: string): Promise<JuniorGuardianConsentRow[]>;
  bindGuardianConsent(
    userId: string,
    profileId: string,
    draft: JuniorGuardianConsentDraft,
  ): Promise<JuniorProfileRow | null>;
  eraseChildData(userId: string, profileId: string, now: Date): Promise<JuniorChildEraseResult | null>;
  selectProfile(userId: string, profileId: string): Promise<JuniorProfileRow | null>;
  setSelectedElectives(userId: string, profileId: string, slugs: string[]): Promise<JuniorProfileRow | null>;
  applyGradeSwitch(
    userId: string,
    profileId: string,
    grade: number,
  ): Promise<{ profile: JuniorProfileRow; subscription: JuniorSubscriptionRow } | "exhausted" | null>;
  getSubscription(userId: string): Promise<JuniorSubscriptionRow | null>;
  saveActiveSubscription(row: JuniorActiveSubscriptionWrite): Promise<JuniorSubscriptionRow>;
  listProgress(userId: string, profileId: string): Promise<JuniorProgressRow[]>;
  getXp(userId: string, profileId: string): Promise<JuniorXpRow | null>;
  recordOutcome(write: JuniorOutcomeWrite): Promise<{ progress: JuniorProgressRow; xp: JuniorXpRow }>;
};

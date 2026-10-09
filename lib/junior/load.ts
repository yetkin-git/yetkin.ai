import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import { juniorLessonStatus, juniorTellPassed } from "@/lib/junior/chain";
import { juniorPersonalizedShelves } from "@/lib/junior/catalog";
import { JUNIOR_CLOSED_PROFILE_NICKNAME } from "@/lib/junior/guardian-notice";
import { JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";
import { juniorInvoiceOpened, juniorInvoicePersisted } from "@/lib/junior/invoice-seal";
import { JUNIOR_POS_PROVIDER, type JuniorSubscriptionRow } from "@/lib/junior/plan";
import type {
  JuniorActiveSubscriptionWrite,
  JuniorChildEraseResult,
  JuniorGuardianConsentDraft,
  JuniorGuardianConsentRow,
  JuniorOutcomeWrite,
  JuniorProfileInsert,
  JuniorProfileRow,
  JuniorProgressRow,
  JuniorStore,
  JuniorXpRow,
} from "@/lib/junior/ports";
import { readJuniorHome, readJuniorLesson, type JuniorHome } from "@/lib/junior/service";

type ProfileRecord = {
  id: string;
  userId: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  consentAt: Date;
  activeConsentId: string | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
  createdAt: Date;
  activeConsent?: { consentVersion: string; erasedAt: Date | null } | null;
};

const profileArgs = {
  include: { activeConsent: true },
} as const;

type ProgressRecord = {
  id: string;
  userId: string;
  profileId: string;
  lessonKey: string;
  mode: string;
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  createdAt: Date;
};

type XpRecord = {
  userId: string;
  profileId: string;
  points: number;
  badgesJson: string;
};

function mapProfile(row: ProfileRecord): JuniorProfileRow {
  const version =
    row.activeConsent && row.activeConsent.erasedAt == null ? row.activeConsent.consentVersion : null;
  return {
    id: row.id,
    userId: row.userId,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    consentAt: row.consentAt,
    activeConsentId: row.activeConsent && version ? row.activeConsentId : null,
    activeConsentVersion: version,
    selected: row.selected,
    selectedElectives: [...row.selectedElectives],
    gradeSwitchRights: row.gradeSwitchRights,
    createdAt: row.createdAt,
  };
}

function mapConsent(row: {
  id: string;
  guardianUserId: string;
  profileId: string | null;
  consentVersion: string;
  noticeSha256: string;
  guardianBirthYear: number;
  consentAt: Date;
  createdAt: Date;
  erasedAt: Date | null;
}): JuniorGuardianConsentRow {
  return {
    id: row.id,
    guardianUserId: row.guardianUserId,
    profileId: row.profileId,
    consentVersion: row.consentVersion,
    noticeSha256: row.noticeSha256,
    guardianDeclaredAdult: true,
    guardianBirthYear: row.guardianBirthYear,
    consentAt: row.consentAt,
    createdAt: row.createdAt,
    erasedAt: row.erasedAt,
  };
}

function mapSubscription(row: {
  id: string;
  userId: string;
  status: "PENDING" | "ACTIVE";
  planCode: string;
  listPriceMinor: number;
  currencyCode: string;
  provider: string;
  providerRef: string;
  cardLast4: string;
  invoiceName: string;
  invoiceTckn: string;
  invoicePhone: string;
  invoiceAddress: string;
  appliedMerchantOids?: string[];
  electiveQuota: number;
  gradeSwitchRights: number;
  activatedAt: Date | null;
  expiresAt: Date | null;
}): JuniorSubscriptionRow {
  if (row.provider !== JUNIOR_POS_PROVIDER || row.currencyCode !== "TRY") {
    throw new Error("Junior paket kaydı tanınmadı.");
  }
  const invoice = juniorInvoiceOpened(row);
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    planCode: row.planCode,
    listPriceMinor: row.listPriceMinor,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: row.providerRef,
    cardLast4: row.cardLast4,
    invoiceName: row.invoiceName,
    invoiceTckn: invoice.invoiceTckn,
    invoicePhone: invoice.invoicePhone,
    invoiceAddress: invoice.invoiceAddress,
    appliedMerchantOids: row.appliedMerchantOids ?? [],
    electiveQuota: row.electiveQuota,
    gradeSwitchRights: row.gradeSwitchRights,
    activatedAt: row.activatedAt,
    expiresAt: row.expiresAt,
  };
}

function mapMode(mode: string): JuniorProgressRow["mode"] {
  if (mode === "speak" || mode === "write" || mode === "practice" || mode === "quiz") {
    return mode;
  }
  throw new Error("Junior ilerleme biçimi tanınmadı.");
}

function mapProgress(row: ProgressRecord): JuniorProgressRow {
  return {
    id: row.id,
    userId: row.userId,
    profileId: row.profileId,
    lessonKey: row.lessonKey,
    mode: mapMode(row.mode),
    praised: row.praised,
    missing: row.missing,
    advice: row.advice,
    score: row.score,
    xpAwarded: row.xpAwarded,
    createdAt: row.createdAt,
  };
}

function mapBadges(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function mapXp(row: XpRecord): JuniorXpRow {
  return {
    userId: row.userId,
    profileId: row.profileId,
    points: row.points,
    badges: mapBadges(row.badgesJson),
  };
}

export function createPrismaJuniorStore(): JuniorStore {
  const prisma = getPrisma();
  return {
    async listProfiles(userId) {
      const rows = await prisma.juniorProfile.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        ...profileArgs,
      });
      return rows.map(mapProfile);
    },
    async insertProfile(row: JuniorProfileInsert, consent?: JuniorGuardianConsentDraft | null) {
      const created = await prisma.$transaction(async (tx) => {
        const profile = await tx.juniorProfile.create({
          data: {
            userId: row.userId,
            nickname: row.nickname,
            grade: row.grade,
            birthYear: row.birthYear,
            consentAt: row.consentAt,
            selected: row.selected,
            selectedElectives: row.selectedElectives,
            gradeSwitchRights: row.gradeSwitchRights,
          },
        });
        if (!consent) {
          return tx.juniorProfile.findFirstOrThrow({ where: { id: profile.id }, ...profileArgs });
        }
        const proof = await tx.juniorGuardianConsent.create({
          data: {
            guardianUserId: row.userId,
            profileId: profile.id,
            consentVersion: consent.consentVersion,
            noticeSha256: consent.noticeSha256,
            guardianDeclaredAdult: true,
            guardianBirthYear: consent.guardianBirthYear,
            consentAt: consent.consentAt,
          },
        });
        return tx.juniorProfile.update({
          where: { id: profile.id },
          data: { activeConsentId: proof.id, consentAt: consent.consentAt },
          ...profileArgs,
        });
      });
      return mapProfile(created);
    },
    async getProfile(userId, profileId) {
      const row = await prisma.juniorProfile.findFirst({ where: { id: profileId, userId }, ...profileArgs });
      return row ? mapProfile(row) : null;
    },
    async listGuardianConsents(guardianUserId) {
      const rows = await prisma.juniorGuardianConsent.findMany({
        where: { guardianUserId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(mapConsent);
    },
    async bindGuardianConsent(userId, profileId, draft) {
      const linked = await prisma.$transaction(async (tx) => {
        const found = await tx.juniorProfile.findFirst({ where: { id: profileId, userId } });
        if (!found || found.birthYear == null) {
          return null;
        }
        const proof = await tx.juniorGuardianConsent.create({
          data: {
            guardianUserId: userId,
            profileId: found.id,
            consentVersion: draft.consentVersion,
            noticeSha256: draft.noticeSha256,
            guardianDeclaredAdult: true,
            guardianBirthYear: draft.guardianBirthYear,
            consentAt: draft.consentAt,
          },
        });
        return tx.juniorProfile.update({
          where: { id: found.id },
          data: { activeConsentId: proof.id, consentAt: draft.consentAt },
          ...profileArgs,
        });
      });
      return linked ? mapProfile(linked) : null;
    },
    async eraseChildData(userId, profileId, now): Promise<JuniorChildEraseResult | null> {
      return prisma.$transaction(async (tx) => {
        const found = await tx.juniorProfile.findFirst({ where: { id: profileId, userId } });
        if (!found) {
          return null;
        }
        const quizAttemptsRemoved = await tx.juniorProgress.count({
          where: { userId, profileId, mode: "quiz" },
        });
        const progress = await tx.juniorProgress.deleteMany({ where: { userId, profileId } });
        const xp = await tx.juniorXp.deleteMany({ where: { userId, profileId } });
        const consents = await tx.juniorGuardianConsent.updateMany({
          where: { guardianUserId: userId, profileId, erasedAt: null },
          data: { profileId: null, erasedAt: now },
        });
        await tx.juniorProfile.update({
          where: { id: found.id },
          data: {
            nickname: JUNIOR_CLOSED_PROFILE_NICKNAME,
            birthYear: null,
            activeConsentId: null,
            selected: false,
            selectedElectives: [],
          },
        });
        return {
          profileId,
          progressRemoved: progress.count,
          quizAttemptsRemoved,
          xpRemoved: xp.count > 0,
          consentsUnlinked: consents.count,
        };
      });
    },
    async selectProfile(userId, profileId) {
      const row = await prisma.$transaction(async (tx) => {
        const found = await tx.juniorProfile.findFirst({ where: { id: profileId, userId } });
        if (!found || found.birthYear == null) {
          return null;
        }
        await tx.juniorProfile.updateMany({ where: { userId }, data: { selected: false } });
        return tx.juniorProfile.update({
          where: { id: found.id },
          data: { selected: true },
          ...profileArgs,
        });
      });
      return row ? mapProfile(row) : null;
    },
    async setSelectedElectives(userId, profileId, slugs) {
      const found = await prisma.juniorProfile.findFirst({ where: { id: profileId, userId } });
      if (!found || found.birthYear == null) {
        return null;
      }
      const updated = await prisma.juniorProfile.update({
        where: { id: found.id },
        data: { selectedElectives: [...slugs] },
        ...profileArgs,
      });
      return mapProfile(updated);
    },
    async applyGradeSwitch(userId, profileId, grade) {
      const saved = await prisma.$transaction(async (tx) => {
        const profile = await tx.juniorProfile.findFirst({ where: { id: profileId, userId } });
        const subscription = await tx.juniorSubscription.findUnique({ where: { userId } });
        if (!profile || profile.birthYear == null || !subscription) {
          return null;
        }
        if (profile.gradeSwitchRights < 1 || subscription.gradeSwitchRights < 1) {
          return "exhausted" as const;
        }
        const nextProfile = await tx.juniorProfile.update({
          where: { id: profile.id },
          data: { grade, gradeSwitchRights: 0 },
          ...profileArgs,
        });
        const nextSubscription = await tx.juniorSubscription.update({
          where: { id: subscription.id },
          data: { gradeSwitchRights: 0 },
        });
        return { profile: nextProfile, subscription: nextSubscription };
      });
      if (!saved || saved === "exhausted") {
        return saved;
      }
      return { profile: mapProfile(saved.profile), subscription: mapSubscription(saved.subscription) };
    },
    async getSubscription(userId) {
      const row = await prisma.juniorSubscription.findUnique({ where: { userId } });
      return row ? mapSubscription(row) : null;
    },
    async saveActiveSubscription(row: JuniorActiveSubscriptionWrite) {
      const existing = await prisma.juniorSubscription.findUnique({ where: { userId: row.userId } });
      const known = existing?.appliedMerchantOids ?? [];
      if (existing && existing.status === "ACTIVE" && known.includes(row.providerRef)) {
        return mapSubscription(existing);
      }
      const appliedMerchantOids = known.includes(row.providerRef) ? known : [...known, row.providerRef];
      const invoice = juniorInvoicePersisted(row);
      const data = {
        status: row.status,
        planCode: row.planCode,
        listPriceMinor: row.listPriceMinor,
        currencyCode: row.currencyCode,
        provider: row.provider,
        providerRef: row.providerRef,
        cardLast4: row.cardLast4,
        invoiceName: row.invoiceName,
        invoiceTckn: invoice.invoiceTckn,
        invoicePhone: invoice.invoicePhone,
        invoiceAddress: invoice.invoiceAddress,
        appliedMerchantOids: [...appliedMerchantOids],
        electiveQuota: row.electiveQuota,
        gradeSwitchRights: row.gradeSwitchRights,
        activatedAt: row.activatedAt,
        expiresAt: row.expiresAt,
      };
      const saved = await prisma.juniorSubscription.upsert({
        where: { userId: row.userId },
        create: { userId: row.userId, ...data },
        update: data,
      });
      return mapSubscription(saved);
    },
    async listProgress(userId, profileId) {
      const rows = await prisma.juniorProgress.findMany({
        where: { userId, profileId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(mapProgress);
    },
    async getXp(userId, profileId) {
      const row = await prisma.juniorXp.findFirst({ where: { userId, profileId } });
      return row ? mapXp(row) : null;
    },
    async recordOutcome(write: JuniorOutcomeWrite) {
      const saved = await prisma.$transaction(async (tx) => {
        const progress = await tx.juniorProgress.create({
          data: {
            userId: write.progress.userId,
            profileId: write.progress.profileId,
            lessonKey: write.progress.lessonKey,
            mode: write.progress.mode,
            praised: write.progress.praised,
            missing: write.progress.missing,
            advice: write.progress.advice,
            score: write.progress.score,
            xpAwarded: write.progress.xpAwarded,
          },
        });
        const xp = await tx.juniorXp.upsert({
          where: { profileId: write.progress.profileId },
          create: {
            userId: write.progress.userId,
            profileId: write.progress.profileId,
            points: write.points,
            badgesJson: JSON.stringify(write.badges),
          },
          update: {
            points: write.points,
            badgesJson: JSON.stringify(write.badges),
          },
        });
        return { progress, xp };
      });
      return { progress: mapProgress(saved.progress), xp: mapXp(saved.xp) };
    },
  };
}

export type JuniorHomePayload = JuniorHome & { ready: boolean; notice: string | null };

function fallbackCourses() {
  try {
    return juniorPersonalizedShelves(null);
  } catch {
    return [];
  }
}

function emptyHome(notice: string): JuniorHomePayload {
  return {
    ready: false,
    notice,
    profiles: [],
    selected: null,
    xp: { points: 0, badges: [] },
    courses: fallbackCourses(),
    weeklyReport: null,
    plan: { status: "NONE", electiveQuota: JUNIOR_ELECTIVE_QUOTA, expiresAt: null, gradeSwitchRights: 0 },
  };
}

function reportJuniorHomeFailure(error: unknown): void {
  try {
    logEvent({
      level: "error",
      event: "junior.home_unavailable",
      errorName: error instanceof Error ? error.name : "unknown",
    });
  } catch {
    // Günlük yazılamazsa oda yine varsayılan nesneyle açılır.
  }
}

export async function loadJuniorHome(userId: string): Promise<JuniorHomePayload> {
  try {
    const home = await readJuniorHome(createPrismaJuniorStore(), userId);
    if (!home || !Array.isArray(home.profiles)) {
      return emptyHome("Profil kaydı şu an yazılamıyor. Ders listesi duruyor.");
    }
    return {
      ready: true,
      notice: null,
      profiles: home.profiles,
      selected: home.selected ?? null,
      xp: home.xp ?? { points: 0, badges: [] },
      courses: home.courses?.length ? home.courses : fallbackCourses(),
      weeklyReport: home.weeklyReport ?? null,
      plan: home.plan ?? {
        status: "NONE",
        electiveQuota: JUNIOR_ELECTIVE_QUOTA,
        expiresAt: null,
        gradeSwitchRights: 0,
      },
    };
  } catch (error) {
    reportJuniorHomeFailure(error);
    return emptyHome("Profil kaydı şu an yazılamıyor. Ders listesi duruyor.");
  }
}

export async function loadJuniorLessonPage(userId: string, lessonKey: string) {
  const lockedPreview = readJuniorLesson(lessonKey);
  try {
    const store = createPrismaJuniorStore();
    const home = await readJuniorHome(store, userId);
    const profileId = home.selected?.id ?? null;
    const lesson = readJuniorLesson(lessonKey, {
      active: home.plan.status === "ACTIVE",
      selectedElectives: home.selected?.selectedElectives ?? [],
    });
    const progress = profileId ? await store.listProgress(userId, profileId) : [];
    return {
      ready: true,
      lesson,
      profileId,
      nickname: home.selected?.nickname ?? null,
      selectedElectives: home.selected?.selectedElectives ?? [],
      tellPassed: profileId ? juniorTellPassed(progress, lessonKey) : false,
      lessonDone: profileId ? juniorLessonStatus(progress, lessonKey) === "done" : false,
      planActive: home.plan.status === "ACTIVE",
    };
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.lesson_unavailable",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return {
      ready: false,
      lesson: lockedPreview,
      profileId: null,
      nickname: null,
      selectedElectives: [] as string[],
      tellPassed: false,
      lessonDone: false,
      planActive: false,
    };
  }
}

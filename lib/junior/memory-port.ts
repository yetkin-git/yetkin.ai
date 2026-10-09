import { JUNIOR_CLOSED_PROFILE_NICKNAME } from "@/lib/junior/guardian-notice";
import type { JuniorSubscriptionRow } from "@/lib/junior/plan";
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

export const JUNIOR_PROGRESS_MODES = ["speak", "write", "practice", "quiz"] as const;

export type JuniorProgressMode = (typeof JUNIOR_PROGRESS_MODES)[number];

/**
 * `junior_progress_shape` CHECK kuralının bellek kopyası.
 * quiz modu, skor, XP ve ders anahtarı Postgres ile aynı aralıktadır.
 */
export function assertJuniorProgressShape(row: {
  mode: string;
  score: number;
  xpAwarded: number;
  lessonKey: string;
}): void {
  if (!(JUNIOR_PROGRESS_MODES as readonly string[]).includes(row.mode)) {
    throw new Error("junior_progress_shape");
  }
  if (!Number.isInteger(row.score) || row.score < 0 || row.score > 100) {
    throw new Error("junior_progress_shape");
  }
  if (!Number.isInteger(row.xpAwarded) || row.xpAwarded < 0 || row.xpAwarded > 100) {
    throw new Error("junior_progress_shape");
  }
  if (row.lessonKey.length < 1 || row.lessonKey.length > 80) {
    throw new Error("junior_progress_shape");
  }
}

export function createMemoryJuniorStore(): JuniorStore {
  const profiles: JuniorProfileRow[] = [];
  const progress: JuniorProgressRow[] = [];
  const xp: JuniorXpRow[] = [];
  const subscriptions: JuniorSubscriptionRow[] = [];
  const consents: JuniorGuardianConsentRow[] = [];
  let sequence = 0;

  function nextId(prefix: string): string {
    sequence += 1;
    return `${prefix}_${sequence}`;
  }

  function rememberConsent(
    guardianUserId: string,
    profileId: string,
    draft: JuniorGuardianConsentDraft,
  ): JuniorGuardianConsentRow {
    const proof: JuniorGuardianConsentRow = {
      id: nextId("jc"),
      guardianUserId,
      profileId,
      consentVersion: draft.consentVersion,
      noticeSha256: draft.noticeSha256,
      guardianDeclaredAdult: true,
      guardianBirthYear: draft.guardianBirthYear,
      consentAt: draft.consentAt,
      createdAt: draft.consentAt,
      erasedAt: null,
    };
    consents.push(proof);
    return proof;
  }

  return {
    async listProfiles(userId) {
      return profiles
        .filter((row) => row.userId === userId)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    },
    async insertProfile(row: JuniorProfileInsert, consent?: JuniorGuardianConsentDraft | null) {
      const created: JuniorProfileRow = {
        ...row,
        selectedElectives: [...row.selectedElectives],
        gradeSwitchRights: row.gradeSwitchRights,
        activeConsentId: null,
        activeConsentVersion: null,
        id: nextId("jp"),
        createdAt: new Date(),
      };
      if (consent) {
        const proof = rememberConsent(created.userId, created.id, consent);
        created.activeConsentId = proof.id;
        created.activeConsentVersion = proof.consentVersion;
        created.consentAt = consent.consentAt;
      }
      profiles.push(created);
      return created;
    },
    async getProfile(userId, profileId) {
      return profiles.find((row) => row.userId === userId && row.id === profileId) ?? null;
    },
    async listGuardianConsents(guardianUserId) {
      return consents
        .filter((row) => row.guardianUserId === guardianUserId)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    },
    async bindGuardianConsent(userId, profileId, draft) {
      const target = profiles.find((row) => row.userId === userId && row.id === profileId);
      if (!target || target.birthYear == null) {
        return null;
      }
      const proof = rememberConsent(userId, profileId, draft);
      target.activeConsentId = proof.id;
      target.activeConsentVersion = proof.consentVersion;
      target.consentAt = draft.consentAt;
      return target;
    },
    async eraseChildData(userId, profileId, now) {
      const target = profiles.find((row) => row.userId === userId && row.id === profileId);
      if (!target) {
        return null;
      }
      const owned = progress.filter((row) => row.userId === userId && row.profileId === profileId);
      const quizAttemptsRemoved = owned.filter((row) => row.mode === "quiz").length;
      const progressRemoved = owned.length;
      for (let index = progress.length - 1; index >= 0; index -= 1) {
        const row = progress[index];
        if (row && row.userId === userId && row.profileId === profileId) {
          progress.splice(index, 1);
        }
      }
      const xpIndex = xp.findIndex((row) => row.userId === userId && row.profileId === profileId);
      const xpRemoved = xpIndex >= 0;
      if (xpIndex >= 0) {
        xp.splice(xpIndex, 1);
      }
      let consentsUnlinked = 0;
      for (const row of consents) {
        if (row.guardianUserId === userId && row.profileId === profileId && row.erasedAt == null) {
          row.profileId = null;
          row.erasedAt = now;
          consentsUnlinked += 1;
        }
      }
      target.nickname = JUNIOR_CLOSED_PROFILE_NICKNAME;
      target.birthYear = null;
      target.activeConsentId = null;
      target.activeConsentVersion = null;
      target.selected = false;
      target.selectedElectives = [];
      const result: JuniorChildEraseResult = {
        profileId,
        progressRemoved,
        quizAttemptsRemoved,
        xpRemoved,
        consentsUnlinked,
      };
      return result;
    },
    async selectProfile(userId, profileId) {
      const target = profiles.find((row) => row.userId === userId && row.id === profileId);
      if (!target || target.birthYear == null) {
        return null;
      }
      for (const row of profiles) {
        if (row.userId === userId) {
          row.selected = row.id === profileId;
        }
      }
      return target;
    },
    async setSelectedElectives(userId, profileId, slugs) {
      const target = profiles.find((row) => row.userId === userId && row.id === profileId);
      if (!target || target.birthYear == null) {
        return null;
      }
      target.selectedElectives = [...slugs];
      return target;
    },
    async applyGradeSwitch(userId, profileId, grade) {
      const profile = profiles.find((row) => row.userId === userId && row.id === profileId);
      const subscription = subscriptions.find((row) => row.userId === userId);
      if (!profile || profile.birthYear == null || !subscription) {
        return null;
      }
      if (profile.gradeSwitchRights < 1 || subscription.gradeSwitchRights < 1) {
        return "exhausted";
      }
      profile.grade = grade;
      profile.gradeSwitchRights = 0;
      subscription.gradeSwitchRights = 0;
      return { profile, subscription };
    },
    async getSubscription(userId) {
      return subscriptions.find((row) => row.userId === userId) ?? null;
    },
    async saveActiveSubscription(row: JuniorActiveSubscriptionWrite) {
      const existing = subscriptions.find((item) => item.userId === row.userId);
      const known = existing?.appliedMerchantOids ?? [];
      if (existing && existing.status === "ACTIVE" && known.includes(row.providerRef)) {
        return existing;
      }
      const appliedMerchantOids = known.includes(row.providerRef) ? known : [...known, row.providerRef];
      if (existing) {
        Object.assign(existing, row, { appliedMerchantOids });
        return existing;
      }
      const created: JuniorSubscriptionRow = { ...row, id: nextId("js"), appliedMerchantOids };
      subscriptions.push(created);
      return created;
    },
    async listProgress(userId, profileId) {
      return progress
        .filter((row) => row.userId === userId && row.profileId === profileId)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
    },
    async getXp(userId, profileId) {
      return xp.find((row) => row.userId === userId && row.profileId === profileId) ?? null;
    },
    async recordOutcome(write: JuniorOutcomeWrite) {
      assertJuniorProgressShape(write.progress);
      const created: JuniorProgressRow = {
        ...write.progress,
        id: nextId("jg"),
        createdAt: new Date(),
      };
      progress.push(created);
      const existing = xp.find(
        (row) => row.userId === write.progress.userId && row.profileId === write.progress.profileId,
      );
      if (existing) {
        existing.points = write.points;
        existing.badges = [...write.badges];
        return { progress: created, xp: existing };
      }
      const createdXp: JuniorXpRow = {
        userId: write.progress.userId,
        profileId: write.progress.profileId,
        points: write.points,
        badges: [...write.badges],
      };
      xp.push(createdXp);
      return { progress: created, xp: createdXp };
    },
  };
}

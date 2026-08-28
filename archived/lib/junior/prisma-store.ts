import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isActiveGuardianship } from "@/lib/junior/project";
import type {
  GuardianInviteRecord,
  JuniorAllowanceRecord,
  JuniorProfileRecord,
  JuniorPulse,
  JuniorStore,
} from "@/lib/junior/types";

function toProfile(row: {
  id: string;
  userId: string;
  dateOfBirth: string;
  guardianUserId: string | null;
  jurisdiction: string;
  status: JuniorProfileRecord["status"];
  guardianConsentAt: Date | null;
  mebTrackKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}): JuniorProfileRecord {
  return {
    ...row,
    jurisdiction: "TR",
  };
}

function toInvite(row: GuardianInviteRecord): GuardianInviteRecord {
  return { ...row };
}

function toAllowance(row: {
  id: string;
  juniorProfileId: string;
  userId: string;
  guardianUserId: string;
  currencyCode: string;
  amountMinor: number;
  weeklyCapMinor: number;
  grantedThisPeriodMinor: number;
  periodStartedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): JuniorAllowanceRecord {
  return {
    ...row,
    currencyCode: parseCurrencyCode(row.currencyCode),
    amountMinor: toAmountMinor(row.amountMinor),
    weeklyCapMinor: toAmountMinor(row.weeklyCapMinor),
    grantedThisPeriodMinor: toAmountMinor(row.grantedThisPeriodMinor),
  };
}

export type JuniorWriteDb = Pick<PrismaClient, "juniorProfile" | "juniorAllowance" | "guardianInviteToken">;

export function bindJuniorStore(db: JuniorWriteDb): JuniorStore {
  return {
    async insertProfile(profile) {
      const row = await db.juniorProfile.create({
        data: {
          id: profile.id,
          userId: profile.userId,
          dateOfBirth: profile.dateOfBirth,
          guardianUserId: profile.guardianUserId,
          jurisdiction: profile.jurisdiction,
          status: profile.status,
          guardianConsentAt: profile.guardianConsentAt,
          mebTrackKey: profile.mebTrackKey,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      });
      return toProfile(row);
    },
    async getProfileByUserId(userId) {
      const row = await db.juniorProfile.findUnique({ where: { userId } });
      return row ? toProfile(row) : null;
    },
    async getProfile(id) {
      const row = await db.juniorProfile.findUnique({ where: { id } });
      return row ? toProfile(row) : null;
    },
    async listWardsForGuardian(guardianUserId) {
      const rows = await db.juniorProfile.findMany({
        where: { guardianUserId, status: "GUARDIAN_LINKED" },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toProfile);
    },
    async updateProfile(id, patch) {
      const row = await db.juniorProfile.update({ where: { id }, data: patch });
      return toProfile(row);
    },
    async insertInvite(invite) {
      const row = await db.guardianInviteToken.create({
        data: {
          id: invite.id,
          userId: invite.userId,
          tokenHash: invite.tokenHash,
          tokenPrefix: invite.tokenPrefix,
          initiatorRole: invite.initiatorRole,
          juniorProfileId: invite.juniorProfileId,
          counterpartUserId: invite.counterpartUserId,
          status: invite.status,
          childApprovedAt: invite.childApprovedAt,
          guardianApprovedAt: invite.guardianApprovedAt,
          expiresAt: invite.expiresAt,
          consumedAt: invite.consumedAt,
          createdAt: invite.createdAt,
          updatedAt: invite.updatedAt,
        },
      });
      return toInvite(row);
    },
    async getInviteByTokenHash(tokenHash) {
      const row = await db.guardianInviteToken.findUnique({ where: { tokenHash } });
      return row ? toInvite(row) : null;
    },
    async listPendingInvitesForUser(userId, now = new Date()) {
      const rows = await db.guardianInviteToken.findMany({
        where: { userId, status: "PENDING", expiresAt: { gt: now } },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toInvite);
    },
    async updateInvite(id, patch) {
      const row = await db.guardianInviteToken.update({ where: { id }, data: patch });
      return toInvite(row);
    },
    async consumePendingInvite(id, now, patch) {
      const result = await db.guardianInviteToken.updateMany({
        where: { id, status: "PENDING", expiresAt: { gt: now } },
        data: {
          status: "CONSUMED",
          juniorProfileId: patch.juniorProfileId,
          counterpartUserId: patch.counterpartUserId,
          childApprovedAt: patch.childApprovedAt,
          guardianApprovedAt: patch.guardianApprovedAt,
          consumedAt: patch.consumedAt,
          updatedAt: patch.updatedAt,
        },
      });
      if (result.count !== 1) {
        return null;
      }
      const row = await db.guardianInviteToken.findUnique({ where: { id } });
      return row ? toInvite(row) : null;
    },
    async insertAllowance(allowance) {
      const row = await db.juniorAllowance.create({
        data: {
          id: allowance.id,
          juniorProfileId: allowance.juniorProfileId,
          userId: allowance.userId,
          guardianUserId: allowance.guardianUserId,
          currencyCode: allowance.currencyCode,
          amountMinor: allowance.amountMinor,
          weeklyCapMinor: allowance.weeklyCapMinor,
          grantedThisPeriodMinor: allowance.grantedThisPeriodMinor,
          periodStartedAt: allowance.periodStartedAt,
          createdAt: allowance.createdAt,
          updatedAt: allowance.updatedAt,
        },
      });
      return toAllowance(row);
    },
    async getAllowanceByProfileId(juniorProfileId) {
      const row = await db.juniorAllowance.findUnique({ where: { juniorProfileId } });
      return row ? toAllowance(row) : null;
    },
    async updateAllowance(id, patch) {
      const row = await db.juniorAllowance.update({ where: { id }, data: patch });
      return toAllowance(row);
    },
    async pulseForUser(userId) {
      const empty: JuniorPulse = {
        status: null,
        bondStatus: null,
        hasGuardianConsent: false,
        remainingMinor: toAmountMinor(0),
        weeklyCapMinor: toAmountMinor(0),
        mebTrackKey: null,
        currencyCode: SETTLEMENT_CURRENCY,
        wardsPending: 0,
        wardsLinked: 0,
        pendingInvites: 0,
      };
      const now = new Date();
      const [profile, pendingInvites, linked] = await Promise.all([
        db.juniorProfile.findUnique({ where: { userId } }),
        db.guardianInviteToken.count({
          where: { userId, status: "PENDING", expiresAt: { gt: now } },
        }),
        db.juniorProfile.count({ where: { guardianUserId: userId, status: "GUARDIAN_LINKED" } }),
      ]);
      if (!profile) {
        return {
          ...empty,
          wardsPending: pendingInvites,
          wardsLinked: linked,
          pendingInvites,
        };
      }
      const mapped = toProfile(profile);
      const active = isActiveGuardianship(mapped);
      const allowance = active
        ? await db.juniorAllowance.findUnique({ where: { juniorProfileId: profile.id } })
        : null;
      return {
        status: profile.status,
        bondStatus: active ? "ACTIVE" : "PENDING",
        hasGuardianConsent: active,
        remainingMinor: toAmountMinor(allowance?.amountMinor ?? 0),
        weeklyCapMinor: toAmountMinor(allowance?.weeklyCapMinor ?? 0),
        mebTrackKey: active ? profile.mebTrackKey : null,
        currencyCode: allowance ? parseCurrencyCode(allowance.currencyCode) : SETTLEMENT_CURRENCY,
        wardsPending: pendingInvites,
        wardsLinked: linked,
        pendingInvites,
      };
    },
  };
}

export function createPrismaJuniorStore(): JuniorStore {
  return bindJuniorStore(getPrisma());
}

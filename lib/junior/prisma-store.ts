import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  JuniorAllowanceRecord,
  JuniorProfileRecord,
  JuniorPulse,
  JuniorStore,
} from "@/lib/junior/types";

function toProfile(row: {
  id: string;
  userId: string;
  dateOfBirth: string;
  guardianUserId: string;
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

export function createPrismaJuniorStore(): JuniorStore {
  const prisma = getPrisma();
  return {
    async insertProfile(profile) {
      const row = await prisma.juniorProfile.create({
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
      const row = await prisma.juniorProfile.findUnique({ where: { userId } });
      return row ? toProfile(row) : null;
    },
    async getProfile(id) {
      const row = await prisma.juniorProfile.findUnique({ where: { id } });
      return row ? toProfile(row) : null;
    },
    async listWardsForGuardian(guardianUserId) {
      const rows = await prisma.juniorProfile.findMany({
        where: { guardianUserId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toProfile);
    },
    async updateProfile(id, patch) {
      const row = await prisma.juniorProfile.update({ where: { id }, data: patch });
      return toProfile(row);
    },
    async insertAllowance(allowance) {
      const row = await prisma.juniorAllowance.create({
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
      const row = await prisma.juniorAllowance.findUnique({ where: { juniorProfileId } });
      return row ? toAllowance(row) : null;
    },
    async updateAllowance(id, patch) {
      const row = await prisma.juniorAllowance.update({ where: { id }, data: patch });
      return toAllowance(row);
    },
    async pulseForUser(userId) {
      const empty: JuniorPulse = {
        status: null,
        hasGuardianConsent: false,
        remainingMinor: toAmountMinor(0),
        weeklyCapMinor: toAmountMinor(0),
        mebTrackKey: null,
        currencyCode: SETTLEMENT_CURRENCY,
        wardsPending: 0,
        wardsLinked: 0,
      };
      const [profile, pending, linked] = await Promise.all([
        prisma.juniorProfile.findUnique({ where: { userId } }),
        prisma.juniorProfile.count({ where: { guardianUserId: userId, status: "PENDING_GUARDIAN" } }),
        prisma.juniorProfile.count({ where: { guardianUserId: userId, status: "GUARDIAN_LINKED" } }),
      ]);
      if (!profile) {
        return { ...empty, wardsPending: pending, wardsLinked: linked };
      }
      const allowance = await prisma.juniorAllowance.findUnique({
        where: { juniorProfileId: profile.id },
      });
      return {
        status: profile.status,
        hasGuardianConsent: Boolean(profile.guardianConsentAt),
        remainingMinor: toAmountMinor(allowance?.amountMinor ?? 0),
        weeklyCapMinor: toAmountMinor(allowance?.weeklyCapMinor ?? 0),
        mebTrackKey: profile.mebTrackKey,
        currencyCode: allowance ? parseCurrencyCode(allowance.currencyCode) : SETTLEMENT_CURRENCY,
        wardsPending: pending,
        wardsLinked: linked,
      };
    },
  };
}

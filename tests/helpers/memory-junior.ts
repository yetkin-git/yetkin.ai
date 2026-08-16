import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  JuniorAllowanceRecord,
  JuniorProfileRecord,
  JuniorPulse,
  JuniorStore,
} from "@/lib/junior/types";

export function createMemoryJuniorStore(): JuniorStore {
  const profiles = new Map<string, JuniorProfileRecord>();
  const allowances = new Map<string, JuniorAllowanceRecord>();

  return {
    async insertProfile(profile) {
      profiles.set(profile.id, { ...profile });
      return { ...profile };
    },
    async getProfileByUserId(userId) {
      const found = [...profiles.values()].find((row) => row.userId === userId);
      return found ? { ...found } : null;
    },
    async getProfile(id) {
      const row = profiles.get(id);
      return row ? { ...row } : null;
    },
    async listWardsForGuardian(guardianUserId) {
      return [...profiles.values()]
        .filter((row) => row.guardianUserId === guardianUserId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateProfile(id, patch) {
      const row = profiles.get(id);
      if (!row) {
        throw new Error("Profil yok.");
      }
      const next = { ...row, ...patch };
      profiles.set(id, next);
      return { ...next };
    },
    async insertAllowance(allowance) {
      allowances.set(allowance.id, { ...allowance });
      return { ...allowance };
    },
    async getAllowanceByProfileId(juniorProfileId) {
      const found = [...allowances.values()].find((row) => row.juniorProfileId === juniorProfileId);
      return found ? { ...found } : null;
    },
    async updateAllowance(id, patch) {
      const row = allowances.get(id);
      if (!row) {
        throw new Error("Harçlık yok.");
      }
      const next = { ...row, ...patch };
      allowances.set(id, next);
      return { ...next };
    },
    async pulseForUser(userId) {
      const profile = [...profiles.values()].find((row) => row.userId === userId);
      const wards = [...profiles.values()].filter((row) => row.guardianUserId === userId);
      const empty: JuniorPulse = {
        status: null,
        hasGuardianConsent: false,
        remainingMinor: toAmountMinor(0),
        weeklyCapMinor: toAmountMinor(0),
        mebTrackKey: null,
        currencyCode: SETTLEMENT_CURRENCY,
        wardsPending: wards.filter((row) => row.status === "PENDING_GUARDIAN").length,
        wardsLinked: wards.filter((row) => row.status === "GUARDIAN_LINKED").length,
      };
      if (!profile) {
        return empty;
      }
      const allowance = [...allowances.values()].find((row) => row.juniorProfileId === profile.id);
      return {
        status: profile.status,
        hasGuardianConsent: Boolean(profile.guardianConsentAt),
        remainingMinor: toAmountMinor(allowance?.amountMinor ?? 0),
        weeklyCapMinor: toAmountMinor(allowance?.weeklyCapMinor ?? 0),
        mebTrackKey: profile.mebTrackKey,
        currencyCode: allowance?.currencyCode ?? SETTLEMENT_CURRENCY,
        wardsPending: empty.wardsPending,
        wardsLinked: empty.wardsLinked,
      };
    },
  };
}

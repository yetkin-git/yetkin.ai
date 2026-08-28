import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { JuniorAllowanceWritePorts, JuniorEnginePorts } from "@/lib/junior/engine";
import { isActiveGuardianship } from "@/lib/junior/project";
import type {
  GuardianInviteRecord,
  JuniorAllowanceRecord,
  JuniorProfileRecord,
  JuniorPulse,
  JuniorStore,
} from "@/lib/junior/types";
import { createSerializedUnitOfWork, type MemoryLedgerStore } from "./memory-money";

type JuniorMemoryState = {
  profiles: Array<[string, JuniorProfileRecord]>;
  allowances: Array<[string, JuniorAllowanceRecord]>;
  invites: Array<[string, GuardianInviteRecord]>;
};

export type MemoryJuniorStore = JuniorStore & {
  failNextAllowanceUpdate(): void;
  capture(): JuniorMemoryState;
  restore(state: JuniorMemoryState): void;
};

export function createMemoryJuniorStore(): MemoryJuniorStore {
  const profiles = new Map<string, JuniorProfileRecord>();
  const allowances = new Map<string, JuniorAllowanceRecord>();
  const invites = new Map<string, GuardianInviteRecord>();
  let failAllowance = false;

  return {
    failNextAllowanceUpdate() {
      failAllowance = true;
    },
    capture() {
      return {
        profiles: [...profiles.entries()].map(([key, value]) => [key, { ...value }]),
        allowances: [...allowances.entries()].map(([key, value]) => [key, { ...value }]),
        invites: [...invites.entries()].map(([key, value]) => [key, { ...value }]),
      };
    },
    restore(state) {
      profiles.clear();
      allowances.clear();
      invites.clear();
      for (const [key, value] of state.profiles) {
        profiles.set(key, { ...value });
      }
      for (const [key, value] of state.allowances) {
        allowances.set(key, { ...value });
      }
      for (const [key, value] of state.invites ?? []) {
        invites.set(key, { ...value });
      }
    },
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
        .filter(
          (row) => row.guardianUserId === guardianUserId && row.status === "GUARDIAN_LINKED",
        )
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
    async insertInvite(invite) {
      invites.set(invite.id, { ...invite });
      return { ...invite };
    },
    async getInviteByTokenHash(tokenHash) {
      const found = [...invites.values()].find((row) => row.tokenHash === tokenHash);
      return found ? { ...found } : null;
    },
    async listPendingInvitesForUser(userId, now = new Date()) {
      return [...invites.values()]
        .filter(
          (row) =>
            row.userId === userId &&
            row.status === "PENDING" &&
            row.expiresAt.getTime() > now.getTime(),
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateInvite(id, patch) {
      const row = invites.get(id);
      if (!row) {
        throw new Error("Davet yok.");
      }
      const next = { ...row, ...patch };
      invites.set(id, next);
      return { ...next };
    },
    async consumePendingInvite(id, now, patch) {
      const row = invites.get(id);
      if (!row || row.status !== "PENDING" || row.expiresAt.getTime() <= now.getTime()) {
        return null;
      }
      const next: GuardianInviteRecord = {
        ...row,
        ...patch,
        status: "CONSUMED",
      };
      invites.set(id, next);
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
      if (failAllowance) {
        failAllowance = false;
        throw new Error("Harçlık yazımı düştü.");
      }
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
      const linked = [...profiles.values()].filter(
        (row) => row.guardianUserId === userId && row.status === "GUARDIAN_LINKED",
      ).length;
      const pendingInvites = [...invites.values()].filter(
        (row) =>
          row.userId === userId &&
          row.status === "PENDING" &&
          row.expiresAt.getTime() > Date.now(),
      ).length;
      const empty: JuniorPulse = {
        status: null,
        bondStatus: null,
        hasGuardianConsent: false,
        remainingMinor: toAmountMinor(0),
        weeklyCapMinor: toAmountMinor(0),
        mebTrackKey: null,
        currencyCode: SETTLEMENT_CURRENCY,
        wardsPending: pendingInvites,
        wardsLinked: linked,
        pendingInvites,
      };
      if (!profile) {
        return empty;
      }
      const active = isActiveGuardianship(profile);
      const allowance = active
        ? [...allowances.values()].find((row) => row.juniorProfileId === profile.id)
        : undefined;
      return {
        status: profile.status,
        bondStatus: active ? "ACTIVE" : "PENDING",
        hasGuardianConsent: active,
        remainingMinor: toAmountMinor(allowance?.amountMinor ?? 0),
        weeklyCapMinor: toAmountMinor(allowance?.weeklyCapMinor ?? 0),
        mebTrackKey: active ? profile.mebTrackKey : null,
        currencyCode: allowance?.currencyCode ?? SETTLEMENT_CURRENCY,
        wardsPending: pendingInvites,
        wardsLinked: linked,
        pendingInvites,
      };
    },
  };
}

export function withMemoryJuniorAtomic<
  T extends { junior: MemoryJuniorStore; ledger: MemoryLedgerStore },
>(ports: T): T & Pick<JuniorEnginePorts, "runMoneyAtomic"> {
  const uow = createSerializedUnitOfWork();
  return {
    ...ports,
    async runMoneyAtomic<R>(work: (tx: JuniorAllowanceWritePorts) => Promise<R>): Promise<R> {
      return uow.run([ports.junior, ports.ledger], () =>
        work({ junior: ports.junior, ledger: ports.ledger }),
      );
    },
  };
}

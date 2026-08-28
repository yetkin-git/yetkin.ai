import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { addAmountMinor, toAmountMinor, toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  JUNIOR_PRODUCTION_LOCKED_ERROR,
  isJuniorProductionFrozen,
} from "@/lib/kernel/compliance/circuit-breakers";
import {
  assertEligibleJuniorMinor,
  assertGuardianIsNotChild,
} from "@/lib/junior/age-gate";
import {
  generateGuardianInvitePlaintext,
  guardianInvitePrefix,
  hashGuardianInviteToken,
  JUNIOR_GUARDIAN_INVITE_TTL_MS,
} from "@/lib/junior/invite-token";
import { mebTrackForAge } from "@/lib/junior/meb-catalog";
import { isActiveGuardianship } from "@/lib/junior/project";
import {
  JUNIOR_ALLOWANCE_PERIOD_MS,
  type GuardianInviteRecord,
  type JuniorAllowanceRecord,
  type JuniorProfileRecord,
  type JuniorPulse,
  type JuniorStore,
} from "@/lib/junior/types";

export const JUNIOR_INVITE_INVALID = "Davet geçersiz veya süresi dolmuş.";
export const JUNIOR_BOND_PENDING = "Ebeveyn onayı tamamlanmadan harçlık açılamaz.";

export function assertJuniorProductionOpen(): void {
  if (isJuniorProductionFrozen()) {
    throw new ForbiddenError(JUNIOR_PRODUCTION_LOCKED_ERROR);
  }
}

export type JuniorAllowanceWritePorts = {
  junior: JuniorStore;
  ledger: LedgerStore;
};

export type JuniorEnginePorts = {
  junior: JuniorStore;
  ledger?: LedgerStore;
  /**
   * Harçlık debit/credit + tavan güncellemesi tek atomik birim.
   * Prisma: `$transaction`. Bellek: kuyruk + anlık görüntü.
   * Vekâlet kabulü (profil + davet) aynı kapıdan geçer.
   */
  runMoneyAtomic?: <T>(work: (tx: JuniorAllowanceWritePorts) => Promise<T>) => Promise<T>;
};

async function withJuniorMoney<T>(
  ports: JuniorEnginePorts,
  work: (tx: JuniorAllowanceWritePorts) => Promise<T>,
): Promise<T> {
  if (!ports.ledger) {
    throw new Error("Harçlık defteri bağlı değil.");
  }
  if (ports.runMoneyAtomic) {
    return ports.runMoneyAtomic(work);
  }
  return work({ junior: ports.junior, ledger: ports.ledger });
}

async function withJuniorStore<T>(
  ports: JuniorEnginePorts,
  work: (store: JuniorStore) => Promise<T>,
): Promise<T> {
  if (ports.runMoneyAtomic && ports.ledger) {
    return ports.runMoneyAtomic((tx) => work(tx.junior));
  }
  return work(ports.junior);
}

export type UpsertJuniorProfileCommand = {
  userId: string;
  dateOfBirth: string;
  now?: Date;
};

export type CreateGuardianInviteCommand = {
  actorUserId: string;
  now?: Date;
};

export type AcceptGuardianInviteCommand = {
  actorUserId: string;
  token: string;
  now?: Date;
};

export type SetJuniorWeeklyCapCommand = {
  guardianUserId: string;
  childUserId: string;
  weeklyCapMinor: number;
  now?: Date;
};

export type GrantJuniorAllowanceCommand = {
  guardianUserId: string;
  childUserId: string;
  amountMinor: number;
  platformUserId?: string;
  now?: Date;
};

function rollAllowancePeriod(allowance: JuniorAllowanceRecord, now: Date): JuniorAllowanceRecord {
  if (now.getTime() < allowance.periodStartedAt.getTime() + JUNIOR_ALLOWANCE_PERIOD_MS) {
    return allowance;
  }
  return {
    ...allowance,
    grantedThisPeriodMinor: toAmountMinor(0),
    periodStartedAt: now,
    updatedAt: now,
  };
}

function requireActiveGuardianId(profile: JuniorProfileRecord): string {
  if (!isActiveGuardianship(profile) || !profile.guardianUserId) {
    throw new Error(JUNIOR_BOND_PENDING);
  }
  return profile.guardianUserId;
}

async function requireLinkedWard(
  store: JuniorStore,
  guardianUserId: string,
  childUserId: string,
): Promise<JuniorProfileRecord> {
  const profile = await store.getProfileByUserId(childUserId);
  if (!profile) {
    throw new Error("Junior profili bulunamadı.");
  }
  const boundGuardian = requireActiveGuardianId(profile);
  if (boundGuardian !== guardianUserId) {
    throw new Error("Bu çocuğun ebeveyn vekâleti size ait değil.");
  }
  return profile;
}

async function revokeOpenInvites(store: JuniorStore, userId: string, now: Date): Promise<void> {
  const open = await store.listPendingInvitesForUser(userId, now);
  for (const invite of open) {
    if (invite.status !== "PENDING") {
      continue;
    }
    await store.updateInvite(invite.id, {
      status: "REVOKED",
      updatedAt: now,
    });
  }
}

export async function upsertJuniorProfile(
  ports: JuniorEnginePorts,
  command: UpsertJuniorProfileCommand,
): Promise<{ applied: boolean; profile: JuniorProfileRecord }> {
  const now = command.now ?? new Date();
  const verdict = assertEligibleJuniorMinor(command.dateOfBirth, now);
  const existing = await ports.junior.getProfileByUserId(command.userId);
  if (existing) {
    return { applied: false, profile: existing };
  }
  const track = mebTrackForAge(verdict.dateOfBirth, now);
  const profile = await ports.junior.insertProfile({
    id: randomUUID(),
    userId: command.userId,
    dateOfBirth: verdict.dateOfBirth,
    guardianUserId: null,
    jurisdiction: "TR",
    status: "PENDING_GUARDIAN",
    guardianConsentAt: null,
    mebTrackKey: track.key,
    createdAt: now,
    updatedAt: now,
  });
  return { applied: true, profile };
}

export async function createGuardianInvite(
  ports: JuniorEnginePorts,
  command: CreateGuardianInviteCommand,
): Promise<{ invite: GuardianInviteRecord; plaintext: string }> {
  const now = command.now ?? new Date();
  const actorProfile = await ports.junior.getProfileByUserId(command.actorUserId);

  let initiatorRole: GuardianInviteRecord["initiatorRole"];
  if (actorProfile) {
    assertEligibleJuniorMinor(actorProfile.dateOfBirth, now);
    if (isActiveGuardianship(actorProfile)) {
      throw new Error("Vekâlet bağı zaten aktif.");
    }
    initiatorRole = "CHILD";
  } else {
    initiatorRole = "GUARDIAN";
  }

  const plaintext = generateGuardianInvitePlaintext();
  const tokenHash = hashGuardianInviteToken(plaintext);
  const invite = await withJuniorStore(ports, async (store) => {
    if (initiatorRole === "CHILD") {
      await revokeOpenInvites(store, command.actorUserId, now);
    }
    return store.insertInvite({
      id: randomUUID(),
      userId: command.actorUserId,
      tokenHash,
      tokenPrefix: guardianInvitePrefix(plaintext),
      initiatorRole,
      juniorProfileId: actorProfile?.id ?? null,
      counterpartUserId: null,
      status: "PENDING",
      childApprovedAt: initiatorRole === "CHILD" ? now : null,
      guardianApprovedAt: initiatorRole === "GUARDIAN" ? now : null,
      expiresAt: new Date(now.getTime() + JUNIOR_GUARDIAN_INVITE_TTL_MS),
      consumedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  return { invite, plaintext };
}

export async function acceptGuardianInvite(
  ports: JuniorEnginePorts,
  command: AcceptGuardianInviteCommand,
): Promise<{ applied: boolean; profile: JuniorProfileRecord }> {
  const now = command.now ?? new Date();
  const tokenHash = hashGuardianInviteToken(command.token);

  return withJuniorStore(ports, async (store) => {
    const invite = await store.getInviteByTokenHash(tokenHash);
    if (
      !invite ||
      invite.status !== "PENDING" ||
      invite.expiresAt.getTime() <= now.getTime()
    ) {
      throw new Error(JUNIOR_INVITE_INVALID);
    }
    if (invite.userId === command.actorUserId) {
      throw new Error("Daveti oluşturan taraf kendi token'ını kabul edemez.");
    }

    if (invite.initiatorRole === "CHILD") {
      const childProfile = invite.juniorProfileId
        ? await store.getProfile(invite.juniorProfileId)
        : await store.getProfileByUserId(invite.userId);
      if (!childProfile) {
        throw new Error("Junior profili bulunamadı.");
      }
      const actorAsChild = await store.getProfileByUserId(command.actorUserId);
      if (actorAsChild) {
        throw new Error("Junior profili ebeveyn vekâleti olamaz.");
      }
      assertGuardianIsNotChild(childProfile.userId, command.actorUserId);
      assertEligibleJuniorMinor(childProfile.dateOfBirth, now);
      if (isActiveGuardianship(childProfile)) {
        throw new Error("Vekâlet bağı zaten aktif.");
      }
      const childApprovedAt = invite.childApprovedAt;
      if (!childApprovedAt) {
        throw new Error("Vekâlet her iki tarafın açık onayı olmadan aktif olamaz.");
      }
      const claimed = await store.consumePendingInvite(invite.id, now, {
        counterpartUserId: command.actorUserId,
        juniorProfileId: childProfile.id,
        childApprovedAt,
        guardianApprovedAt: now,
        consumedAt: now,
        updatedAt: now,
      });
      if (!claimed) {
        throw new Error(JUNIOR_INVITE_INVALID);
      }
      const next = await store.updateProfile(childProfile.id, {
        guardianUserId: command.actorUserId,
        status: "GUARDIAN_LINKED",
        guardianConsentAt: now,
        updatedAt: now,
      });
      return { applied: true, profile: next };
    }

    const childProfile = await store.getProfileByUserId(command.actorUserId);
    if (!childProfile) {
      throw new Error("Önce yaş kapısı ile Junior profili açılmalı.");
    }
    assertEligibleJuniorMinor(childProfile.dateOfBirth, now);
    assertGuardianIsNotChild(childProfile.userId, invite.userId);
    if (isActiveGuardianship(childProfile)) {
      throw new Error("Vekâlet bağı zaten aktif.");
    }
    const guardianApprovedAt = invite.guardianApprovedAt;
    if (!guardianApprovedAt) {
      throw new Error("Vekâlet her iki tarafın açık onayı olmadan aktif olamaz.");
    }
    const claimed = await store.consumePendingInvite(invite.id, now, {
      counterpartUserId: command.actorUserId,
      juniorProfileId: childProfile.id,
      guardianApprovedAt,
      childApprovedAt: now,
      consumedAt: now,
      updatedAt: now,
    });
    if (!claimed) {
      throw new Error(JUNIOR_INVITE_INVALID);
    }
    const next = await store.updateProfile(childProfile.id, {
      guardianUserId: invite.userId,
      status: "GUARDIAN_LINKED",
      guardianConsentAt: now,
      updatedAt: now,
    });
    return { applied: true, profile: next };
  });
}

export async function setJuniorWeeklyCap(
  ports: JuniorEnginePorts,
  command: SetJuniorWeeklyCapCommand,
): Promise<JuniorAllowanceRecord> {
  assertJuniorProductionOpen();
  const now = command.now ?? new Date();
  const profile = await requireLinkedWard(ports.junior, command.guardianUserId, command.childUserId);
  assertEligibleJuniorMinor(profile.dateOfBirth, now);
  const guardianUserId = requireActiveGuardianId(profile);
  const weeklyCapMinor = toPositiveAmountMinor(command.weeklyCapMinor);
  const existing = await ports.junior.getAllowanceByProfileId(profile.id);
  if (!existing) {
    return ports.junior.insertAllowance({
      id: randomUUID(),
      juniorProfileId: profile.id,
      userId: profile.userId,
      guardianUserId,
      currencyCode: SETTLEMENT_CURRENCY,
      amountMinor: toAmountMinor(0),
      weeklyCapMinor,
      grantedThisPeriodMinor: toAmountMinor(0),
      periodStartedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }
  if (existing.amountMinor > weeklyCapMinor) {
    throw new Error("Haftalık tavan mevcut harçlık bakiyesinin altında olamaz.");
  }
  return ports.junior.updateAllowance(existing.id, {
    weeklyCapMinor,
    updatedAt: now,
  });
}

export async function grantJuniorAllowance(
  ports: JuniorEnginePorts,
  command: GrantJuniorAllowanceCommand,
): Promise<{ applied: boolean; allowance: JuniorAllowanceRecord }> {
  assertJuniorProductionOpen();
  if (!ports.ledger) {
    throw new Error("Harçlık defteri bağlı değil.");
  }
  const now = command.now ?? new Date();
  const profile = await requireLinkedWard(ports.junior, command.guardianUserId, command.childUserId);
  assertEligibleJuniorMinor(profile.dateOfBirth, now);
  const amountMinor = toPositiveAmountMinor(command.amountMinor);
  const allowance = await ports.junior.getAllowanceByProfileId(profile.id);
  if (!allowance || allowance.weeklyCapMinor <= 0) {
    throw new Error("Önce haftalık harçlık tavanı belirlenmeli.");
  }
  if (allowance.userId === command.guardianUserId) {
    throw new Error("Harçlık çocuk cüzdanına yazılamaz.");
  }

  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.guardianUserId || platformUserId === profile.userId) {
    throw new Error("Platform hazinesi harçlık tarafları ile çakışamaz.");
  }

  return withJuniorMoney(ports, async (tx) => {
    const latest = await tx.junior.getAllowanceByProfileId(profile.id);
    if (!latest || latest.weeklyCapMinor <= 0) {
      throw new Error("Önce haftalık harçlık tavanı belirlenmeli.");
    }

    let current = rollAllowancePeriod(latest, now);
    if (current.periodStartedAt.getTime() !== latest.periodStartedAt.getTime()) {
      current = await tx.junior.updateAllowance(latest.id, {
        grantedThisPeriodMinor: current.grantedThisPeriodMinor,
        periodStartedAt: current.periodStartedAt,
        updatedAt: now,
      });
    }

    const nextGranted = addAmountMinor(current.grantedThisPeriodMinor, amountMinor);
    const nextRemaining = addAmountMinor(current.amountMinor, amountMinor);
    if (nextGranted > current.weeklyCapMinor || nextRemaining > current.weeklyCapMinor) {
      throw new Error("Harçlık haftalık tavanı aşıyor.");
    }

    const debitKey = `junior-allowance-debit:${profile.id}:${current.periodStartedAt.toISOString()}:${current.grantedThisPeriodMinor}:${amountMinor}`;
    const debit = await appendLedgerEntry(tx.ledger, {
      userId: command.guardianUserId,
      currencyCode: current.currencyCode,
      amountMinor,
      direction: "DEBIT",
      label: "Junior harçlık",
      purpose: "junior-allowance-grant",
      idempotencyKey: debitKey,
    });
    await appendLedgerEntry(tx.ledger, {
      userId: platformUserId,
      currencyCode: current.currencyCode,
      amountMinor,
      direction: "CREDIT",
      label: "Junior harçlık rezervi",
      purpose: "junior-allowance-reserve",
      idempotencyKey: `junior-allowance-credit:${profile.id}:${current.periodStartedAt.toISOString()}:${current.grantedThisPeriodMinor}:${amountMinor}`,
    });
    if (!debit.applied) {
      return { applied: false, allowance: current };
    }

    const updated = await tx.junior.updateAllowance(current.id, {
      amountMinor: nextRemaining,
      grantedThisPeriodMinor: nextGranted,
      updatedAt: now,
    });
    return { applied: true, allowance: updated };
  });
}

export async function buildJuniorPulse(
  ports: JuniorEnginePorts,
  userId: string,
  now = new Date(),
): Promise<JuniorPulse> {
  const pulse = await ports.junior.pulseForUser(userId);
  const profile = await ports.junior.getProfileByUserId(userId);
  if (!profile) {
    return pulse;
  }
  try {
    assertEligibleJuniorMinor(profile.dateOfBirth, now);
  } catch {
    return {
      ...pulse,
      status: profile.status,
      bondStatus: isActiveGuardianship(profile) ? "ACTIVE" : "PENDING",
      remainingMinor: toAmountMinor(0),
      weeklyCapMinor: toAmountMinor(0),
      hasGuardianConsent: false,
    };
  }
  if (!isActiveGuardianship(profile)) {
    return {
      ...pulse,
      bondStatus: "PENDING",
      hasGuardianConsent: false,
      remainingMinor: toAmountMinor(0),
      weeklyCapMinor: toAmountMinor(0),
      mebTrackKey: null,
    };
  }
  return { ...pulse, bondStatus: "ACTIVE", hasGuardianConsent: true };
}

export async function loadJuniorSquare(
  ports: JuniorEnginePorts,
  userId: string,
  now = new Date(),
): Promise<{
  profile: JuniorProfileRecord | null;
  allowance: JuniorAllowanceRecord | null;
  mebTrackKey: string | null;
}> {
  const profile = await ports.junior.getProfileByUserId(userId);
  if (!profile) {
    return { profile: null, allowance: null, mebTrackKey: null };
  }
  assertEligibleJuniorMinor(profile.dateOfBirth, now);
  if (!isActiveGuardianship(profile)) {
    return { profile, allowance: null, mebTrackKey: null };
  }
  const allowance = await ports.junior.getAllowanceByProfileId(profile.id);
  return { profile, allowance, mebTrackKey: profile.mebTrackKey };
}

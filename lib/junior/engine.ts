import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { addAmountMinor, toAmountMinor, toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import {
  assertEligibleJuniorMinor,
  assertGuardianIsNotChild,
} from "@/lib/junior/age-gate";
import { mebTrackForAge } from "@/lib/junior/meb-catalog";
import {
  JUNIOR_ALLOWANCE_PERIOD_MS,
  type JuniorAllowanceRecord,
  type JuniorProfileRecord,
  type JuniorPulse,
  type JuniorStore,
} from "@/lib/junior/types";

export type JuniorEnginePorts = {
  junior: JuniorStore;
  ledger?: LedgerStore;
};

export type UpsertJuniorProfileCommand = {
  userId: string;
  dateOfBirth: string;
  guardianUserId: string;
  now?: Date;
};

export type ConsentJuniorProfileCommand = {
  guardianUserId: string;
  childUserId: string;
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

async function requireLinkedWard(
  store: JuniorStore,
  guardianUserId: string,
  childUserId: string,
): Promise<JuniorProfileRecord> {
  const profile = await store.getProfileByUserId(childUserId);
  if (!profile) {
    throw new Error("Junior profili bulunamadı.");
  }
  if (profile.guardianUserId !== guardianUserId) {
    throw new Error("Bu çocuğun ebeveyn vekâleti size ait değil.");
  }
  if (profile.status !== "GUARDIAN_LINKED" || !profile.guardianConsentAt) {
    throw new Error("Ebeveyn onayı tamamlanmadan harçlık açılamaz.");
  }
  return profile;
}

export async function upsertJuniorProfile(
  ports: JuniorEnginePorts,
  command: UpsertJuniorProfileCommand,
): Promise<{ applied: boolean; profile: JuniorProfileRecord }> {
  const now = command.now ?? new Date();
  assertGuardianIsNotChild(command.userId, command.guardianUserId);
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
    guardianUserId: command.guardianUserId,
    jurisdiction: "TR",
    status: "PENDING_GUARDIAN",
    guardianConsentAt: null,
    mebTrackKey: track.key,
    createdAt: now,
    updatedAt: now,
  });
  return { applied: true, profile };
}

export async function consentJuniorProfile(
  ports: JuniorEnginePorts,
  command: ConsentJuniorProfileCommand,
): Promise<{ applied: boolean; profile: JuniorProfileRecord }> {
  const now = command.now ?? new Date();
  const profile = await ports.junior.getProfileByUserId(command.childUserId);
  if (!profile) {
    throw new Error("Junior profili bulunamadı.");
  }
  if (profile.guardianUserId !== command.guardianUserId) {
    throw new Error("Bu çocuğun ebeveyn vekâleti size ait değil.");
  }
  assertEligibleJuniorMinor(profile.dateOfBirth, now);
  if (profile.status === "GUARDIAN_LINKED" && profile.guardianConsentAt) {
    return { applied: false, profile };
  }
  const next = await ports.junior.updateProfile(profile.id, {
    status: "GUARDIAN_LINKED",
    guardianConsentAt: now,
    updatedAt: now,
  });
  return { applied: true, profile: next };
}

export async function setJuniorWeeklyCap(
  ports: JuniorEnginePorts,
  command: SetJuniorWeeklyCapCommand,
): Promise<JuniorAllowanceRecord> {
  const now = command.now ?? new Date();
  const profile = await requireLinkedWard(ports.junior, command.guardianUserId, command.childUserId);
  assertEligibleJuniorMinor(profile.dateOfBirth, now);
  const weeklyCapMinor = toPositiveAmountMinor(command.weeklyCapMinor);
  const existing = await ports.junior.getAllowanceByProfileId(profile.id);
  if (!existing) {
    return ports.junior.insertAllowance({
      id: randomUUID(),
      juniorProfileId: profile.id,
      userId: profile.userId,
      guardianUserId: profile.guardianUserId,
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

  let current = rollAllowancePeriod(allowance, now);
  if (current.periodStartedAt.getTime() !== allowance.periodStartedAt.getTime()) {
    current = await ports.junior.updateAllowance(allowance.id, {
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

  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.guardianUserId || platformUserId === profile.userId) {
    throw new Error("Platform hazinesi harçlık tarafları ile çakışamaz.");
  }

  const debitKey = `junior-allowance-debit:${profile.id}:${current.periodStartedAt.toISOString()}:${current.grantedThisPeriodMinor}:${amountMinor}`;
  const debit = await appendLedgerEntry(ports.ledger, {
    userId: command.guardianUserId,
    currencyCode: current.currencyCode,
    amountMinor,
    direction: "DEBIT",
    label: "Junior harçlık",
    purpose: "junior-allowance-grant",
    idempotencyKey: debitKey,
  });
  await appendLedgerEntry(ports.ledger, {
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

  const updated = await ports.junior.updateAllowance(current.id, {
    amountMinor: nextRemaining,
    grantedThisPeriodMinor: nextGranted,
    updatedAt: now,
  });
  return { applied: true, allowance: updated };
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
    return { ...pulse, status: profile.status };
  }
  return pulse;
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
  const allowance = await ports.junior.getAllowanceByProfileId(profile.id);
  return { profile, allowance, mebTrackKey: profile.mebTrackKey };
}

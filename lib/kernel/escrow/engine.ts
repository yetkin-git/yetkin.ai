import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { emitTransactionNotice } from "@/lib/kernel/observability/transaction-notice";
import { assertEscrowReleaseSplit, splitGross } from "@/lib/kernel/escrow/split";
import type {
  CreateEscrowHoldCommand,
  EscrowHoldRecord,
  EscrowMutationResult,
  EscrowStore,
  RefundEscrowCommand,
  ReleaseEscrowCommand,
  ReleaseEscrowDistributedCommand,
} from "@/lib/kernel/escrow/types";

/** Mutlu yol zaman aşımı — Inngest tarar, PENDING hold iade edilir (S18-A). */
export const ESCROW_HOLD_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export const PLATFORM_TREASURY_USER_ID = "00000000-0000-4000-8000-000000000001";

export function resolvePlatformTreasuryUserId(): string {
  const fromEnv = process.env.PLATFORM_TREASURY_USER_ID?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : PLATFORM_TREASURY_USER_ID;
}

export function computeEscrowExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + ESCROW_HOLD_TTL_MS);
}

function holdIdempotencyKey(referenceKey: string): string {
  return `escrow-hold:${referenceKey}`;
}

function releaseNetIdempotencyKey(holdId: string): string {
  return `escrow-release-net:${holdId}`;
}

function releaseHoldIdempotencyKey(holdId: string): string {
  return `escrow-release-hold:${holdId}`;
}

function refundIdempotencyKey(holdId: string): string {
  return `escrow-refund:${holdId}`;
}

export async function createEscrowHold(
  ports: { ledger: LedgerStore; escrow: EscrowStore },
  command: CreateEscrowHoldCommand,
): Promise<EscrowMutationResult> {
  const existing = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (existing) {
    return { hold: existing, applied: false };
  }

  const now = command.now ?? new Date();
  const split = splitGross({
    grossMinor: command.grossMinor,
    holdBps: command.holdBps,
    currencyCode: command.currencyCode,
  });

  const debit = await appendLedgerEntry(ports.ledger, {
    userId: command.userId,
    currencyCode: command.currencyCode,
    amountMinor: split.grossMinor,
    direction: "DEBIT",
    label: "Emanet kilidi",
    purpose: "escrow-hold",
    idempotencyKey: holdIdempotencyKey(command.referenceKey),
  });

  const hold = await ports.escrow.insertHold({
    id: randomUUID(),
    walletId: debit.walletId,
    userId: command.userId,
    referenceKey: command.referenceKey,
    currencyCode: split.currencyCode,
    grossMinor: split.grossMinor,
    holdMinor: split.holdMinor,
    netMinor: split.netMinor,
    holdBps: split.holdBps,
    expiresAt: command.expiresAt === undefined ? computeEscrowExpiresAt(now) : command.expiresAt,
  });

  return { hold, applied: true };
}

export async function releaseEscrowHold(
  ports: { ledger: LedgerStore; escrow: EscrowStore },
  command: ReleaseEscrowCommand,
): Promise<EscrowMutationResult> {
  const hold = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (!hold) {
    throw new Error("Emanet kilidi bulunamadı.");
  }
  if (hold.status === "RELEASED") {
    return { hold, applied: false };
  }
  if (hold.status !== "PENDING") {
    throw new Error(`Emanet ${hold.status} iken serbest bırakılamaz.`);
  }
  return releaseEscrowHoldToPayees(ports, {
    referenceKey: command.referenceKey,
    payees: [{ userId: command.payeeUserId, amountMinor: hold.netMinor }],
    platformUserId: command.platformUserId,
    now: command.now,
  });
}

export async function releaseEscrowHoldToPayees(
  ports: { ledger: LedgerStore; escrow: EscrowStore },
  command: ReleaseEscrowDistributedCommand,
): Promise<EscrowMutationResult> {
  const hold = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (!hold) {
    throw new Error("Emanet kilidi bulunamadı.");
  }
  if (hold.status === "RELEASED") {
    return { hold, applied: false };
  }
  if (hold.status !== "PENDING") {
    throw new Error(`Emanet ${hold.status} iken serbest bırakılamaz.`);
  }
  if (command.payees.length === 0) {
    throw new Error("Emanet neti en az bir alıcıya yazılmalıdır.");
  }

  const shares = command.payees.map((payee) => ({
    userId: payee.userId,
    amountMinor: toPositiveAmountMinor(payee.amountMinor),
  }));
  const uniquePayees = new Set(shares.map((share) => share.userId));
  if (uniquePayees.size !== shares.length) {
    throw new Error("Aynı alıcıya birden fazla emanet neti yazılamaz.");
  }

  const netSum = shares.reduce((sum, share) => sum + share.amountMinor, 0);
  if (netSum !== hold.netMinor) {
    throw new Error(`Ödül neti ${netSum} ≠ emanet neti ${hold.netMinor}.`);
  }

  if (command.platformUserId === hold.userId) {
    throw new Error("Platform hazinesi ödeyen ile çakışamaz.");
  }
  for (const share of shares) {
    const payerCredit = Boolean(command.allowPayerCredit) && share.userId === hold.userId;
    if (share.userId === hold.userId && !payerCredit) {
      throw new Error("Emanet neti ödeyene yazılamaz.");
    }
    if (share.userId === command.platformUserId) {
      throw new Error("Platform hazinesi alıcı ile çakışamaz.");
    }
  }

  assertEscrowReleaseSplit(hold);
  toPositiveAmountMinor(hold.holdMinor);

  const now = command.now ?? new Date();
  const multiPayee = shares.length > 1;

  for (const share of shares) {
    const payerCredit = Boolean(command.allowPayerCredit) && share.userId === hold.userId;
    await appendLedgerEntry(ports.ledger, {
      userId: share.userId,
      currencyCode: hold.currencyCode,
      amountMinor: share.amountMinor,
      direction: "CREDIT",
      label: payerCredit ? "Emanet serbest — işveren iade" : "Emanet serbest — net",
      purpose: payerCredit ? "escrow-release-payer-refund" : "escrow-release-net",
      idempotencyKey: multiPayee
        ? `${releaseNetIdempotencyKey(hold.id)}:${share.userId}`
        : releaseNetIdempotencyKey(hold.id),
    });
  }

  await appendLedgerEntry(ports.ledger, {
    userId: command.platformUserId,
    currencyCode: hold.currencyCode,
    amountMinor: hold.holdMinor,
    direction: "CREDIT",
    label: "Emanet serbest — platform hold",
    purpose: "escrow-release-hold",
    idempotencyKey: releaseHoldIdempotencyKey(hold.id),
  });

  const released = await ports.escrow.markReleased(hold.id, now);
  return { hold: released, applied: true };
}

export async function refundEscrowHold(
  ports: { ledger: LedgerStore; escrow: EscrowStore },
  command: RefundEscrowCommand,
): Promise<EscrowMutationResult> {
  const hold = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (!hold) {
    throw new Error("Emanet kilidi bulunamadı.");
  }
  if (hold.status === "REFUNDED") {
    return { hold, applied: false };
  }
  if (hold.status !== "PENDING") {
    throw new Error(`Emanet ${hold.status} iken iade edilemez.`);
  }

  assertEscrowReleaseSplit(hold);
  const now = command.now ?? new Date();

  await appendLedgerEntry(ports.ledger, {
    userId: hold.userId,
    currencyCode: hold.currencyCode,
    amountMinor: hold.grossMinor,
    direction: "CREDIT",
    label: "Emanet iadesi",
    purpose: "escrow-refund",
    idempotencyKey: refundIdempotencyKey(hold.id),
  });

  const refunded = await ports.escrow.markRefunded(hold.id, now);
  emitTransactionNotice({
    kind: "escrow_refunded",
    userId: hold.userId,
    amountMinor: hold.grossMinor,
    reference: hold.id,
    applied: true,
  });
  return { hold: refunded, applied: true };
}

/** S51-A: anlaşmazlık süresince TTL durur; Inngest tarayıcısı bu hold'u iade etmez. */
export async function freezeEscrowHoldExpiry(
  ports: { escrow: EscrowStore },
  command: { referenceKey: string },
): Promise<EscrowHoldRecord> {
  const hold = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (!hold) {
    throw new Error("Emanet kilidi bulunamadı.");
  }
  if (hold.status !== "PENDING") {
    return hold;
  }
  return ports.escrow.freezeExpiry(hold.id);
}

import { randomUUID } from "node:crypto";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { emitCitizenNotice } from "@/lib/kernel/notice/emit";
import { emitTransactionNotice } from "@/lib/kernel/observability/transaction-notice";
import { assertEscrowReleaseSplit, splitGross } from "@/lib/kernel/escrow/split";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import {
  buildMarketplaceSplitIntent,
  MARKETPLACE_PAYMENT_NOT_CONFIGURED_ERROR,
  paytrMarketplaceSplitPort,
  settleMarketplaceSplit,
  type MarketplaceSplitLeg,
} from "@/lib/kernel/payments/marketplace-split";
import type {
  CreateEscrowHoldCommand,
  EscrowEnginePorts,
  EscrowHoldRecord,
  EscrowMutationResult,
  EscrowStore,
  EscrowWritePorts,
  RefundEscrowCommand,
  ReleaseEscrowCommand,
  ReleaseEscrowDistributedCommand,
} from "@/lib/kernel/escrow/types";

/** S43: üçüncü kişi emaneti cüzdan DEBIT ile kilitlenemez. Yalnız PSP (split). */
export const ESCROW_WALLET_FUNDING_FORBIDDEN =
  "Üçüncü kişi emaneti cüzdan DEBIT ile kilitlenemez (S43). Yalnız PSP (split).";

/**
 * Eski wallet-funded PENDING hold — serbest/iade yazılmaz.
 * Split `ok: false` iken sessiz RELEASED yasaktır.
 */
export const ESCROW_WALLET_FUNDED_HOLD_FORBIDDEN =
  "Cüzdan-fonlu emanet kilit geçersizdir (S43). Serbest bırakılmaz, iade yazılmaz.";

export class EscrowWalletFundedHoldError extends ServiceUnavailableError {
  constructor(message = ESCROW_WALLET_FUNDED_HOLD_FORBIDDEN) {
    super(message);
    this.name = "EscrowWalletFundedHoldError";
  }
}

/** Mutlu yol zaman aşımı — Inngest tarar, PENDING hold iade edilir (S18-A). */
export const ESCROW_HOLD_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** TTL yaklaşım penceresi — iade tarayıcısından ayrı; yeni tablo yoktur. */
export const ESCROW_TTL_WARN_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

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

function isWalletFundedHold(
  hold: EscrowHoldRecord,
  walletDebit: Awaited<ReturnType<EscrowWritePorts["ledger"]["findByIdempotencyKey"]>>,
): boolean {
  return Boolean(hold.walletId) || Boolean(walletDebit);
}

function assertPspOnlyHold(
  hold: EscrowHoldRecord,
  walletDebit: Awaited<ReturnType<EscrowWritePorts["ledger"]["findByIdempotencyKey"]>>,
): void {
  if (isWalletFundedHold(hold, walletDebit)) {
    throw new EscrowWalletFundedHoldError();
  }
}

async function withEscrowAtomic<T>(
  ports: EscrowEnginePorts,
  work: (tx: EscrowWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runEscrowAtomic) {
    return ports.runEscrowAtomic((tx) =>
      work({
        ledger: tx.ledger,
        escrow: tx.escrow,
        marketplace: tx.marketplace ?? ports.marketplace,
      }),
    );
  }
  return work({
    ledger: ports.ledger,
    escrow: ports.escrow,
    marketplace: ports.marketplace,
  });
}

async function loadHoldForSettle(
  escrow: EscrowStore,
  referenceKey: string,
): Promise<EscrowHoldRecord | null> {
  return escrow.lockByReferenceKey(referenceKey);
}

export async function createEscrowHold(
  ports: EscrowWritePorts,
  command: CreateEscrowHoldCommand,
): Promise<EscrowMutationResult> {
  const existing = await ports.escrow.findByReferenceKey(command.referenceKey);
  if (existing) {
    const walletDebit = await ports.ledger.findByIdempotencyKey(
      holdIdempotencyKey(command.referenceKey),
    );
    assertPspOnlyHold(existing, walletDebit);
    return { hold: existing, applied: false };
  }

  const now = command.now ?? new Date();
  const split = splitGross({
    grossMinor: command.grossMinor,
    holdBps: command.holdBps,
    currencyCode: command.currencyCode,
  });

  const funding = command.funding;
  if (funding === "wallet") {
    throw new Error(ESCROW_WALLET_FUNDING_FORBIDDEN);
  }
  if (funding !== "psp") {
    throw new Error("Emanet funding zorunludur (psp). Varsayılan wallet yoktur.");
  }

  const hold = await ports.escrow.insertHold({
    id: randomUUID(),
    walletId: null,
    pspPaymentId: command.pspPaymentId ?? command.referenceKey,
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
  ports: EscrowEnginePorts,
  command: ReleaseEscrowCommand,
): Promise<EscrowMutationResult> {
  return withEscrowAtomic(ports, async (tx) => {
    const hold = await loadHoldForSettle(tx.escrow, command.referenceKey);
    if (!hold) {
      throw new Error("Emanet kilidi bulunamadı.");
    }
    if (hold.status === "RELEASED") {
      return { hold, applied: false };
    }
    if (hold.status !== "PENDING") {
      throw new Error(`Emanet ${hold.status} iken serbest bırakılamaz.`);
    }
    return releaseEscrowHoldToPayeesLocked(tx, hold, {
      referenceKey: command.referenceKey,
      payees: [{ userId: command.payeeUserId, amountMinor: hold.netMinor }],
      platformUserId: command.platformUserId,
      now: command.now,
    });
  });
}

export async function releaseEscrowHoldToPayees(
  ports: EscrowEnginePorts,
  command: ReleaseEscrowDistributedCommand,
): Promise<EscrowMutationResult> {
  return withEscrowAtomic(ports, async (tx) => {
    const hold = await loadHoldForSettle(tx.escrow, command.referenceKey);
    if (!hold) {
      throw new Error("Emanet kilidi bulunamadı.");
    }
    if (hold.status === "RELEASED") {
      return { hold, applied: false };
    }
    if (hold.status !== "PENDING") {
      throw new Error(`Emanet ${hold.status} iken serbest bırakılamaz.`);
    }
    return releaseEscrowHoldToPayeesLocked(tx, hold, command);
  });
}

async function releaseEscrowHoldToPayeesLocked(
  ports: EscrowWritePorts,
  hold: EscrowHoldRecord,
  command: ReleaseEscrowDistributedCommand,
): Promise<EscrowMutationResult> {
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
  const splitLegs: MarketplaceSplitLeg[] = [];
  const walletDebit = await ports.ledger.findByIdempotencyKey(
    holdIdempotencyKey(hold.referenceKey),
  );
  assertPspOnlyHold(hold, walletDebit);

  for (const share of shares) {
    splitLegs.push({
      role: "artisan",
      userId: share.userId,
      amountMinor: share.amountMinor,
    });
  }

  if (hold.holdMinor > 0) {
    splitLegs.push({
      role: "platform",
      userId: command.platformUserId,
      amountMinor: hold.holdMinor,
    });
  }

  const splitResult = await settleMarketplaceSplit(
    buildMarketplaceSplitIntent({
      referenceKey: hold.referenceKey,
      currencyCode: hold.currencyCode,
      legs: splitLegs,
    }),
    ports.marketplace ?? paytrMarketplaceSplitPort,
  );
  if (!splitResult.ok) {
    throw new ServiceUnavailableError(MARKETPLACE_PAYMENT_NOT_CONFIGURED_ERROR);
  }

  const released = await ports.escrow.markReleased(hold.id, now);
  emitCitizenNotice({
    kind: "escrow_released",
    userId: hold.userId,
    reference: hold.id,
    amountMinor: hold.grossMinor,
    applied: true,
  });
  for (const share of shares) {
    if (share.userId === hold.userId || share.userId === command.platformUserId) {
      continue;
    }
    emitCitizenNotice({
      kind: "escrow_released",
      userId: share.userId,
      reference: hold.id,
      amountMinor: share.amountMinor,
      applied: true,
    });
  }
  return { hold: released, applied: true };
}

export async function refundEscrowHold(
  ports: EscrowEnginePorts,
  command: RefundEscrowCommand,
): Promise<EscrowMutationResult> {
  return withEscrowAtomic(ports, async (tx) => {
    const hold = await loadHoldForSettle(tx.escrow, command.referenceKey);
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

    const walletDebit = await tx.ledger.findByIdempotencyKey(
      holdIdempotencyKey(hold.referenceKey),
    );
    assertPspOnlyHold(hold, walletDebit);

    const refunded = await tx.escrow.markRefunded(hold.id, now);
    emitTransactionNotice({
      kind: "escrow_refunded",
      userId: hold.userId,
      amountMinor: hold.grossMinor,
      reference: hold.id,
      applied: true,
    });
    return { hold: refunded, applied: true };
  });
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

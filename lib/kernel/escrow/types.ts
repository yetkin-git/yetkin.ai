import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { EscrowHoldStatus } from "@/lib/kernel/escrow/split";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import type { MarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";

export type EscrowHoldRecord = {
  id: string;
  walletId: string | null;
  pspPaymentId: string | null;
  userId: string;
  referenceKey: string;
  status: EscrowHoldStatus;
  currencyCode: CurrencyCode;
  grossMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  holdBps: number;
  createdAt: Date;
  releasedAt: Date | null;
  refundedAt: Date | null;
  expiresAt: Date | null;
};

export type EscrowStore = {
  findByReferenceKey(referenceKey: string): Promise<EscrowHoldRecord | null>;
  /** Satır kilidi. Prisma: SELECT … FOR UPDATE (transaction içinde). Bellek: okuma. */
  lockByReferenceKey(referenceKey: string): Promise<EscrowHoldRecord | null>;
  findById(id: string): Promise<EscrowHoldRecord | null>;
  insertHold(input: {
    id: string;
    walletId: string | null;
    pspPaymentId: string | null;
    userId: string;
    referenceKey: string;
    currencyCode: CurrencyCode;
    grossMinor: AmountMinor;
    holdMinor: AmountMinor;
    netMinor: AmountMinor;
    holdBps: number;
    expiresAt: Date | null;
  }): Promise<EscrowHoldRecord>;
  markReleased(id: string, at: Date): Promise<EscrowHoldRecord>;
  markRefunded(id: string, at: Date): Promise<EscrowHoldRecord>;
  freezeExpiry(id: string): Promise<EscrowHoldRecord>;
  listExpiredPending(now: Date): Promise<EscrowHoldRecord[]>;
  /** PENDING ve expiresAt (now, until] — TTL yaklaşım bildirimi. Yeni tablo yoktur. */
  listPendingExpiringSoon(now: Date, until: Date): Promise<EscrowHoldRecord[]>;
};

export type EscrowHoldFunding = "wallet" | "psp";

export type CreateEscrowHoldCommand = {
  userId: string;
  referenceKey: string;
  grossMinor: number;
  holdBps: number;
  currencyCode: CurrencyCode;
  expiresAt?: Date | null;
  now?: Date;
  /**
   * Zorunlu. `psp`: üçüncü kişi işi — kilit kaydı; ledger DEBIT yok; cüzdan satırı yok.
   * `wallet` yasadışıdır (S43); `createEscrowHold` throw eder.
   * Akademi tahsilatı emanet değildir (ayrı DEBIT). Varsayılan yoktur.
   */
  funding: EscrowHoldFunding;
  /** PSP ödeme kimliği; yoksa `referenceKey` yazılır. */
  pspPaymentId?: string | null;
};

export type ReleaseEscrowCommand = {
  referenceKey: string;
  payeeUserId: string;
  platformUserId: string;
  now?: Date;
};

export type EscrowPayeeShare = {
  userId: string;
  amountMinor: number;
};

export type ReleaseEscrowDistributedCommand = {
  referenceKey: string;
  payees: EscrowPayeeShare[];
  platformUserId: string;
  now?: Date;
  /** Tahkim/kısmi iade: netin bir dilimi ödeyene (işveren) CREDIT yazılabilir (S52-A). */
  allowPayerCredit?: boolean;
};

export type RefundEscrowCommand = {
  referenceKey: string;
  now?: Date;
};

export type EscrowMutationResult = {
  hold: EscrowHoldRecord;
  applied: boolean;
};

export type EscrowWritePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  marketplace?: MarketplaceSplitPort;
};

export type EscrowEnginePorts = EscrowWritePorts & {
  runEscrowAtomic?: <T>(work: (tx: EscrowWritePorts) => Promise<T>) => Promise<T>;
};

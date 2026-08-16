import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { EscrowHoldStatus } from "@/lib/kernel/escrow/split";

export type EscrowHoldRecord = {
  id: string;
  walletId: string;
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
  findById(id: string): Promise<EscrowHoldRecord | null>;
  insertHold(input: {
    id: string;
    walletId: string;
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
};

export type CreateEscrowHoldCommand = {
  userId: string;
  referenceKey: string;
  grossMinor: number;
  holdBps: number;
  currencyCode: CurrencyCode;
  expiresAt?: Date | null;
  now?: Date;
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

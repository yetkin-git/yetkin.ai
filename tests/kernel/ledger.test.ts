import { describe, expect, it } from "vitest";
import { appendLedgerEntry, applyLedgerDelta } from "@/lib/kernel/ledger/engine";
import type { LedgerEntryRecord, LedgerStore, WalletSnapshot } from "@/lib/kernel/ledger/types";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

function createMemoryLedger(initial: WalletSnapshot): LedgerStore {
  let wallet = { ...initial };
  const entries = new Map<string, LedgerEntryRecord>();
  return {
    async lockWallet() {
      return wallet;
    },
    async findByIdempotencyKey(key) {
      return entries.get(key) ?? null;
    },
    async insertEntry(_wallet, command, nextBalance) {
      entries.set(command.idempotencyKey, {
        id: command.idempotencyKey,
        walletId: wallet.id,
        userId: command.userId,
        amountMinor: command.amountMinor,
        currencyCode: command.currencyCode,
        direction: command.direction,
        label: command.label,
        purpose: command.purpose,
        idempotencyKey: command.idempotencyKey,
        createdAt: new Date(),
      });
      wallet = { ...wallet, amountMinor: nextBalance };
    },
  };
}

describe("ledger engine", () => {
  it("credit ekler, debit düşer, yetersiz bakiyede fırlatır", () => {
    const start = toAmountMinor(1000);
    const credited = applyLedgerDelta(start, {
      direction: "CREDIT",
      amountMinor: toAmountMinor(250),
    });
    expect(credited).toBe(1250);
    const debited = applyLedgerDelta(credited, {
      direction: "DEBIT",
      amountMinor: toAmountMinor(200),
    });
    expect(debited).toBe(1050);
    expect(() =>
      applyLedgerDelta(debited, { direction: "DEBIT", amountMinor: toAmountMinor(5000) }),
    ).toThrow();
  });

  it("aynı idempotencyKey ikinci kez bakiyeyi değiştirmez", async () => {
    const store = createMemoryLedger({
      id: "w1",
      userId: "u1",
      currencyCode: "TRY",
      amountMinor: toAmountMinor(0),
    });
    const command = {
      userId: "u1",
      currencyCode: "TRY" as const,
      amountMinor: toAmountMinor(500),
      direction: "CREDIT" as const,
      label: "test",
      purpose: "topup",
      idempotencyKey: "oid-1",
    };
    const first = await appendLedgerEntry(store, command);
    const second = await appendLedgerEntry(store, command);
    expect(first.applied).toBe(true);
    expect(first.balanceMinor).toBe(500);
    expect(second.applied).toBe(false);
    expect(second.balanceMinor).toBe(500);
  });
});

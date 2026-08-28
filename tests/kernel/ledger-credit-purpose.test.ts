import { describe, expect, it } from "vitest";
import {
  assertLedgerCreditPurpose,
  isLedgerCreditPurpose,
  LEDGER_CREDIT_PURPOSE_REJECTED,
  LEDGER_CREDIT_PURPOSES,
  LEDGER_EXTERNAL_CREDIT_PURPOSE,
} from "@/lib/kernel/ledger/credit-purposes";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { LedgerEntryRecord, LedgerStore, WalletSnapshot } from "@/lib/kernel/ledger/types";

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

describe("ledger CREDIT amaç listesi", () => {
  it("dış para yalnız wallet-top-up; donmuş settlement ve sahte amaç reddedilir", () => {
    expect(LEDGER_EXTERNAL_CREDIT_PURPOSE).toBe("wallet-top-up");
    expect(LEDGER_CREDIT_PURPOSES).toContain("academy-settlement");
    expect(LEDGER_CREDIT_PURPOSES).toContain("escrow-refund");
    expect(LEDGER_CREDIT_PURPOSES).toContain("escrow-release-payer-refund");
    expect(isLedgerCreditPurpose("studio-settlement")).toBe(false);
    expect(isLedgerCreditPurpose("junior-allowance-grant")).toBe(false);
    expect(isLedgerCreditPurpose("pazaryeri-seller-net")).toBe(false);
    expect(() => assertLedgerCreditPurpose("admin-inject")).toThrow(LEDGER_CREDIT_PURPOSE_REJECTED);
  });

  it("appendLedgerEntry izin dışı CREDIT yazmaz; DEBIT amaç serbesttir", async () => {
    const store = createMemoryLedger({
      id: "w1",
      userId: "u1",
      currencyCode: "TRY",
      amountMinor: toAmountMinor(0),
    });
    await expect(
      appendLedgerEntry(store, {
        userId: "u1",
        currencyCode: "TRY",
        amountMinor: toAmountMinor(500),
        direction: "CREDIT",
        label: "sahte",
        purpose: "studio-settlement",
        idempotencyKey: "fake-1",
      }),
    ).rejects.toThrow(LEDGER_CREDIT_PURPOSE_REJECTED);
    const credited = await appendLedgerEntry(store, {
      userId: "u1",
      currencyCode: "TRY",
      amountMinor: toAmountMinor(500),
      direction: "CREDIT",
      label: "Cüzdan yükleme",
      purpose: LEDGER_EXTERNAL_CREDIT_PURPOSE,
      idempotencyKey: "oid-ok",
    });
    expect(credited.applied).toBe(true);
    expect(credited.balanceMinor).toBe(500);
    const spent = await appendLedgerEntry(store, {
      userId: "u1",
      currencyCode: "TRY",
      amountMinor: toAmountMinor(200),
      direction: "DEBIT",
      label: "Harcama",
      purpose: "academy-purchase",
      idempotencyKey: "debit-ok",
    });
    expect(spent.applied).toBe(true);
    expect(spent.balanceMinor).toBe(300);
  });
});

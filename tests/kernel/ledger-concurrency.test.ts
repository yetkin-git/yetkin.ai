import { describe, expect, it } from "vitest";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  createMemoryLedgerStore,
  signedLedgerSum,
  withMemoryLedgerAtomic,
} from "../helpers/memory-money";

const USER = "wallet-owner-1";
const OPENING = 100_000;
const PARALLEL = 20;

function creditCommand(index: number, amountMinor: number) {
  return {
    userId: USER,
    currencyCode: SETTLEMENT_CURRENCY,
    amountMinor: toAmountMinor(amountMinor),
    direction: "CREDIT" as const,
    label: `eşzamanlı credit ${index}`,
    purpose: "wallet-top-up",
    idempotencyKey: `concurrency-credit-${index}`,
  };
}

function debitCommand(index: number, amountMinor: number) {
  return {
    userId: USER,
    currencyCode: SETTLEMENT_CURRENCY,
    amountMinor: toAmountMinor(amountMinor),
    direction: "DEBIT" as const,
    label: `eşzamanlı debit ${index}`,
    purpose: "concurrency-debit",
    idempotencyKey: `concurrency-debit-${index}`,
  };
}

function assertWalletMatchesLedger(
  ledger: ReturnType<typeof createMemoryLedgerStore>,
  openingMinor: number,
) {
  const wallet = ledger.snapshot(USER);
  const signed = signedLedgerSum(ledger.listEntries(USER), USER);
  expect(wallet.amountMinor).toBe(openingMinor + signed);
  expect(wallet.amountMinor).toBeGreaterThanOrEqual(0);
}

describe("ledger eşzamanlılık — Unit of Work", () => {
  it("aynı cüzdana 20 farklı idempotency anahtarıyla paralel debit kayıp güncelleme yapmaz", async () => {
    const ledger = createMemoryLedgerStore([{ userId: USER, amountMinor: OPENING }]);
    const uow = withMemoryLedgerAtomic(ledger);
    const debitMinor = 1_000;

    const results = await Promise.all(
      Array.from({ length: PARALLEL }, (_, index) =>
        uow.runAtomic((store) => appendLedgerEntry(store, debitCommand(index, debitMinor))),
      ),
    );

    expect(results).toHaveLength(PARALLEL);
    expect(results.every((row) => row.applied)).toBe(true);
    expect(ledger.snapshot(USER).amountMinor).toBe(OPENING - PARALLEL * debitMinor);
    expect(ledger.listEntries(USER)).toHaveLength(PARALLEL);
    assertWalletMatchesLedger(ledger, OPENING);
  });

  it("20 paralel karışık debit/credit bakiyeyi ledger toplamına eşit tutar", async () => {
    const ledger = createMemoryLedgerStore([{ userId: USER, amountMinor: OPENING }]);
    const uow = withMemoryLedgerAtomic(ledger);
    const creditMinor = 500;
    const debitMinor = 1_000;

    await Promise.all(
      Array.from({ length: PARALLEL }, (_, index) =>
        uow.runAtomic((store) =>
          appendLedgerEntry(
            store,
            index % 2 === 0
              ? creditCommand(index, creditMinor)
              : debitCommand(index, debitMinor),
          ),
        ),
      ),
    );

    const credits = 10 * creditMinor;
    const debits = 10 * debitMinor;
    expect(ledger.snapshot(USER).amountMinor).toBe(OPENING + credits - debits);
    expect(ledger.listEntries(USER)).toHaveLength(PARALLEL);
    assertWalletMatchesLedger(ledger, OPENING);
  });

  it("paralel debit yetersiz bakiyede negatif cüzdan yazmaz; kazananlar ledger ile örtüşür", async () => {
    const ledger = createMemoryLedgerStore([{ userId: USER, amountMinor: OPENING }]);
    const uow = withMemoryLedgerAtomic(ledger);
    const debitMinor = 10_000;

    const settled = await Promise.allSettled(
      Array.from({ length: PARALLEL }, (_, index) =>
        uow.runAtomic((store) => appendLedgerEntry(store, debitCommand(index, debitMinor))),
      ),
    );

    const applied = settled.filter((row) => row.status === "fulfilled");
    const rejected = settled.filter((row) => row.status === "rejected");
    expect(applied).toHaveLength(10);
    expect(rejected).toHaveLength(10);
    expect(
      rejected.every(
        (row) =>
          row.status === "rejected" &&
          isInsufficientBalanceError(row.reason instanceof Error ? row.reason.message : String(row.reason)),
      ),
    ).toBe(true);
    expect(ledger.snapshot(USER).amountMinor).toBe(0);
    expect(ledger.listEntries(USER)).toHaveLength(10);
    assertWalletMatchesLedger(ledger, OPENING);
  });
});

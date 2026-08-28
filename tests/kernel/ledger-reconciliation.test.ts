import { describe, expect, it, vi } from "vitest";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  WALLET_TOP_UP_PURPOSE,
  walletTopUpLedgerIdempotencyKey,
} from "@/lib/kernel/payments/clearing";
import {
  evaluateClearedPaymentOrderInvariant,
  evaluateWalletLedgerInvariant,
  runLedgerReconciliationScan,
} from "@/lib/kernel/payments/ledger-reconciliation";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";

const USER = "citizen-recon-1";

describe("Defter mutabakat invariantı", () => {
  it("Wallet.amountMinor == Σ CREDIT − Σ DEBIT sapmasını işaretler", async () => {
    const ledger = createMemoryLedgerStore([{ userId: USER, amountMinor: 0 }]);
    await appendLedgerEntry(ledger, {
      userId: USER,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(1300),
      direction: "CREDIT",
      label: "Cüzdan yükleme",
      purpose: WALLET_TOP_UP_PURPOSE,
      idempotencyKey: walletTopUpLedgerIdempotencyKey("oid-ok"),
    });
    await appendLedgerEntry(ledger, {
      userId: USER,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(300),
      direction: "DEBIT",
      label: "Harcama",
      purpose: "spend",
      idempotencyKey: "spend:1",
    });
    const wallet = ledger.snapshot(USER);
    const entries = ledger.listEntries(USER);
    const credit = entries
      .filter((row) => row.direction === "CREDIT")
      .reduce((sum, row) => sum + row.amountMinor, 0);
    const debit = entries
      .filter((row) => row.direction === "DEBIT")
      .reduce((sum, row) => sum + row.amountMinor, 0);
    expect(wallet.amountMinor).toBe(credit - debit);

    const balanced = evaluateWalletLedgerInvariant(
      [
        {
          walletId: wallet.id,
          userId: USER,
          currencyCode: "TRY",
          amountMinor: wallet.amountMinor,
        },
      ],
      [
        { walletId: wallet.id, direction: "CREDIT", amountMinor: credit },
        { walletId: wallet.id, direction: "DEBIT", amountMinor: debit },
      ],
    );
    expect(balanced).toEqual([]);

    const drifted = evaluateWalletLedgerInvariant(
      [
        {
          walletId: wallet.id,
          userId: USER,
          currencyCode: "TRY",
          amountMinor: wallet.amountMinor + 50,
        },
      ],
      [
        { walletId: wallet.id, direction: "CREDIT", amountMinor: credit },
        { walletId: wallet.id, direction: "DEBIT", amountMinor: debit },
      ],
    );
    expect(drifted).toHaveLength(1);
    expect(drifted[0]?.ledgerSignedMinor).toBe(1000);
  });

  it("CLEARED sipariş CREDIT uyumsuzluğunu ve yetim CREDIT'i yakalar", () => {
    const orders = [
      { id: "po-1", merchantOid: "oid-a", amountMinor: 1300, currencyCode: "TRY" },
    ];
    expect(
      evaluateClearedPaymentOrderInvariant(orders, [
        {
          idempotencyKey: walletTopUpLedgerIdempotencyKey("oid-a"),
          amountMinor: 1300,
          currencyCode: "TRY",
          direction: "CREDIT",
          purpose: WALLET_TOP_UP_PURPOSE,
        },
      ]),
    ).toEqual([]);

    expect(
      evaluateClearedPaymentOrderInvariant(orders, [
        {
          idempotencyKey: walletTopUpLedgerIdempotencyKey("oid-a"),
          amountMinor: 500,
          currencyCode: "TRY",
          direction: "CREDIT",
          purpose: WALLET_TOP_UP_PURPOSE,
        },
      ])[0]?.reason,
    ).toBe("amount_mismatch");

    expect(
      evaluateClearedPaymentOrderInvariant(orders, [])[0]?.reason,
    ).toBe("missing_credit");

    expect(
      evaluateClearedPaymentOrderInvariant([], [
        {
          idempotencyKey: walletTopUpLedgerIdempotencyKey("orphan"),
          amountMinor: 200,
          currencyCode: "TRY",
          direction: "CREDIT",
          purpose: WALLET_TOP_UP_PURPOSE,
        },
      ])[0]?.reason,
    ).toBe("orphan_credit");
  });

  it("tarama sapmada anomali yazar; CREDIT/wallet düzeltmez", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const anomalies = createMemoryPaymentAnomalyStore();
    const result = await runLedgerReconciliationScan({
      anomalies,
      async loadSnapshot() {
        return {
          wallets: [
            {
              walletId: "w-1",
              userId: USER,
              currencyCode: "TRY",
              amountMinor: 500,
            },
          ],
          ledgerSums: [{ walletId: "w-1", direction: "CREDIT", amountMinor: 100 }],
          clearedOrders: [
            { id: "po-1", merchantOid: "oid-a", amountMinor: 1300, currencyCode: "TRY" },
          ],
          topUpCredits: [],
        };
      },
    });
    expect(result.walletDrifts).toBe(1);
    expect(result.clearedOrderDrifts).toBe(1);
    expect(result.anomaliesWritten).toBe(2);
    expect(anomalies.list().map((row) => row.kind).sort()).toEqual([
      "cleared_order_mismatch",
      "wallet_ledger_drift",
    ]);
    vi.restoreAllMocks();
  });
});

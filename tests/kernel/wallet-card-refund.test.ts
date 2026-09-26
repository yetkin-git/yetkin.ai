import { describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/kernel/http/errors";
import { assertAccountCloseable, anonymizedCitizenEmail } from "@/lib/kernel/identity/close-account-gate";
import type { LedgerEntryRecord, LedgerStore } from "@/lib/kernel/ledger/types";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  buildPaytrRefundToken,
  formatPaytrReturnAmount,
  interpretPaytrRefundPayload,
} from "@/lib/kernel/payments/paytr/refund";
import {
  allocateUnusedBalanceRefund,
  refundUnusedWalletBalance,
  type WalletCardRefundPorts,
  type WalletCardRefundRow,
} from "@/lib/kernel/payments/wallet-card-refund";

const FINANCE_REVIEW_MINOR = 191_000;

function memoryRefundPorts(
  startMinor: number,
  orders: { merchantOid: string; amountMinor: number }[],
): {
  ports: WalletCardRefundPorts;
  balance: () => number;
  settleFinanceHold: () => void;
} {
  let balance = startMinor;
  const rows: WalletCardRefundRow[] = [];
  const entries = new Map<string, LedgerEntryRecord>();
  const ledger: LedgerStore = {
    async lockWallet(userId, currencyCode) {
      return {
        id: "wallet",
        userId,
        currencyCode,
        amountMinor: toAmountMinor(balance),
      };
    },
    async findByIdempotencyKey(idempotencyKey) {
      return entries.get(idempotencyKey) ?? null;
    },
    async insertEntry(wallet, command, nextBalance) {
      balance = nextBalance;
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
    },
  };
  const ports: WalletCardRefundPorts = {
    paytrConfigured: true,
    callPaytr: async ({ amountMinor }) => ({
      ok: true,
      returnAmount: formatPaytrReturnAmount(amountMinor),
    }),
    ledger,
    refunds: {
      async lockBalanceMinor() {
        return balance;
      },
      async listClearedOrders() {
        return orders;
      },
      async sumReservedByOid() {
        return {};
      },
      async listOpen() {
        return rows.filter((row) => row.status === "PENDING" || row.status === "ACCEPTED");
      },
      async insert(input) {
        const row: WalletCardRefundRow = {
          id: `row-${rows.length + 1}`,
          merchantOid: input.merchantOid,
          amountMinor: input.amountMinor,
          status: input.status,
        };
        rows.push(row);
        return row;
      },
      async mark(id, status) {
        const row = rows.find((item) => item.id === id);
        if (row) {
          row.status = status;
        }
      },
    },
  };
  return {
    ports,
    balance: () => balance,
    settleFinanceHold() {
      balance = 0;
    },
  };
}

describe("cüzdan kart iadesi", () => {
  it("25 TL bakiyeyi en yeni CLEARED siparişe böler", () => {
    const slices = allocateUnusedBalanceRefund(
      2500,
      [
        { merchantOid: "new", amountMinor: 1500 },
        { merchantOid: "old", amountMinor: 1000 },
      ],
      {},
    );
    expect(slices).toEqual([
      { merchantOid: "new", amountMinor: 1500 },
      { merchantOid: "old", amountMinor: 1000 },
    ]);
  });

  it("daha önce iade edilen kuruşu odadan düşer", () => {
    const slices = allocateUnusedBalanceRefund(
      500,
      [{ merchantOid: "oid", amountMinor: 1500 }],
      { oid: 1000 },
    );
    expect(slices).toEqual([{ merchantOid: "oid", amountMinor: 500 }]);
  });

  it("PayTR iade tutarı ve token sabit biçimdedir", () => {
    expect(formatPaytrReturnAmount(2500)).toBe("25.00");
    const token = buildPaytrRefundToken("1", "oid", "25.00", "key", "salt");
    expect(token.length).toBeGreaterThan(10);
    expect(interpretPaytrRefundPayload({ status: "success", return_amount: "25.00" })).toEqual({
      ok: true,
      returnAmount: "25.00",
    });
    expect(interpretPaytrRefundPayload({ status: "error", err_msg: "fazla" }).ok).toBe(false);
  });
});

describe("hesap kapatma kapısı", () => {
  it("bakiye varken kapatmayı keser", () => {
    expect(() => assertAccountCloseable(2500)).toThrow(ConflictError);
    expect(assertAccountCloseable(0)).toBeUndefined();
  });

  it("₺25,00 kart siparişine bölününce anında düşer", async () => {
    const { ports, balance } = memoryRefundPorts(2_500, [
      { merchantOid: "card-25", amountMinor: 2_500 },
    ]);
    const result = await refundUnusedWalletBalance(ports, "citizen-25");
    expect(result.refundedMinor).toBe(2_500);
    expect(result.requestedMinor).toBe(0);
    expect(balance()).toBe(0);
    expect(assertAccountCloseable(balance())).toBeUndefined();
  });

  it("₺1.910,00 kart siparişine bağlanamazsa incelemede kalır; finans onayı bakiyeyi sıfırlayınca kapı açılır", async () => {
    const sim = memoryRefundPorts(FINANCE_REVIEW_MINOR, []);
    const held = await refundUnusedWalletBalance(sim.ports, "yapinet360");
    expect(held.refundedMinor).toBe(0);
    expect(held.requestedMinor).toBe(FINANCE_REVIEW_MINOR);
    expect(held.balanceMinor).toBe(FINANCE_REVIEW_MINOR);
    expect(SETTLEMENT_CURRENCY).toBe("TRY");
    expect(() => assertAccountCloseable(sim.balance())).toThrow(ConflictError);

    sim.settleFinanceHold();
    expect(sim.balance()).toBe(0);
    expect(assertAccountCloseable(sim.balance())).toBeUndefined();
  });

  it("anonim e-posta kimliği taşır", () => {
    expect(anonymizedCitizenEmail("abc")).toBe("closed.abc@anon.yetkin.invalid");
  });
});

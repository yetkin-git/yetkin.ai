import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
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
  citizenWalletRefundDetail,
  refundUnusedWalletBalance,
  WALLET_REFUND_SUPER_ADMIN_AUDIT_SKIPPED,
  warnWhenSuperAdminRefundAuditMissed,
  type WalletCardRefundPorts,
  type WalletCardRefundRow,
} from "@/lib/kernel/payments/wallet-card-refund";

const FINANCE_REVIEW_MINOR = 191_000;

function memoryRefundPorts(
  startMinor: number,
  orders: { merchantOid: string; amountMinor: number }[],
  callPaytr?: WalletCardRefundPorts["callPaytr"],
): {
  ports: WalletCardRefundPorts;
  balance: () => number;
  settleFinanceHold: () => void;
  rows: () => Array<WalletCardRefundRow & { detail: string | null }>;
} {
  let balance = startMinor;
  const rows: Array<WalletCardRefundRow & { key: string; detail: string | null }> = [];
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
    callPaytr:
      callPaytr ??
      (async ({ amountMinor }) => ({
        ok: true,
        returnAmount: formatPaytrReturnAmount(amountMinor),
      })),
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
      async findByIdempotencyKey(idempotencyKey) {
        return rows.find((row) => row.key === idempotencyKey) ?? null;
      },
      async insert(input) {
        const row = {
          id: `row-${rows.length + 1}`,
          merchantOid: input.merchantOid,
          amountMinor: input.amountMinor,
          status: input.status,
          key: input.idempotencyKey,
          detail: input.detail ?? null,
        };
        rows.push(row);
        return row;
      },
      async mark(id, status, detail) {
        const row = rows.find((item) => item.id === id);
        if (row) {
          row.status = status;
          row.detail = detail;
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
    rows: () => rows.map((row) => ({ ...row })),
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

  it("başarılı vatandaş iadesi detail alanına aktör ve net tutarı yazar", async () => {
    const actor = "22222222-2222-4222-8222-222222222222";
    const sim = memoryRefundPorts(2_500, [{ merchantOid: "card-25", amountMinor: 2_500 }]);
    const result = await refundUnusedWalletBalance(sim.ports, actor);
    expect(result.refundedMinor).toBe(2_500);
    const succeeded = sim.rows().find((row) => row.status === "SUCCEEDED");
    expect(JSON.parse(succeeded?.detail ?? "")).toEqual({
      refundedByActor: actor,
      refundedMinor: 2_500,
      note: "25.00",
    });
  });

  it("kart siparişi yoksa detail aktörü, sıfır net tutarı ve notu saklar", async () => {
    const sim = memoryRefundPorts(2_500, []);
    await refundUnusedWalletBalance(sim.ports, "citizen-25");
    const row = sim.rows()[0];
    expect(row?.status).toBe("REQUESTED");
    expect(JSON.parse(row?.detail ?? "")).toEqual({
      refundedByActor: "citizen-25",
      refundedMinor: 0,
      note: "card_order_missing",
    });
  });

  it("PayTR reddinde net tutar sıfır kalır ve aktör yazılır", async () => {
    const sim = memoryRefundPorts(
      2_500,
      [{ merchantOid: "card-25", amountMinor: 2_500 }],
      async () => ({ ok: false, reason: "pay_api_error", message: "fazla" }),
    );
    const result = await refundUnusedWalletBalance(sim.ports, "citizen-25");
    expect(result.refundedMinor).toBe(0);
    const failed = sim.rows().find((row) => row.status === "FAILED");
    expect(JSON.parse(failed?.detail ?? "")).toEqual({
      refundedByActor: "citizen-25",
      refundedMinor: 0,
      note: "fazla",
    });
  });
});

describe("vatandaş iade denetim uyarısı", () => {
  it("writeSuperAdminAudit false dönerse yapılandırılmış uyarı yazar", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnWhenSuperAdminRefundAuditMissed(false, {
      userId: "22222222-2222-4222-8222-222222222222",
      refundedMinor: 2_500,
    });
    await Promise.resolve();
    const line = spy.mock.calls
      .map((call) => String(call[0] ?? ""))
      .find((item) => item.includes(WALLET_REFUND_SUPER_ADMIN_AUDIT_SKIPPED));
    expect(line).toBeDefined();
    expect(JSON.parse(line ?? "{}")).toMatchObject({
      level: "warn",
      event: WALLET_REFUND_SUPER_ADMIN_AUDIT_SKIPPED,
      userId: "22222222-2222-4222-8222-222222222222",
      action: "manual_refund",
      amountMinor: 2_500,
      reason: "actor_not_super_admin",
    });

    warnWhenSuperAdminRefundAuditMissed(true, {
      userId: "22222222-2222-4222-8222-222222222222",
      refundedMinor: 2_500,
    });
    await Promise.resolve();
    const skips = spy.mock.calls.filter((call) =>
      String(call[0] ?? "").includes(WALLET_REFUND_SUPER_ADMIN_AUDIT_SKIPPED),
    );
    expect(skips).toHaveLength(1);
    spy.mockRestore();
  });

  it("cüzdan iade yolu false dönüşünü uyarıya bağlar", () => {
    const source = readFileSync("lib/kernel/payments/prisma-wallet-card-refund.ts", "utf8");
    expect(source).toContain("warnWhenSuperAdminRefundAuditMissed(written");
    expect(source).toContain('action: "manual_refund"');
    expect(source).toContain("super_admin_audit.append_failed");
  });

  it("detail JSON aktör ve net tutarı düz metin nota gömer", () => {
    expect(
      JSON.parse(citizenWalletRefundDetail({ refundedByActor: " citizen ", refundedMinor: 1500 }, " 25.00 ")),
    ).toEqual({
      refundedByActor: "citizen",
      refundedMinor: 1500,
      note: "25.00",
    });
    expect(JSON.parse(citizenWalletRefundDetail({ refundedByActor: "citizen", refundedMinor: 0 }))).toEqual({
      refundedByActor: "citizen",
      refundedMinor: 0,
    });
  });
});

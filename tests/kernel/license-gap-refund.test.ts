import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryLedgerStore } from "@/tests/helpers/memory-money";
import type { SuperAdminAuditInsert } from "@/lib/kernel/admin/audit-log";
import type { LicenseGap } from "@/lib/kernel/payments/license-gap";
import { refundLicenseGapExact } from "@/lib/kernel/payments/license-gap-refund";
import type { WalletCardRefundRow, WalletCardRefundStore } from "@/lib/kernel/payments/wallet-card-refund";

const ACTOR = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";

const gap: LicenseGap = {
  merchantOid: "oid-gap",
  orderId: "order-gap",
  userId: USER,
  purpose: "academy-license:01_office_ai",
  amountMinor: 1500,
  product: "academy",
  reason: "missing_purchase",
};

function memoryRefunds(balance: number): WalletCardRefundStore & { rows: WalletCardRefundRow[] } {
  const rows: WalletCardRefundRow[] = [];
  return {
    rows,
    async lockBalanceMinor() {
      return balance;
    },
    async listClearedOrders() {
      return [{ merchantOid: gap.merchantOid, amountMinor: gap.amountMinor }];
    },
    async sumReservedByOid() {
      return {};
    },
    async listOpen() {
      return rows.filter((row) => row.status === "PENDING" || row.status === "ACCEPTED");
    },
    async findByIdempotencyKey(key) {
      return rows.find((row) => row.id === key) ?? null;
    },
    async insert(input) {
      const row: WalletCardRefundRow = {
        id: input.idempotencyKey,
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
  };
}

describe("lisans sapması iadesi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sipariş tutarını karta yazar ve mühürler; serbest tutar yoktur", async () => {
    vi.stubEnv("SUPER_ADMIN_USER_ID", ACTOR);
    const refunds = memoryRefunds(1500);
    const audits: SuperAdminAuditInsert[] = [];
    const ledger = createMemoryLedgerStore([{ userId: USER, amountMinor: 1500 }]);
    const result = await refundLicenseGapExact(
      {
        refunds,
        ledger,
        paytrConfigured: true,
        reservedMinor: async () => 0,
        callPaytr: async (input) => {
          expect(input.amountMinor).toBe(1500);
          return { ok: true, returnAmount: "15.00" };
        },
        audit: {
          async create(row) {
            audits.push(row);
          },
        },
      },
      { actorUserId: ACTOR, gap, reason: "kurs açılmadı" },
    );
    expect(result).toEqual({ outcome: "refunded", reason: "exact_order" });
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      actorUserId: ACTOR,
      action: "manual_refund",
      target: "oid-gap",
    });
    expect(audits[0]?.detail).toContain("amountMinor=1500");
    expect(ledger.snapshot(USER).amountMinor).toBe(0);
  });

  it("bakiye siparişten azsa PayTR çağrılmaz", async () => {
    vi.stubEnv("SUPER_ADMIN_USER_ID", ACTOR);
    const refunds = memoryRefunds(100);
    let called = false;
    const result = await refundLicenseGapExact(
      {
        refunds,
        ledger: createMemoryLedgerStore([{ userId: USER, amountMinor: 100 }]),
        paytrConfigured: true,
        reservedMinor: async () => 0,
        callPaytr: async () => {
          called = true;
          return { ok: true, returnAmount: "1.00" };
        },
        audit: { async create() {} },
      },
      { actorUserId: ACTOR, gap, reason: "bakiye yetmedi" },
    );
    expect(called).toBe(false);
    expect(result.outcome).toBe("warned");
    expect(refunds.rows[0]?.status).toBe("REQUESTED");
    expect(refunds.rows[0]?.amountMinor).toBe(1500);
  });
});

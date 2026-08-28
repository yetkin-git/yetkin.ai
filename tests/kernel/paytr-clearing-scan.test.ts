import { describe, expect, it } from "vitest";
import {
  PAYTR_CLEARING_SCAN_NOOP_REASON,
  PAYTR_FAILED_RECOVERY_MS,
  paytrClearingScanNoOpResult,
  paytrClearingScanResult,
  paytrFailedRecoveryAfter,
  selectPaytrClearingCandidates,
  shouldNoOpPaytrClearingScan,
} from "@/lib/kernel/jobs/paytr-clearing-scan";

describe("PayTR valör tarama sınırları", () => {
  it("boş, null, yalnızca boşluk merchantOid için aday üretmez; dispatched 0", () => {
    const pending = selectPaytrClearingCandidates([
      { merchantOid: "" },
      { merchantOid: "   " },
      { merchantOid: null },
      { merchantOid: undefined },
      {},
    ]);
    expect(pending).toEqual([]);
    expect(paytrClearingScanResult(pending)).toEqual({ dispatched: 0 });
  });

  it("hatalı satırlar elenir, yalnız dolu oid dispatched sayılır", () => {
    const pending = selectPaytrClearingCandidates([
      { merchantOid: "" },
      { merchantOid: "  WALLET-1  " },
      { merchantOid: null },
      { merchantOid: "WALLET-2" },
    ]);
    expect(pending).toEqual([{ merchantOid: "WALLET-1" }, { merchantOid: "WALLET-2" }]);
    expect(paytrClearingScanResult(pending)).toEqual({ dispatched: 2 });
  });

  it("aday yokken sendEvent çağrılmaz sözleşmesi: dispatched 0", () => {
    expect(paytrClearingScanResult([])).toEqual({ dispatched: 0 });
  });

  it("FAILED recovery penceresi 7 gündür", () => {
    expect(PAYTR_FAILED_RECOVERY_MS).toBe(7 * 24 * 60 * 60 * 1000);
    const now = new Date("2026-08-19T12:00:00.000Z");
    expect(paytrFailedRecoveryAfter(now).getTime()).toBe(now.getTime() - PAYTR_FAILED_RECOVERY_MS);
  });

  it("PayTR port unconfigured iken no-op: DB tarama yok sözleşmesi", () => {
    expect(
      shouldNoOpPaytrClearingScan({
        PAYTR_MERCHANT_ID: undefined,
        PAYTR_MERCHANT_KEY: undefined,
        PAYTR_MERCHANT_SALT: undefined,
      }),
    ).toBe(true);
    expect(paytrClearingScanNoOpResult()).toEqual({
      dispatched: 0,
      noop: true,
      reason: PAYTR_CLEARING_SCAN_NOOP_REASON,
    });
    expect(PAYTR_CLEARING_SCAN_NOOP_REASON).toBe("payments_port_unconfigured");
  });

  it("PayTR merchant üçlüsü doluysa no-op açılmaz", () => {
    expect(
      shouldNoOpPaytrClearingScan({
        PAYTR_MERCHANT_ID: "x",
        PAYTR_MERCHANT_KEY: "y",
        PAYTR_MERCHANT_SALT: "z",
      }),
    ).toBe(false);
  });
});

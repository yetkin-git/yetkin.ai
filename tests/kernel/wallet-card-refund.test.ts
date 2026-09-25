import { describe, expect, it } from "vitest";
import { ConflictError } from "@/lib/kernel/http/errors";
import { assertAccountCloseable, anonymizedCitizenEmail } from "@/lib/kernel/identity/close-account-gate";
import {
  buildPaytrRefundToken,
  formatPaytrReturnAmount,
  interpretPaytrRefundPayload,
} from "@/lib/kernel/payments/paytr/refund";
import { allocateUnusedBalanceRefund } from "@/lib/kernel/payments/wallet-card-refund";

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

  it("anonim e-posta kimliği taşır", () => {
    expect(anonymizedCitizenEmail("abc")).toBe("closed.abc@anon.yetkin.invalid");
  });
});

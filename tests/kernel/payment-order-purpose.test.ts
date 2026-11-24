import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifyPaymentOrderPurpose,
  isActivatedProductRefundBlocked,
  isTezgahCreditOrderPurpose,
  isWalletTopUpPurpose,
  PAYMENT_ORDER_PURPOSE,
} from "@/lib/kernel/payments/order-purpose";
import { tezgahCreditsToRevoke } from "@/lib/kernel/payments/wallet-card-refund";
import { tezgahProDebitIdempotencyKey } from "@/lib/tezgah/paid-lane";

describe("ödeme siparişi amacı", () => {
  it("eski dizgiyi kanonik koda bağlar", () => {
    expect(classifyPaymentOrderPurpose("wallet-top-up")).toBe(PAYMENT_ORDER_PURPOSE.WALLET_TOPUP);
    expect(classifyPaymentOrderPurpose("tezgah-license:pro")).toBe(PAYMENT_ORDER_PURPOSE.TEZGAH_PRO);
    expect(classifyPaymentOrderPurpose("tezgah-credit:pack")).toBe(PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT);
    expect(classifyPaymentOrderPurpose("commerce-license:monthly")).toBe(PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE);
    expect(classifyPaymentOrderPurpose("WALLET_TOPUP")).toBe("WALLET_TOPUP");
    expect(classifyPaymentOrderPurpose("academy-license:ofis")).toBe(
      PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE,
    );
    expect(classifyPaymentOrderPurpose("junior-license:yearly")).toBe(
      PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE,
    );
  });

  it("yalnız aktif ürün bedelini self-servis iadeden keser", () => {
    expect(isWalletTopUpPurpose("wallet-top-up")).toBe(true);
    expect(isWalletTopUpPurpose("WALLET_TOPUP")).toBe(true);
    expect(isActivatedProductRefundBlocked("TEZGAH_PRO")).toBe(true);
    expect(isActivatedProductRefundBlocked("tezgah-license:pro")).toBe(true);
    expect(isActivatedProductRefundBlocked("COMMERCE_LICENSE")).toBe(true);
    expect(isActivatedProductRefundBlocked("commerce-license:monthly")).toBe(true);
    expect(isActivatedProductRefundBlocked("WALLET_TOPUP")).toBe(false);
    expect(isTezgahCreditOrderPurpose("tezgah-credit:pack")).toBe(true);
    expect(isTezgahCreditOrderPurpose("wallet-top-up")).toBe(false);
  });

  it("kredi iadesi kalan hakkı düşürür veya sıfırlar", () => {
    expect(tezgahCreditsToRevoke({ remaining: 10, unitMinor: 100, refundedMinor: 1000 })).toBe(10);
    expect(tezgahCreditsToRevoke({ remaining: 7, unitMinor: 100, refundedMinor: 300 })).toBe(3);
    expect(tezgahCreditsToRevoke({ remaining: 4, unitMinor: 0, refundedMinor: 50 })).toBe(4);
    expect(tezgahCreditsToRevoke({ remaining: 0, unitMinor: 100, refundedMinor: 100 })).toBe(0);
  });

  it("Pro aktivasyonu cüzdan DEBIT anahtarı taşır", () => {
    expect(tezgahProDebitIdempotencyKey("OID-1")).toBe("tezgah-license:OID-1");
    const source = readFileSync(join(process.cwd(), "lib/tezgah/paid-lane.ts"), "utf8");
    expect(source).toContain('direction: "DEBIT"');
    expect(source).toContain("TEZGAH_PRO_DEBIT_PURPOSE");
    expect(source).not.toContain("İkinci kez cüzdan DEBIT yazılmaz");
  });
});

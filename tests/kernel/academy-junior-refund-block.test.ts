import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LEDGER_CREDIT_PURPOSES, LEDGER_PRODUCT_CREDIT_PURPOSES } from "@/lib/kernel/ledger/credit-purposes";
import {
  ACADEMY_LICENSE_LEDGER_PURPOSE,
  JUNIOR_LICENSE_LEDGER_PURPOSE,
  classifyPaymentOrderPurpose,
  isActivatedProductRefundBlocked,
  isCardRefundBlockedForOrder,
  ledgerCreditLineForOrder,
  PAYMENT_ORDER_PURPOSE,
} from "@/lib/kernel/payments/order-purpose";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

/**
 * K-01 — Akademi/Junior lisans defter etiketi ve karta iade blokajı.
 *
 * Eksik sınıflama ürün gelirini "Cüzdan yükleme" yazar ve self-servis iadeyi açar:
 * lisans açık kalır, para karta döner.
 */
describe("K-01 — Akademi/Junior lisans defter etiketi ve iade blokajı", () => {
  it("academy-license:* ve junior-license:* kanonik koda bağlanır", () => {
    expect(classifyPaymentOrderPurpose("academy-license:01_office_ai")).toBe(
      PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE,
    );
    expect(classifyPaymentOrderPurpose("academy-license:ofis")).toBe(
      PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE,
    );
    expect(classifyPaymentOrderPurpose("junior-license:yearly")).toBe(
      PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE,
    );
    expect(classifyPaymentOrderPurpose("ACADEMY_LICENSE")).toBe(
      PAYMENT_ORDER_PURPOSE.ACADEMY_LICENSE,
    );
    expect(classifyPaymentOrderPurpose("JUNIOR_LICENSE")).toBe(
      PAYMENT_ORDER_PURPOSE.JUNIOR_LICENSE,
    );
  });

  it("defter satırı 'Cüzdan yükleme' değil; ürün etiketini taşır", () => {
    const academy = ledgerCreditLineForOrder({
      purpose: "academy-license:01_office_ai",
      merchantOid: "OID-ACADEMY",
    });
    expect(academy.purpose).toBe(ACADEMY_LICENSE_LEDGER_PURPOSE);
    expect(academy.label).toBe("Akademi lisansı");
    expect(academy.purpose).not.toBe("wallet-top-up");
    expect(academy.idempotencyKey).toBe("academy-license:OID-ACADEMY");

    const junior = ledgerCreditLineForOrder({
      purpose: "junior-license:yearly",
      merchantOid: "OID-JUNIOR",
    });
    expect(junior.purpose).toBe(JUNIOR_LICENSE_LEDGER_PURPOSE);
    expect(junior.label).toBe("Junior lisansı");
    expect(junior.purpose).not.toBe("wallet-top-up");
    expect(junior.idempotencyKey).toBe("junior-license:OID-JUNIOR");
  });

  it("ürün CREDIT izin listesinde; clearing patlamaz", () => {
    expect(LEDGER_PRODUCT_CREDIT_PURPOSES).toContain(ACADEMY_LICENSE_LEDGER_PURPOSE);
    expect(LEDGER_PRODUCT_CREDIT_PURPOSES).toContain(JUNIOR_LICENSE_LEDGER_PURPOSE);
    expect(LEDGER_CREDIT_PURPOSES).toContain(ACADEMY_LICENSE_LEDGER_PURPOSE);
    expect(LEDGER_CREDIT_PURPOSES).toContain(JUNIOR_LICENSE_LEDGER_PURPOSE);
  });

  it("satın alınan lisans self-servis karta iadeye kapalıdır", () => {
    for (const purpose of [
      "academy-license:01_office_ai",
      "academy-license:05_prompt_practice",
      "junior-license:yearly",
      "ACADEMY_LICENSE",
      "JUNIOR_LICENSE",
    ]) {
      expect(isActivatedProductRefundBlocked(purpose)).toBe(true);
      expect(isCardRefundBlockedForOrder({ purpose })).toBe(true);
    }
    expect(isCardRefundBlockedForOrder({ purpose: "wallet-top-up" })).toBe(false);
  });

  it("SQL iade kovası önekleri ve enum'u eler", () => {
    const sql = src("lib/kernel/payments/prisma-wallet-card-refund.ts");
    expect(sql).toContain("academy-license:%");
    expect(sql).toContain("junior-license:%");
    expect(sql).toContain("ACADEMY_LICENSE");
    expect(sql).toContain("JUNIOR_LICENSE");
    expect(sql).toContain("NOT LIKE 'academy-license:%'");
    expect(sql).toContain("NOT LIKE 'junior-license:%'");
  });

  it("Prisma enum + göç yeni niyetleri taşır", () => {
    const schema = src("prisma/schema/kernel.prisma");
    expect(schema).toContain("ACADEMY_LICENSE");
    expect(schema).toContain("JUNIOR_LICENSE");
    const migration = src(
      "prisma/migrations/20261124220000_academy_junior_payment_purpose/migration.sql",
    );
    expect(migration).toContain(`'ACADEMY_LICENSE'`);
    expect(migration).toContain(`'JUNIOR_LICENSE'`);
  });
});

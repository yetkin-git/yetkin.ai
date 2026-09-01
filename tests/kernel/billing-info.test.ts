import { describe, expect, it } from "vitest";
import {
  CHECKOUT_BILLING_COPY,
  CHECKOUT_BILLING_PAYLOAD,
  checkoutBillingInfoSchema,
  checkoutBillingIssueMessage,
  isCheckoutBillingIssue,
  normalizeBillingInput,
} from "@/lib/kernel/identity/billing-info";
import { isValidTckn, isValidVkn } from "@/lib/kernel/identity/tckn-vkn";
import { purchaseCourseInputSchema } from "@/lib/academy/schemas";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";

describe("TCKN / VKN sağlama", () => {
  it("geçerli TCKN ve VKN kabul eder; bozuk basamağı reddeder", () => {
    expect(isValidTckn("10000000078")).toBe(true);
    expect(isValidTckn("10000000079")).toBe(false);
    expect(isValidTckn("00000000000")).toBe(false);
    expect(isValidTckn("12345678901")).toBe(false);
    expect(isValidVkn("1234567808")).toBe(true);
    expect(isValidVkn("1234567809")).toBe(false);
    expect(isValidVkn("123456780")).toBe(false);
  });
});

describe("fatura künyesi doğrulama", () => {
  it("bireysel: ad soyad, cep ve adres zorunlu; TCKN boş veya 11 haneli", () => {
    expect(normalizeBillingInput(CHECKOUT_BILLING_PAYLOAD)).toEqual({
      ok: true,
      billing: CHECKOUT_BILLING_PAYLOAD,
    });
    expect(
      normalizeBillingInput({
        invoiceType: "individual",
        fullName: "Ayşe Kaya",
        tckn: "",
        companyTitle: "",
        taxOffice: "",
        vkn: "",
        phone: "05321234567",
        address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
      }),
    ).toMatchObject({
      ok: true,
      billing: { invoiceType: "individual", tckn: null, phone: "05321234567" },
    });
    expect(
      normalizeBillingInput({
        invoiceType: "individual",
        fullName: "",
        tckn: "",
        companyTitle: "",
        taxOffice: "",
        vkn: "",
        phone: "05321234567",
        address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
      }).ok,
    ).toBe(false);
    expect(
      normalizeBillingInput({
        ...CHECKOUT_BILLING_PAYLOAD,
        tckn: "123",
      }),
    ).toEqual({ ok: false, error: CHECKOUT_BILLING_COPY.tcknInvalid });
    expect(
      normalizeBillingInput({
        ...CHECKOUT_BILLING_PAYLOAD,
        phone: "05000000000",
      }).ok,
    ).toBe(false);
    expect(
      normalizeBillingInput({
        ...CHECKOUT_BILLING_PAYLOAD,
        phone: "+90 532 123 45 67",
      }),
    ).toMatchObject({ ok: true, billing: { phone: "05321234567" } });
  });

  it("kurumsal: unvan, vergi dairesi, VKN ve adres zorunlu", () => {
    const corporate = {
      invoiceType: "corporate" as const,
      fullName: "",
      tckn: "",
      companyTitle: "Yapınet Ltd. Şti.",
      taxOffice: "Akhisar",
      vkn: "1234567808",
      phone: "05321234567",
      address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
    };
    expect(normalizeBillingInput(corporate)).toEqual({
      ok: true,
      billing: {
        invoiceType: "corporate",
        companyTitle: "Yapınet Ltd. Şti.",
        taxOffice: "Akhisar",
        vkn: "1234567808",
        phone: "05321234567",
        address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
      },
    });
    expect(normalizeBillingInput({ ...corporate, vkn: "123" }).ok).toBe(false);
    expect(normalizeBillingInput({ ...corporate, companyTitle: "" }).ok).toBe(false);
    expect(checkoutBillingInfoSchema.safeParse(corporate).success).toBe(true);
    expect(checkoutBillingInfoSchema.safeParse({ invoiceType: "corporate" }).success).toBe(false);
    const missing = purchaseCourseInputSchema.safeParse({
      ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
      lockId: "lock-1",
    });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(isCheckoutBillingIssue(missing.error)).toBe(true);
    }
    const invalid = purchaseCourseInputSchema.safeParse({
      ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
      lockId: "lock-1",
      billing: { invoiceType: "corporate", companyTitle: "A", taxOffice: "B", vkn: "1", phone: "05321234567", address: "Adres satırı yeterince uzun" },
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(isCheckoutBillingIssue(invalid.error)).toBe(true);
      expect(checkoutBillingIssueMessage(invalid.error)).toBe(CHECKOUT_BILLING_COPY.vknInvalid);
    }
  });
});

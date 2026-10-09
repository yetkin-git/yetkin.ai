import { describe, expect, it } from "vitest";
import {
  JUNIOR_INVOICE_REDACTED,
  JUNIOR_INVOICE_SEAL_ENV,
  JUNIOR_INVOICE_SEAL_PREFIX,
  JUNIOR_INVOICE_WITHHELD,
  juniorInvoiceOpened,
  juniorInvoicePersisted,
  openJuniorInvoiceField,
  sealJuniorInvoiceField,
} from "@/lib/junior/invoice-seal";

const TCKN = "10000000146";
const PHONE = "5551112233";
const ADDRESS = "Ataturk Mahallesi Deneme Sokak No 1";

describe("Junior fatura mührü", () => {
  it("TCKN, telefon ve adresi düz metin olarak yazmaz", () => {
    const stored = juniorInvoicePersisted({
      invoiceTckn: TCKN,
      invoicePhone: PHONE,
      invoiceAddress: ADDRESS,
    });
    expect(stored.invoiceTckn.startsWith(JUNIOR_INVOICE_SEAL_PREFIX)).toBe(true);
    expect(stored.invoicePhone.startsWith(JUNIOR_INVOICE_SEAL_PREFIX)).toBe(true);
    expect(stored.invoiceAddress.startsWith(JUNIOR_INVOICE_SEAL_PREFIX)).toBe(true);
    expect(stored.invoiceTckn).not.toContain(TCKN);
    expect(stored.invoicePhone).not.toContain(PHONE);
    expect(stored.invoiceAddress).not.toContain(ADDRESS);
    expect(juniorInvoiceOpened(stored)).toEqual({
      invoiceTckn: TCKN,
      invoicePhone: PHONE,
      invoiceAddress: ADDRESS,
    });
  });

  it("telefon mührü TCKN alanına açılmaz", () => {
    const sealed = sealJuniorInvoiceField(PHONE, "phone");
    expect(openJuniorInvoiceField(sealed, "tckn")).toBe(JUNIOR_INVOICE_WITHHELD);
    expect(openJuniorInvoiceField(sealed, "phone")).toBe(PHONE);
  });

  it("eski düz satır kimliği geri vermez", () => {
    expect(openJuniorInvoiceField(TCKN, "tckn")).toBe(JUNIOR_INVOICE_WITHHELD);
    expect(openJuniorInvoiceField(JUNIOR_INVOICE_REDACTED, "tckn")).toBe(JUNIOR_INVOICE_WITHHELD);
  });

  it("üretimde anahtar yoksa düz metin yazmaz", () => {
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production" };
    delete env[JUNIOR_INVOICE_SEAL_ENV];
    expect(() => sealJuniorInvoiceField(TCKN, "tckn", env)).toThrow(/JUNIOR_INVOICE_SEAL_KEY/);
  });
});

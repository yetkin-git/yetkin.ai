import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** Kolon öneki. Düz TCKN, telefon ve adres bu önek olmadan yazılmaz. */
export const JUNIOR_INVOICE_SEAL_PREFIX = "jinv1:" as const;

/** Eski düz satırın mezarı. Açılınca kimlik dönmez. */
export const JUNIOR_INVOICE_REDACTED = "jinv1:redacted" as const;

/** Siparişte fatura alanı yoksa satıra yazılan yer tutucu. Kimlik numarası değildir. */
export const JUNIOR_INVOICE_WITHHELD = "withheld" as const;

export const JUNIOR_INVOICE_SEAL_ENV = "JUNIOR_INVOICE_SEAL_KEY" as const;

export type JuniorInvoiceField = "tckn" | "phone" | "address";

function sealKey(env: NodeJS.ProcessEnv): Buffer {
  const raw = env[JUNIOR_INVOICE_SEAL_ENV]?.trim() ?? "";
  if (raw) {
    const key = Buffer.from(raw, "base64");
    if (key.length !== 32) {
      throw new Error("JUNIOR_INVOICE_SEAL_KEY 32 bayt base64 olmalıdır.");
    }
    return key;
  }
  if (env.NODE_ENV === "production") {
    throw new Error("JUNIOR_INVOICE_SEAL_KEY yok. Fatura alanı düz yazılmaz.");
  }
  return createHash("sha256").update("junior-invoice-seal-dev").digest();
}

export function sealJuniorInvoiceField(
  plain: string,
  field: JuniorInvoiceField,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (plain.startsWith(JUNIOR_INVOICE_SEAL_PREFIX)) {
    return plain;
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sealKey(env), iv);
  cipher.setAAD(Buffer.from(field, "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JUNIOR_INVOICE_SEAL_PREFIX + Buffer.concat([iv, tag, body]).toString("base64url");
}

export function openJuniorInvoiceField(
  stored: string,
  field: JuniorInvoiceField,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!stored.startsWith(JUNIOR_INVOICE_SEAL_PREFIX) || stored === JUNIOR_INVOICE_REDACTED) {
    return JUNIOR_INVOICE_WITHHELD;
  }
  const packed = Buffer.from(stored.slice(JUNIOR_INVOICE_SEAL_PREFIX.length), "base64url");
  if (packed.length < 29) {
    return JUNIOR_INVOICE_WITHHELD;
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", sealKey(env), packed.subarray(0, 12));
    decipher.setAAD(Buffer.from(field, "utf8"));
    decipher.setAuthTag(packed.subarray(12, 28));
    return Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return JUNIOR_INVOICE_WITHHELD;
  }
}

export function juniorInvoicePersisted(plain: {
  invoiceTckn: string;
  invoicePhone: string;
  invoiceAddress: string;
}): { invoiceTckn: string; invoicePhone: string; invoiceAddress: string } {
  return {
    invoiceTckn: sealJuniorInvoiceField(plain.invoiceTckn, "tckn"),
    invoicePhone: sealJuniorInvoiceField(plain.invoicePhone, "phone"),
    invoiceAddress: sealJuniorInvoiceField(plain.invoiceAddress, "address"),
  };
}

export function juniorInvoiceOpened(stored: {
  invoiceTckn: string;
  invoicePhone: string;
  invoiceAddress: string;
}): { invoiceTckn: string; invoicePhone: string; invoiceAddress: string } {
  return {
    invoiceTckn: openJuniorInvoiceField(stored.invoiceTckn, "tckn"),
    invoicePhone: openJuniorInvoiceField(stored.invoicePhone, "phone"),
    invoiceAddress: openJuniorInvoiceField(stored.invoiceAddress, "address"),
  };
}

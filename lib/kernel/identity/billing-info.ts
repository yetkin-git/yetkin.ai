import { z } from "zod";
import { digitsOnly, isValidTckn, isValidVkn } from "@/lib/kernel/identity/tckn-vkn";

export const CHECKOUT_BILLING_REQUIRED =
  "Fatura bilgileri zorunludur. Bireysel veya kurumsal künyeyi eksiksiz doldur.";

export const CHECKOUT_BILLING_COPY = {
  legend: "Fatura Tipi",
  individual: "Bireysel",
  corporate: "Kurumsal",
  fullName: "Ad Soyad",
  tckn: "TCKN (isteğe bağlı)",
  tcknHint: "11 hane. Boş bırakılabilir.",
  phone: "Cep telefonu",
  phoneHint: "05XX XXX XX XX. Ödeme kuruluşu tahsilatı için zorunludur.",
  address: "Açık Adres",
  companyTitle: "Şirket Unvanı",
  taxOffice: "Vergi Dairesi",
  vkn: "VKN",
  vknHint: "10 haneli vergi kimlik numarası.",
  savedHint: "Kayıtlı fatura bilgilerin yüklendi. Değiştirirsen sonraki ödemelerde de bunlar kullanılır.",
  fullNameRequired: "Ad soyad zorunludur.",
  addressRequired: "Açık adres zorunludur.",
  companyTitleRequired: "Şirket unvanı zorunludur.",
  taxOfficeRequired: "Vergi dairesi zorunludur.",
  tcknInvalid: "TCKN 11 hane ve geçerli olmalıdır.",
  vknInvalid: "VKN 10 hane ve geçerli olmalıdır.",
  phoneRequired: "Geçerli bir cep telefonu zorunludur.",
  phoneInvalid: "Cep telefonu 05 ile başlayan 11 hane olmalıdır.",
} as const;

/** PayTR get-token sahte varsayılanı — kabul edilmez. */
export const PAYTR_DUMMY_USER_PHONE = "05000000000" as const;

export type CheckoutInvoiceType = "individual" | "corporate";

export type IndividualBillingInfo = {
  invoiceType: "individual";
  fullName: string;
  tckn: string | null;
  phone: string;
  address: string;
};

export type CorporateBillingInfo = {
  invoiceType: "corporate";
  companyTitle: string;
  taxOffice: string;
  vkn: string;
  phone: string;
  address: string;
};

export type CheckoutBillingInfo = IndividualBillingInfo | CorporateBillingInfo;

export type CheckoutBillingFormState = {
  invoiceType: CheckoutInvoiceType;
  fullName: string;
  tckn: string;
  companyTitle: string;
  taxOffice: string;
  vkn: string;
  phone: string;
  address: string;
};

export const EMPTY_CHECKOUT_BILLING_FORM: CheckoutBillingFormState = {
  invoiceType: "individual",
  fullName: "",
  tckn: "",
  companyTitle: "",
  taxOffice: "",
  vkn: "",
  phone: "",
  address: "",
};

/** Ops / e2e — geçerli bireysel künye. */
export const CHECKOUT_BILLING_PAYLOAD: IndividualBillingInfo = {
  invoiceType: "individual",
  fullName: "Ayşe Kaya",
  tckn: "10000000078",
  phone: "05321234567",
  address: "İnönü Mah. 157 Sk. No:3/C Akhisar",
};

const BILLING_NAME_MAX = 120;
const BILLING_TITLE_MAX = 200;
const BILLING_OFFICE_MAX = 120;
const BILLING_ADDRESS_MIN = 8;
const BILLING_ADDRESS_MAX = 500;
const BILLING_PHONE_DUMMY = new Set<string>([
  PAYTR_DUMMY_USER_PHONE,
  "00000000000",
  "01111111111",
]);

const billingInputSchema = z.object({
  invoiceType: z.enum(["individual", "corporate"]),
  fullName: z.string().optional(),
  tckn: z.string().nullable().optional(),
  companyTitle: z.string().optional(),
  taxOffice: z.string().optional(),
  vkn: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

/**
 * TR cep: 05XXXXXXXXX. +90 / baştaki 0 yokluğu normalize edilir.
 * PayTR sahte varsayılanı ve tek haneli tekrar reddedilir.
 */
export function normalizeTrMobilePhone(raw: string | null | undefined): string | null {
  const digits = digitsOnly(raw);
  if (!digits) {
    return null;
  }
  let national = digits;
  if (national.startsWith("90") && national.length === 12) {
    national = national.slice(2);
  }
  if (national.length === 10 && national.startsWith("5")) {
    national = `0${national}`;
  }
  if (!/^05[0-9]{9}$/.test(national)) {
    return null;
  }
  if (BILLING_PHONE_DUMMY.has(national) || /^05(\d)\1{8}$/.test(national)) {
    return null;
  }
  return national;
}

export function normalizeBillingInput(
  raw: CheckoutBillingFormState | z.infer<typeof billingInputSchema>,
): { ok: true; billing: CheckoutBillingInfo } | { ok: false; error: string } {
  const address = raw.address?.trim() ?? "";
  if (address.length < BILLING_ADDRESS_MIN || address.length > BILLING_ADDRESS_MAX) {
    return { ok: false, error: CHECKOUT_BILLING_COPY.addressRequired };
  }

  const phone = normalizeTrMobilePhone(raw.phone);
  if (!phone) {
    return { ok: false, error: CHECKOUT_BILLING_COPY.phoneInvalid };
  }

  if (raw.invoiceType === "individual") {
    const fullName = raw.fullName?.trim() ?? "";
    if (!fullName || fullName.length > BILLING_NAME_MAX) {
      return { ok: false, error: CHECKOUT_BILLING_COPY.fullNameRequired };
    }
    const tckn = digitsOnly(raw.tckn);
    if (tckn && !isValidTckn(tckn)) {
      return { ok: false, error: CHECKOUT_BILLING_COPY.tcknInvalid };
    }
    return {
      ok: true,
      billing: {
        invoiceType: "individual",
        fullName,
        tckn: tckn.length === 11 ? tckn : null,
        phone,
        address,
      },
    };
  }

  const companyTitle = raw.companyTitle?.trim() ?? "";
  const taxOffice = raw.taxOffice?.trim() ?? "";
  const vkn = digitsOnly(raw.vkn);
  if (!companyTitle || companyTitle.length > BILLING_TITLE_MAX) {
    return { ok: false, error: CHECKOUT_BILLING_COPY.companyTitleRequired };
  }
  if (!taxOffice || taxOffice.length > BILLING_OFFICE_MAX) {
    return { ok: false, error: CHECKOUT_BILLING_COPY.taxOfficeRequired };
  }
  if (!isValidVkn(vkn)) {
    return { ok: false, error: CHECKOUT_BILLING_COPY.vknInvalid };
  }
  return {
    ok: true,
    billing: {
      invoiceType: "corporate",
      companyTitle,
      taxOffice,
      vkn,
      phone,
      address,
    },
  };
}

export const checkoutBillingInfoSchema = billingInputSchema.transform((data, ctx) => {
  const result = normalizeBillingInput(data);
  if (!result.ok) {
    ctx.addIssue({ code: "custom", message: result.error });
    return z.NEVER;
  }
  return result.billing;
});

export function isCheckoutBillingIssue(error: z.ZodError): boolean {
  return error.issues.some((issue) => issue.path[0] === "billing");
}

export function checkoutBillingIssueMessage(error: z.ZodError): string {
  const issue = error.issues.find((row) => row.path[0] === "billing");
  const message = issue?.message?.trim();
  return message && message.length > 0 ? message : CHECKOUT_BILLING_REQUIRED;
}

export function billingToForm(billing: CheckoutBillingInfo): CheckoutBillingFormState {
  if (billing.invoiceType === "individual") {
    return {
      ...EMPTY_CHECKOUT_BILLING_FORM,
      invoiceType: "individual",
      fullName: billing.fullName,
      tckn: billing.tckn ?? "",
      phone: billing.phone,
      address: billing.address,
    };
  }
  return {
    ...EMPTY_CHECKOUT_BILLING_FORM,
    invoiceType: "corporate",
    companyTitle: billing.companyTitle,
    taxOffice: billing.taxOffice,
    vkn: billing.vkn,
    phone: billing.phone,
    address: billing.address,
  };
}

export function parseBillingFromUnknown(value: unknown): CheckoutBillingInfo | null {
  const parsed = checkoutBillingInfoSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function paytrUserFromBilling(billing: CheckoutBillingInfo): {
  userName: string;
  userAddress: string;
  userPhone: string;
} {
  if (billing.invoiceType === "individual") {
    return { userName: billing.fullName, userAddress: billing.address, userPhone: billing.phone };
  }
  return { userName: billing.companyTitle, userAddress: billing.address, userPhone: billing.phone };
}

export function isPaytrCheckoutUserComplete(input: {
  userName?: string;
  userAddress?: string;
  userPhone?: string;
}): boolean {
  const name = input.userName?.trim() ?? "";
  const address = input.userAddress?.trim() ?? "";
  const phone = normalizeTrMobilePhone(input.userPhone);
  return name.length > 0 && address.length >= BILLING_ADDRESS_MIN && phone !== null;
}

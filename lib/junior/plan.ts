import { z } from "zod";
import { CHECKOUT_LEGAL_CONSENT_REQUIRED, CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_ELECTIVE_SLUGS,
  JUNIOR_PLAN_CODE,
  JUNIOR_QUOTA_FULL_LABEL,
  JUNIOR_YEARLY_LIST_PRICE_LABEL,
  JUNIOR_YEARLY_LIST_PRICE_MINOR,
} from "@/lib/junior/limits";

export {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_PLAN_CODE,
  JUNIOR_QUOTA_FULL_LABEL,
  JUNIOR_YEARLY_LIST_PRICE_LABEL,
  JUNIOR_YEARLY_LIST_PRICE_MINOR,
};

/**
 * PayTR Direct deneme kartları. Gerçek tahsilat yoktur. Mağaza anahtarı gerekmez.
 * Visa, Mastercard ve Troy örnekleri PayTR test kartı listesindendir.
 */
export const JUNIOR_POS_SUCCESS_PANS = [
  "4355084355084358",
  "5406675406675403",
  "9792030394440796",
] as const;

export const JUNIOR_POS_PROVIDER = "paytr-test" as const;

export const JUNIOR_POS_TEST_HINT =
  "PayTR deneme kartı 4355 0843 5508 4358. Son kullanma 12/30. Güvenlik kodu 000. Bu kasa gerçek para çekmez.";

export type JuniorElectiveCardState = "chosen" | "open" | "full";

export type JuniorSubscriptionRow = {
  id: string;
  userId: string;
  status: "PENDING" | "ACTIVE";
  planCode: string;
  listPriceMinor: number;
  currencyCode: "TRY";
  provider: typeof JUNIOR_POS_PROVIDER;
  providerRef: string;
  cardLast4: string;
  invoiceName: string;
  invoiceTckn: string;
  invoicePhone: string;
  invoiceAddress: string;
  electiveQuota: number;
  gradeSwitchRights: number;
  activatedAt: Date | null;
  expiresAt: Date | null;
};

const NAME_RE = /^[\p{L}][\p{L}\s'.-]{2,79}$/u;

export const juniorElectiveSaveSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
    slugs: z.array(z.string().trim().min(1).max(40)).max(JUNIOR_ELECTIVE_QUOTA),
  })
  .strict();

export const juniorCheckoutSchema = z
  .object({
    fullName: z.string().trim().min(3).max(80),
    tckn: z.string().trim(),
    phone: z.string().trim().min(10).max(20),
    address: z.string().trim().min(10).max(240),
    pan: z.string().trim().min(12).max(23),
    expireMonth: z.string().trim().min(1).max(2),
    expireYear: z.string().trim().min(2).max(4),
    cvc: z.string().trim().min(3).max(4),
    holder: z.string().trim().min(2).max(80),
    distanceContractAccepted: z.literal(true),
    digitalImmediatePerformanceAccepted: z.literal(true),
    consentVersion: z.literal(CHECKOUT_LEGAL_CONSENT_VERSION),
  })
  .strict();

export type JuniorCheckoutInput = z.infer<typeof juniorCheckoutSchema>;

export function normalizeElectiveSelection(
  slugs: readonly string[],
): { ok: true; slugs: string[] } | { ok: false; error: string } {
  if (slugs.length > JUNIOR_ELECTIVE_QUOTA) {
    return { ok: false, error: "En fazla üç seçmeli ders seçilir." };
  }
  const unique: string[] = [];
  for (const slug of slugs) {
    if (unique.includes(slug)) {
      return { ok: false, error: "Aynı dersi iki kez seçemezsin." };
    }
    if (!(JUNIOR_ELECTIVE_SLUGS as readonly string[]).includes(slug)) {
      return { ok: false, error: "Bu ders seçmeli katalogda yok." };
    }
    unique.push(slug);
  }
  return { ok: true, slugs: unique };
}

export function juniorElectiveCardState(
  slug: string,
  chosen: readonly string[],
): JuniorElectiveCardState {
  if (chosen.includes(slug)) {
    return "chosen";
  }
  if (chosen.length >= JUNIOR_ELECTIVE_QUOTA) {
    return "full";
  }
  return "open";
}

export function juniorElectiveCardLabel(state: JuniorElectiveCardState): string {
  if (state === "chosen") {
    return "Çıkar";
  }
  if (state === "full") {
    return JUNIOR_QUOTA_FULL_LABEL;
  }
  return "Pakete ekle";
}

export function isTurkishIdentityNumber(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) {
    return false;
  }
  const digits = value.split("").map((char) => Number(char));
  const odd = digits[0]! + digits[2]! + digits[4]! + digits[6]! + digits[8]!;
  const even = digits[1]! + digits[3]! + digits[5]! + digits[7]!;
  const digit10 = (((odd * 7 - even) % 10) + 10) % 10;
  const digit11 = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
  return digits[9] === digit10 && digits[10] === digit11;
}

export function normalizeJuniorPhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  if (!/^\d{10}$/.test(digits)) {
    return null;
  }
  return digits;
}

export function juniorPlanExpiry(from: Date): Date {
  const next = new Date(from.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

export function isJuniorPlanActive(
  row: { status: string; expiresAt: Date | null } | null,
  now: Date,
): boolean {
  return Boolean(row && row.status === "ACTIVE" && row.expiresAt && row.expiresAt.getTime() > now.getTime());
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Deneme kartı doğrulayıcısı. Üretim kasası bunu çağırmaz.
 * `NODE_ENV=production` iken her zaman `not_configured` döner.
 */
export function chargeJuniorTestPos(input: {
  pan: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  holder: string;
  now?: Date;
}): { ok: true; last4: string } | { ok: false; error: string } {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "not_configured" };
  }
  const pan = onlyDigits(input.pan);
  const month = Number(input.expireMonth);
  const yearDigits = onlyDigits(input.expireYear);
  const year = yearDigits.length === 2 ? 2000 + Number(yearDigits) : Number(yearDigits);
  const cvc = onlyDigits(input.cvc);
  const holder = input.holder.trim();
  const now = input.now ?? new Date();
  if (!/^\d{16}$/.test(pan)) {
    return { ok: false, error: "Kart numarası 16 hane olsun." };
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, error: "Son kullanma ayı geçersiz." };
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2099) {
    return { ok: false, error: "Son kullanma yılı geçersiz." };
  }
  const expiry = new Date(Date.UTC(year, month, 1));
  if (expiry.getTime() <= now.getTime()) {
    return { ok: false, error: "Kartın son kullanma tarihi geçmiş." };
  }
  if (!/^\d{3}$/.test(cvc)) {
    return { ok: false, error: "Güvenlik kodu üç hane olsun." };
  }
  if (holder.length < 2) {
    return { ok: false, error: "Kart üzerindeki ad eksik." };
  }
  if (!(JUNIOR_POS_SUCCESS_PANS as readonly string[]).includes(pan)) {
    return { ok: false, error: "Bu deneme kartı onaylanmadı. PayTR test kartını kullan." };
  }
  return { ok: true, last4: pan.slice(-4) };
}

export function juniorCheckoutFieldError(input: unknown): string {
  if (!input || typeof input !== "object") {
    return "Ödeme bilgisi eksik.";
  }
  const body = input as Record<string, unknown>;
  if (
    body.distanceContractAccepted !== true ||
    body.digitalImmediatePerformanceAccepted !== true ||
    body.consentVersion !== CHECKOUT_LEGAL_CONSENT_VERSION
  ) {
    return CHECKOUT_LEGAL_CONSENT_REQUIRED;
  }
  const parsed = juniorCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    const key = parsed.error.issues[0]?.path[0];
    if (key === "fullName") {
      return "Fatura adı en az üç harf olsun.";
    }
    if (key === "address") {
      return "Adres en az on karakter olsun.";
    }
    if (key === "phone") {
      return "Telefon numarası eksik.";
    }
    if (key === "pan" || key === "expireMonth" || key === "expireYear" || key === "cvc" || key === "holder") {
      return "Kart bilgisi eksik.";
    }
    return "Ödeme bilgisi eksik.";
  }
  if (!NAME_RE.test(parsed.data.fullName) || !NAME_RE.test(parsed.data.holder)) {
    return "Fatura adı ve kart üzerindeki ad harflerden kurulsun.";
  }
  if (!isTurkishIdentityNumber(parsed.data.tckn)) {
    return "Kimlik numarası geçersiz.";
  }
  if (!normalizeJuniorPhone(parsed.data.phone)) {
    return "Telefon numarası on hane olsun.";
  }
  return "";
}

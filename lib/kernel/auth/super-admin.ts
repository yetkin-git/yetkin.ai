import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { ForbiddenError } from "@/lib/kernel/http/errors";

export const SUPER_ADMIN_FORBIDDEN = "Bu sığınak Super Admin kilidine bağlıdır.";

/**
 * Geliştirmede env boşsa kanonik Super Admin.
 * Üretimde env boşsa bu varsayılan açılmaz (fail-closed).
 */
export const CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT = "yapinet360@gmail.com";

/**
 * Sade vatandaş / müşteri test hesabı.
 * Bu adres Super Admin olamaz; env'e yazılsa da vize açılmaz.
 */
export const CITIZEN_TEST_ACCOUNT_EMAIL = "yetkin.vision@gmail.com";

export type SuperAdminActor = {
  id: string;
  email?: string | null;
  /** Supabase `email_confirmed_at`. Boşsa admin yoktur. */
  emailConfirmedAt?: string | null;
};

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isCitizenTestAccountEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return normalizeAccountEmail(email) === CITIZEN_TEST_ACCOUNT_EMAIL;
}

export function isConfirmedAccountEmail(emailConfirmedAt: string | null | undefined): boolean {
  return typeof emailConfirmedAt === "string" && emailConfirmedAt.trim().length > 0;
}

/** Kanonik Super Admin e-postası. Üretimde env boşsa boş döner. */
export function resolveCanonicalSuperAdminEmail(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.CANONICAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const production = env.NODE_ENV === "production";
  if (production) {
    if (!fromEnv || fromEnv === CITIZEN_TEST_ACCOUNT_EMAIL) {
      return "";
    }
    return fromEnv;
  }
  if (!fromEnv || fromEnv === CITIZEN_TEST_ACCOUNT_EMAIL) {
    return CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT;
  }
  return fromEnv;
}

export function isCanonicalSuperAdminEmail(email: string | null | undefined): boolean {
  const canonical = resolveCanonicalSuperAdminEmail();
  if (!canonical || !email) {
    return false;
  }
  return normalizeAccountEmail(email) === canonical;
}

export function isSuperAdminUser(userId: string): boolean {
  const fromEnv = process.env.SUPER_ADMIN_USER_ID?.trim();
  return Boolean(fromEnv && fromEnv === userId);
}

function productionAdminEnvReady(): boolean {
  const email = process.env.CANONICAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const userId = process.env.SUPER_ADMIN_USER_ID?.trim() ?? "";
  return Boolean(email && userId && email !== CITIZEN_TEST_ACCOUNT_EMAIL);
}

function isBuiltInCanonicalMailbox(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return normalizeAccountEmail(email) === CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT;
}

/**
 * Üretim kurtarma kapısı (T-03, fail-closed).
 * Doğrulanmamış kutu açılmaz.
 * Üretimde `SUPER_ADMIN_USER_ID` boşsa hiçbir kutu admin olmaz; yerleşik kutu dahil.
 * Doluysa yerleşik kutu yalnız o UUID ile birebir eşleşince açılır. Başka bir kişiye yazılmış env bu kutuyu açmaz.
 * Geliştirmede doğrulanmış yerleşik kutu UUID beklemez.
 */
function builtInRecoveryOpen(actor: SuperAdminActor): boolean {
  if (!isBuiltInCanonicalMailbox(actor.email) || !isConfirmedAccountEmail(actor.emailConfirmedAt)) {
    return false;
  }
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  const userId = process.env.SUPER_ADMIN_USER_ID?.trim() ?? "";
  if (!userId) {
    return false;
  }
  return userId === actor.id;
}

/**
 * Super Admin SSOT.
 * E-posta doğrulanmamışsa admin yoktur.
 * Üretimde `SUPER_ADMIN_USER_ID` zorunludur; boşsa hiçbir hesap admin olmaz (T-03).
 * Yerleşik kutu (`yapinet360@gmail.com`) üretimde yalnız doğrulanmış e-posta ve bu UUID eşleşmesiyle açılır.
 * Başka bir adres üretimde UUID ve kanonik e-posta env’inin birlikte eşleşmesini ister.
 * Geliştirmede doğrulanmış kanonik e-posta veya UUID yeter.
 */
export function isSuperAdminActor(actor: SuperAdminActor): boolean {
  if (builtInRecoveryOpen(actor)) {
    return true;
  }
  if (process.env.NODE_ENV === "production" && isBuiltInCanonicalMailbox(actor.email)) {
    return false;
  }
  if (!isConfirmedAccountEmail(actor.emailConfirmedAt)) {
    return false;
  }
  if (isCitizenTestAccountEmail(actor.email)) {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    if (!productionAdminEnvReady()) {
      return false;
    }
    return isCanonicalSuperAdminEmail(actor.email) && isSuperAdminUser(actor.id);
  }
  if (isCanonicalSuperAdminEmail(actor.email)) {
    return true;
  }
  return isSuperAdminUser(actor.id);
}

export function assertSuperAdminActor(actor: SuperAdminActor): void {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    throw new ForbiddenError(SUPER_ADMIN_FORBIDDEN);
  }
}

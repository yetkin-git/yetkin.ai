import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { ForbiddenError } from "@/lib/kernel/http/errors";

export const SUPER_ADMIN_FORBIDDEN = "Bu sığınak Super Admin kilidine bağlıdır.";

/** Env boşsa kanonik Super Admin. Git'te duran varsayılan; üretim bunu tanır. */
export const CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT = "yapinet360@gmail.com";

/**
 * Sade vatandaş / müşteri test hesabı.
 * Bu adres Super Admin olamaz; env'e yazılsa da vize açılmaz.
 */
export const CITIZEN_TEST_ACCOUNT_EMAIL = "yetkin.vision@gmail.com";

export type SuperAdminActor = {
  id: string;
  email?: string | null;
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

/** Kanonik Super Admin e-postası. Env boşsa varsayılan. Vatandaş test adresi reddedilir. */
export function resolveCanonicalSuperAdminEmail(): string {
  const fromEnv = process.env.CANONICAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
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

/** Super Admin SSOT — UUID veya kanonik e-posta. Vatandaş test hesabı hiçbir kolonda admin değildir. */
export function isSuperAdminActor(actor: SuperAdminActor): boolean {
  if (isCitizenTestAccountEmail(actor.email)) {
    return false;
  }
  if (isCanonicalSuperAdminEmail(actor.email)) {
    return true;
  }
  return isSuperAdminUser(actor.id);
}

export function assertSuperAdminUserId(userId: string): void {
  if (!isSupabaseUserId(userId) || !isSuperAdminUser(userId)) {
    throw new ForbiddenError(SUPER_ADMIN_FORBIDDEN);
  }
}

export function assertSuperAdminActor(actor: SuperAdminActor): void {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    throw new ForbiddenError(SUPER_ADMIN_FORBIDDEN);
  }
}

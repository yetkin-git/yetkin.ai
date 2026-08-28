import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { ForbiddenError } from "@/lib/kernel/http/errors";

export const SUPER_ADMIN_FORBIDDEN = "Bu sığınak Super Admin kilidine bağlıdır.";

export type SuperAdminActor = {
  id: string;
  email?: string | null;
};

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Kanonik Super Admin e-postası — yalnız env. Boşsa e-posta ile kimse admin değildir. */
export function resolveCanonicalSuperAdminEmail(): string {
  return process.env.CANONICAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
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

export function isSuperAdminActor(actor: SuperAdminActor): boolean {
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

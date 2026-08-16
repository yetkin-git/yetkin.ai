import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { ForbiddenError } from "@/lib/kernel/http/errors";

export const SUPER_ADMIN_FORBIDDEN = "Bu sığınak Super Admin kilidine bağlıdır.";

export function isSuperAdminUser(userId: string): boolean {
  const fromEnv = process.env.SUPER_ADMIN_USER_ID?.trim();
  return Boolean(fromEnv && fromEnv === userId);
}

export function assertSuperAdminUserId(userId: string): void {
  if (!isSupabaseUserId(userId) || !isSuperAdminUser(userId)) {
    throw new ForbiddenError(SUPER_ADMIN_FORBIDDEN);
  }
}

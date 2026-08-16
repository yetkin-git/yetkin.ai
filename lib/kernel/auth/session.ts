export { isSupabaseUserId, type CitizenAuth, type SessionUser } from "@/lib/kernel/auth/ids";
export {
  AuthRequiredError,
  getCitizenAuth,
  getSession,
  isSupabaseConfigured,
  requireCitizenAuth,
  requireSession,
} from "@/lib/kernel/auth/require-session";
export { requirePageSession } from "@/lib/kernel/auth/require-page-session";
export {
  requireSuperAdmin,
  resolveSuperAdminAccess,
  type SuperAdminAccess,
} from "@/lib/kernel/auth/require-super-admin";
export {
  SUPER_ADMIN_FORBIDDEN,
  assertSuperAdminUserId,
  isSuperAdminUser,
} from "@/lib/kernel/auth/super-admin";

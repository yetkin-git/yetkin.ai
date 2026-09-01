export { isSupabaseUserId, type CitizenAuth, type SessionUser } from "@/lib/kernel/auth/ids";
export {
  AuthRequiredError,
  getCitizenAuth,
  getSession,
  isSupabaseConfigured,
  requireCitizenAuth,
  requireSession,
  SESSION_USER_NOT_IN_DATABASE,
  sessionUserNotInDatabaseMessage,
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
  assertSuperAdminActor,
  isCanonicalSuperAdminEmail,
  isSuperAdminActor,
  isSuperAdminUser,
  resolveCanonicalSuperAdminEmail,
} from "@/lib/kernel/auth/super-admin";

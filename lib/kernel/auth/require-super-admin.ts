import { isSupabaseUserId, type SessionUser } from "@/lib/kernel/auth/ids";
import { getSession, requireSession } from "@/lib/kernel/auth/require-session";
import { assertSuperAdminUserId, isSuperAdminUser } from "@/lib/kernel/auth/super-admin";

export type SuperAdminAccess =
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "ok"; user: SessionUser };

/**
 * Super Admin tek kapı: oturum (getUser) + SUPER_ADMIN_USER_ID eşitliği.
 * Boş env kimseyi admin yapmaz. Kenar `auth = "admin"` aynı UUID'yi okur.
 */
export async function requireSuperAdmin(request?: Request): Promise<SessionUser> {
  const session = await requireSession(request);
  assertSuperAdminUserId(session.id);
  return session;
}

export async function resolveSuperAdminAccess(request?: Request): Promise<SuperAdminAccess> {
  const session = await getSession(request);
  if (!session) {
    return { kind: "unauthenticated" };
  }
  if (!isSupabaseUserId(session.id) || !isSuperAdminUser(session.id)) {
    return { kind: "forbidden" };
  }
  return { kind: "ok", user: session };
}

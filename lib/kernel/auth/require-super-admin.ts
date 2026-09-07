import { isSupabaseUserId, type SessionUser } from "@/lib/kernel/auth/ids";
import { getSession, requireSession } from "@/lib/kernel/auth/require-session";
import { assertSuperAdminActor, isSuperAdminActor } from "@/lib/kernel/auth/super-admin";

export type SuperAdminAccess =
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "ok"; user: SessionUser };

/**
 * Super Admin tek kapı: oturum (getUser) + `isSuperAdminActor`
 * (SUPER_ADMIN_USER_ID veya CANONICAL_SUPER_ADMIN_EMAIL).
 * Boş env kimseyi admin yapmaz. Kenar `auth = "admin"` aynı SSOT'u okur.
 */
export async function requireSuperAdmin(request?: Request): Promise<SessionUser> {
  const session = await requireSession(request);
  assertSuperAdminActor({ id: session.id, email: session.email });
  return session;
}

export async function resolveSuperAdminAccess(request?: Request): Promise<SuperAdminAccess> {
  const session = await getSession(request);
  if (!session) {
    return { kind: "unauthenticated" };
  }
  if (!isSupabaseUserId(session.id) || !isSuperAdminActor({ id: session.id, email: session.email })) {
    return { kind: "forbidden" };
  }
  return { kind: "ok", user: session };
}

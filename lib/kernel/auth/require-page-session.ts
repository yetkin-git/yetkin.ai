import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/kernel/auth/require-session";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { CITIZEN_LOGIN_PATH } from "@/lib/kernel/security/edge-guard";

/** Sayfa/layout: gerçek getUser. Sahte kenar ipucu form basamaz. */
export async function requirePageSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(CITIZEN_LOGIN_PATH);
  }
  return session;
}

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/kernel/auth/require-session";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { RAIL_PATHNAME_HEADER } from "@/lib/kernel/security/edge-guard";

/** Sayfa/layout: gerçek getUser. Sahte kenar ipucu form basamaz. */
export async function requirePageSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const from = (await headers()).get(RAIL_PATHNAME_HEADER);
    redirect(buildCitizenLoginHref(from));
  }
  return session;
}

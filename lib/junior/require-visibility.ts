import "server-only";

import { redirect } from "next/navigation";
import { canAccessJunior } from "@/lib/access";
import { getSession } from "@/lib/kernel/auth/session";
import { jsonFail } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

export const JUNIOR_VISIBILITY_DENIED = "Bu alan kapalı.";

/** Sayfa kabuğu. Oturum yoksa veya e-posta listede değilse ana sayfaya iner. */
export async function redirectUnlessJuniorVisible(): Promise<void> {
  const session = await getSession();
  if (!canAccessJunior(session?.email)) {
    redirect("/");
  }
}

/**
 * Junior API. Yetkisiz istek 404 döner ve çağıran sorguyu çalıştırmaz.
 * Yetkiliyse null.
 */
export function juniorVisibilityDenied(
  request: Request,
  email: string | null | undefined,
): Response | null {
  if (canAccessJunior(email)) {
    return null;
  }
  return jsonFail(JUNIOR_VISIBILITY_DENIED, 404, resolveRequestId(request), request);
}

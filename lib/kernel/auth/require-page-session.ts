import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/kernel/auth/require-session";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { RAIL_PATHNAME_HEADER, RAIL_SEARCH_HEADER } from "@/lib/kernel/security/edge-guard";

/** Sayfa/layout: gerçek getUser. Sahte kenar ipucu form basamaz. */
export async function requirePageSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const requestHeaders = await headers();
    const from = requestHeaders.get(RAIL_PATHNAME_HEADER);
    /**
     * Denetim (443363f4): sunucu tarafı bu kapı dönüş adresini yalnız yoldan
     * kuruyordu; `/kurumsal/ilanlar?pozisyon=…` köprüsüyle gelen oturumsuz
     * kullanıcı girişten sonra **boş** forma dönüyordu (kenar 307'si zaten
     * oturum çerezini görüp bu kapıya düşürüyordu). Sorgu kenardan mühürlü
     * başlıkla gelir; allowlist ve sanitize `buildCitizenLoginHref` içindedir.
     */
    const search = requestHeaders.get(RAIL_SEARCH_HEADER)?.trim() ?? "";
    redirect(buildCitizenLoginHref(from ? `${from}${search}` : null));
  }
  return session;
}

import "server-only";

import type { NextRequest } from "next/server";
import type { AuthCookieWriteOptions } from "@/lib/kernel/auth/cookie-options";
import { provisionConfirmedAuthUser } from "@/lib/kernel/auth/dev-signup-fallback";
import { upsertCitizenUserAndWallet } from "@/lib/kernel/auth/provision-citizen-profile";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import { buildSignupAuthMetadata, deriveSignupDisplayName } from "@/lib/kernel/auth/signup-metadata";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { logEvent } from "@/lib/kernel/observability/log";
import { bindGuestOrderToUser } from "@/lib/tezgah/guest-claim-bind";
import { isClaimTokenShaped, loadClaimOrder } from "@/lib/tezgah/guest-claim";

/**
 * Faz 3 / §4.1 — `/claim/[token]` şifre belirleme ve hesabı açma.
 *
 * Sıra **değişmez** (para → hesap → defter → abonelik):
 * 1. Token tek kullanımlık ve süreli doğrulanır (`loadClaimOrder`).
 * 2. Supabase Auth hesabı açılır (kullanıcının belirlediği şifre).
 * 3. `payment_orders.userId` bağlanır, defter CREDIT'i yazılır, Pro aboneliği açılır
 *    (`bindGuestOrderToUser`).
 * 4. Token tek kullanımlık işaretlenir.
 *
 * Dürüstlük sınırı: **ödeme onaylanmadan hesap açılmaz**; token yalnız CLEARED
 * siparişte geçerlidir. Auth hesabı açılamazsa ticari satır değişmez (token yanmaz).
 * Defter yazılamazsa hesap açılmış olur ama token yanmaz; operatör
 * `tezgah.guest.claim_ledger_failed` alarmı görür ve tekrar deneme mümkündür.
 */
export const auth = "public" as const;

type PendingAuthCookie = {
  name: string;
  value: string;
  options: AuthCookieWriteOptions;
};

function rememberAuthCookie(jar: PendingAuthCookie[], cookie: PendingAuthCookie) {
  const index = jar.findIndex((item) => item.name === cookie.name);
  if (index >= 0) {
    jar[index] = cookie;
    return;
  }
  jar.push(cookie);
}

function readField(body: unknown, key: string): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "";
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.claimOrderIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    if (!isSupabaseConfigured()) {
      return jsonFail("Kimlik bağlantısı kapalı.", 503, requestId, request);
    }
    const body: unknown = await request.json().catch(() => null);
    const token = readField(body, "token");
    const password = readField(body, "password");
    if (!isClaimTokenShaped(token)) {
      return jsonFail("Bu bağlantı geçerli değil.", 400, requestId, request);
    }
    if (password.length < CITIZEN_PASSWORD_MIN_LENGTH || password.length > 256) {
      return jsonFail(
        `Şifre en az ${CITIZEN_PASSWORD_MIN_LENGTH} karakter olmalı.`,
        400,
        requestId,
        request,
      );
    }
    const claim = await loadClaimOrder(token);
    if (!claim.ok) {
      return jsonFail(claim.message, claim.reason === "unknown" ? 404 : 409, requestId, request);
    }
    const order = claim.order;
    const email = (order.guestEmail ?? "").trim().toLowerCase();
    if (!email) {
      return jsonFail("Bu bağlantı geçerli değil.", 409, requestId, request);
    }
    const metadata = buildSignupAuthMetadata(deriveSignupDisplayName(email), true, true);
    if (!metadata) {
      return jsonFail("Hesap açılamadı. Destek ile iletişime geç.", 503, requestId, request);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    const pendingCookies: PendingAuthCookie[] = [];
    const pendingHeaders = new Headers();
    const supabase = createSupabaseCookieClient({
      url,
      anon,
      requestUrl: request.nextUrl,
      getAll() {
        return request.cookies.getAll();
      },
      setCookie(name, value, options) {
        rememberAuthCookie(pendingCookies, { name, value, options });
      },
      setHeaders: pendingHeaders,
    });

    // 2. Hesap açılır. SMTP doğrulama postası düşerse onaylı hesap yedeği devreye girer
    // (kayıt rotasıyla aynı kapı; para zaten alındı, hesap yolu tıkanmaz).
    let userId: string | null = null;
    const signed = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (signed.error) {
      const provisioned = await provisionConfirmedAuthUser({ email, password, metadata });
      if (!provisioned.ok) {
        logEvent({
          level: "error",
          event: "tezgah.guest.claim_signup_failed",
          requestId,
          merchantOid: order.merchantOid,
          orderId: order.id,
          errorName: signed.error.name ?? "signup",
          applied: false,
        });
        return jsonFail("Hesap açılamadı. Birkaç dakika sonra tekrar dene.", 503, requestId, request);
      }
      userId = provisioned.userId;
    } else {
      if (signed.data.user?.identities != null && signed.data.user.identities.length === 0) {
        // Aynı e-posta başka bir oturumda açılmış: hesabı sahiplendirme kapalı.
        return jsonFail(
          "Bu e-posta zaten kayıtlı. Giriş yapıp Tezgâh'a geç; destek gerekirse bağlantıyı kullan.",
          409,
          requestId,
          request,
        );
      }
      userId = signed.data.user?.id ?? null;
    }
    if (!userId) {
      return jsonFail("Hesap açılamadı. Birkaç dakika sonra tekrar dene.", 503, requestId, request);
    }
    const profile = await upsertCitizenUserAndWallet({
      userId,
      email,
      displayName: metadata.display_name || null,
    });
    if (!profile.ok) {
      logEvent({
        level: "error",
        event: "tezgah.guest.claim_profile_failed",
        requestId,
        userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        errorName: profile.errorName,
        applied: false,
      });
      return jsonFail("Hesabın şu an açılamadı. Bir süre sonra tekrar dene.", 503, requestId, request);
    }

    // 3. Ticari bağlama: userId + defter CREDIT + Pro aboneliği.
    const bound = await bindGuestOrderToUser({
      merchantOid: order.merchantOid,
      claimToken: token,
      userId,
    });
    if (!bound.ok) {
      logEvent({
        level: "error",
        event: "tezgah.guest.claim_bind_failed",
        requestId,
        userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        reason: bound.reason,
        applied: false,
      });
      return jsonFail(
        bound.reason === "ledger_failed"
          ? "Ödemen kayıtlı; cüzdan kaydı tamamlanamadı. Biraz sonra tekrar dene."
          : "Sipariş bağlanamadı. Destek ile iletişime geç.",
        503,
        requestId,
        request,
      );
    }

    // Oturum çerezi yazılır — kullanıcı doğrudan `/tezgah`'a gider.
    const signedIn = await supabase.auth.signInWithPassword({ email, password });

    logEvent({
      level: "info",
      event: "tezgah.guest.claim_completed",
      requestId,
      userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: bound.amountMinor,
      applied: true,
    });

    const response = jsonOk(
      {
        ok: true,
        proActivated: bound.proActivated,
        walletCredited: bound.walletCredited,
        next: "/tezgah",
      },
      200,
      requestId,
      request,
    );
    if (!signedIn.error) {
      for (const cookie of pendingCookies) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
      pendingHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
    }
    return response;
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

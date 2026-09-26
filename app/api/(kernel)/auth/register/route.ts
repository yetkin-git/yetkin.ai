import type { NextRequest } from "next/server";
import type { AuthCookieWriteOptions } from "@/lib/kernel/auth/cookie-options";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import { provisionConfirmedAuthUser } from "@/lib/kernel/auth/dev-signup-fallback";
import {
  clearOrphanCitizenRows,
  upsertCitizenUserAndWallet,
} from "@/lib/kernel/auth/provision-citizen-profile";
import { deliverSignupConfirmationMail } from "@/lib/kernel/auth/confirmation-mail";
import {
  executeCitizenRegister,
  registerCitizen,
} from "@/lib/kernel/auth/register-citizen";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import {
  AUTH_REGISTER_API_PATH,
  resolveAuthOrigin,
} from "@/lib/kernel/auth/redirects";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { z } from "zod";

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

const bodySchema = z.object({
  email: z.string().min(1).max(320),
  password: z.string().min(1).max(256),
  fullName: z.string().min(1).max(DISPLAY_NAME_MAX_LENGTH),
  ageConfirmed: z.boolean(),
  termsConfirmed: z.boolean(),
});

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.authIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }

    if (!isSupabaseConfigured()) {
      logEvent({
        level: "warn",
        event: "auth.register",
        requestId,
        route: AUTH_REGISTER_API_PATH,
        reason: "unconfigured",
        status: 503,
      });
      return jsonFail("Kimlik bağlantısı kapalı.", 503, requestId, request);
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Kayıt gövdesi geçersiz.", 400, requestId, request);
    }

    const origin = resolveAuthOrigin(request.nextUrl);
    const prepared = registerCitizen(parsed.data, origin);
    if (!prepared.ok) {
      return jsonFail(prepared.error, prepared.status, requestId, request);
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

    const result = await executeCitizenRegister({
      prepared,
      auth: {
        async signUp({ email, password, metadata, emailRedirectTo }) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata, emailRedirectTo },
          });
          return {
            user: data.user
              ? { id: data.user.id, identities: data.user.identities }
              : null,
            session: data.session,
            error: error
              ? { message: error.message, name: error.name, status: error.status }
              : null,
          };
        },
        async signIn({ email, password }) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          return { ok: Boolean(data.session) && !error };
        },
      },
      fallback: provisionConfirmedAuthUser,
      clearOrphans: clearOrphanCitizenRows,
      upsertProfile: upsertCitizenUserAndWallet,
      deliverMail: ({ email, emailRedirectTo, signupAccepted }) =>
        deliverSignupConfirmationMail({
          email,
          emailRedirectTo,
          signupAccepted,
          requestId,
          route: AUTH_REGISTER_API_PATH,
        }),
    });

    if (!result.ok) {
      logEvent({
        level: "error",
        event: "auth.register",
        requestId,
        route: AUTH_REGISTER_API_PATH,
        reason: result.reason,
        errorName: result.errorName ?? result.reason,
        status: result.status,
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: "info",
      event: "auth.register",
      requestId,
      route: AUTH_REGISTER_API_PATH,
      reason: result.mail,
      action: result.fallback ? "fallback" : "confirm",
      status: 200,
    });
    logEvent({
      level: "info",
      event: "sem.conversion",
      action: "register",
      requestId,
      route: AUTH_REGISTER_API_PATH,
      status: 200,
    });

    const response = jsonOk(
      {
        created: result.created,
        session: result.session,
        pendingVerification: result.pendingVerification,
        fallback: result.fallback,
        mail: result.mail,
      },
      200,
      requestId,
      request,
    );
    if (result.session) {
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

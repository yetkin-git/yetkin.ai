import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import {
  AUTH_RESET_PASSWORD_API_PATH,
  resolveAuthOrigin,
} from "@/lib/kernel/auth/redirects";
import {
  preparePasswordResetEmail,
  resolvePasswordResetAuthError,
} from "@/lib/kernel/auth/reset-password-email";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { z } from "zod";

export const auth = "public" as const;

const bodySchema = z.object({
  email: z.string().min(1).max(320),
});

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  try {
    const limited = applyHttpRateLimit(request, HTTP_RATE_LIMITS.authIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }

    if (!isSupabaseConfigured()) {
      logEvent({
        level: "warn",
        event: "auth.reset_password",
        requestId,
        route: AUTH_RESET_PASSWORD_API_PATH,
        reason: "unconfigured",
        status: 503,
      });
      return jsonFail("Kimlik bağlantısı kapalı.", 503, requestId, request);
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Sıfırlama gövdesi geçersiz.", 400, requestId, request);
    }

    const origin = resolveAuthOrigin(request.nextUrl);
    const prepared = preparePasswordResetEmail(parsed.data.email, origin);
    if (!prepared.ok) {
      return jsonFail(prepared.error, prepared.status, requestId, request);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await client.auth.resetPasswordForEmail(prepared.email, {
      redirectTo: prepared.redirectTo,
    });
    if (error) {
      const mapped = resolvePasswordResetAuthError({
        message: error.message,
        name: error.name,
        status: error.status,
      });
      logEvent({
        level: "error",
        event: "auth.reset_password",
        requestId,
        route: AUTH_RESET_PASSWORD_API_PATH,
        reason: mapped.reason,
        errorName: error.name,
        status: mapped.status,
      });
      return jsonFail(mapped.error, mapped.status, requestId, request);
    }

    logEvent({
      level: "info",
      event: "auth.reset_password",
      requestId,
      route: AUTH_RESET_PASSWORD_API_PATH,
      reason: "sent",
      status: 200,
    });
    return jsonOk({ sent: true }, 200, requestId, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message) {
      const mapped = resolvePasswordResetAuthError({ message });
      if (mapped.reason === "smtp") {
        logEvent({
          level: "error",
          event: "auth.reset_password",
          requestId,
          route: AUTH_RESET_PASSWORD_API_PATH,
          reason: "smtp",
          errorName: error instanceof Error ? error.name : "unknown",
          status: 503,
        });
        return jsonFail(mapped.error, mapped.status, requestId, request);
      }
    }
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

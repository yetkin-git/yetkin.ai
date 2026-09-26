import type { NextRequest } from "next/server";
import { deliverSignupConfirmationMail } from "@/lib/kernel/auth/confirmation-mail";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import { buildSignupEmailRedirectTo, resolveAuthOrigin } from "@/lib/kernel/auth/redirects";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { z } from "zod";

export const auth = "public" as const;

const ROUTE = "/api/auth/resend-confirmation";

const bodySchema = z.object({
  email: z.string().min(3).max(320),
});

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.authIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    if (!isSupabaseConfigured()) {
      return jsonFail("Kimlik bağlantısı kapalı.", 503, requestId, request);
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("E-posta geçersiz.", 400, requestId, request);
    }
    const origin = resolveAuthOrigin(request.nextUrl);
    const mail = await deliverSignupConfirmationMail({
      email: parsed.data.email.trim().toLowerCase(),
      emailRedirectTo: buildSignupEmailRedirectTo(origin),
      signupAccepted: false,
      requestId,
      route: ROUTE,
    });
    return jsonOk({ mail, pendingVerification: mail === "sent" }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

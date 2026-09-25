import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { closeCitizenAccount } from "@/lib/kernel/identity/close-account";
import { ACCOUNT_CLOSE_CONFIRM } from "@/lib/kernel/identity/close-account-gate";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { z } from "zod";

export const auth = "session" as const;

const PROFILE_CLOSE_ROUTE = "/api/profile/close";

const bodySchema = z.object({
  confirm: z.literal(ACCOUNT_CLOSE_CONFIRM),
});

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.authIp, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new BadRequestError("Hesabı kapatmak için KAPAT yaz.");
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: PROFILE_CLOSE_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ confirm: parsed.data.confirm }),
        requestId,
        request,
      },
      async () => {
        const result = await closeCitizenAccount(user.id);
        return { status: 200, body: { account: result } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

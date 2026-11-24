import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { advanceHibeApplicationPhase, hibeWriteResult } from "@/lib/yetkinhibe/application-service";
import { GRANT_LIFECYCLE_PHASE_ORDER } from "@/lib/yetkinhibe/grant-lifecycle";
import { z } from "zod";

export const auth = "session" as const;

const bodySchema = z.strictObject({
  phase: z.enum(GRANT_LIFECYCLE_PHASE_ORDER),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
    const { id } = await context.params;
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeMatchUser, session.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Faz kaydı geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: "/api/yetkinhibe/applications/[id]/phase",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ id, ...parsed.data }),
        requestId,
        request,
      },
      () =>
        hibeWriteResult(async () => {
          const updated = await advanceHibeApplicationPhase(session.id, id, parsed.data.phase);
          return { id, phase: updated.phase };
        }),
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

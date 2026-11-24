import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { createHibeApplication, hibeWriteResult, listHibeApplications } from "@/lib/yetkinhibe/application-service";
import { z } from "zod";

export const auth = "session" as const;

const ROUTE = "/api/yetkinhibe/applications";

const bodySchema = z.strictObject({
  grantCallId: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(300),
  clientId: z.string().trim().min(8).max(80).nullable().optional(),
  dossierId: z.string().trim().min(8).max(80).nullable().optional(),
  nextDeadlineAt: z.string().trim().max(40).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeMatchUser, session.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const applications = await listHibeApplications(session.id);
    return jsonOk({ applications }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSession(request);
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
      return jsonFail("Başvuru kaydı geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: session.id,
        route: ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(parsed.data),
        requestId,
        request,
      },
      () =>
        hibeWriteResult(async () => {
          const created = await createHibeApplication(session.id, parsed.data);
          return { id: created.id, phase: created.phase };
        }),
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

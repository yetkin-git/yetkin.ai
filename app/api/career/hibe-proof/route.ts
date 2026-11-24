import { attachHibeApplicationAsCareerProof } from "@/lib/career/hibe-proof";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** YetkinHibe başvurusunu kariyer vize damgasına bağlar. IDOR: userId sahiplik. */
export const auth = "session" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.applicationId !== "string") {
      throw new BadRequestError("Hibe başvuru kimliği gerekli.");
    }
    const applicationId = body.applicationId.trim();
    const ports = createPrismaCareerPorts();
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/career/hibe-proof",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ userId: user.id, applicationId }),
        requestId,
        request,
      },
      async () => {
        const attached = await attachHibeApplicationAsCareerProof(user.id, applicationId, ports);
        await syncCareerVisaStamps(ports, { userId: user.id });
        return {
          status: 200,
          body: {
            attached: true,
            applied: attached.applied,
            healed: attached.healed,
            stampId: attached.stampId,
            title: attached.title,
            certificateHash: attached.certificateHash,
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

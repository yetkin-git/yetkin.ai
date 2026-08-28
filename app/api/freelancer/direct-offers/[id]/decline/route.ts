import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { declineDirectFreelancerOffer } from "@/lib/freelancer/engine";
import { acceptDirectOfferInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

const DECLINE_DIRECT_ROUTE = "/api/freelancer/direct-offers/[id]/decline";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const rawBody = await request.text();
    let body: unknown = {};
    if (rawBody.trim().length > 0) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return jsonFail("Doğrudan teklif red alanları geçersiz.", 400, requestId, request);
      }
    }
    const parsed = acceptDirectOfferInputSchema.safeParse(body);
    if (!parsed.success) {
      return jsonFail("Doğrudan teklif red alanları geçersiz.", 400, requestId, request);
    }

    return await settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: DECLINE_DIRECT_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ jobId: id, action: "decline" }),
        requestId,
        request,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const job = await declineDirectFreelancerOffer(ports, {
          jobId: id,
          actorUserId: user.id,
        });
        logEvent({
          level: "info",
          event: "freelancer.direct_offer.decline.settled",
          requestId,
          userId: user.id,
          route: DECLINE_DIRECT_ROUTE,
        });
        return {
          status: 200,
          body: {
            job: {
              id: job.id,
              status: job.status,
              visibility: job.visibility,
            },
          },
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "freelancer.direct_offer.decline.failed",
      requestId,
      route: DECLINE_DIRECT_ROUTE,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

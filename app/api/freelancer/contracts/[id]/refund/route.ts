import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { refundFreelancerContract } from "@/lib/freelancer/engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

const REFUND_ROUTE = "/api/freelancer/contracts/[id]/refund";

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
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: REFUND_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ contractId: id }),
        requestId,
        request,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const contract = await refundFreelancerContract(ports, {
          contractId: id,
          actorUserId: user.id,
        });
        logEvent({
          level: "info",
          event: "freelancer.refund.settled",
          requestId,
          userId: user.id,
          route: REFUND_ROUTE,
        });
        return { status: 200, body: { contract } };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "freelancer.refund.failed",
      requestId,
      route: REFUND_ROUTE,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

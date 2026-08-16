import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { acceptFreelancerBid } from "@/lib/freelancer/engine";
import { acceptBidInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId);
    }
    const parsed = acceptBidInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Teklif kimliği gerekli.", 400, requestId);
    }

    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/freelancer/jobs/[id]/accept",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ jobId: id, bidId: parsed.data.bidId }),
        requestId,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const { contract } = await acceptFreelancerBid(ports, {
          jobId: id,
          bidId: parsed.data.bidId,
          actorUserId: user.id,
        });
        logEvent({
          level: "info",
          event: "freelancer.accept.settled",
          requestId,
          userId: user.id,
          route: "/api/freelancer/jobs/[id]/accept",
        });
        return {
          status: 200,
          body: {
            contract: {
              id: contract.id,
              jobId: contract.jobId,
              status: contract.status,
              grossMinor: contract.grossMinor,
              holdMinor: contract.holdMinor,
              netMinor: contract.netMinor,
            },
          },
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "freelancer.accept.failed",
      requestId,
      route: "/api/freelancer/jobs/[id]/accept",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

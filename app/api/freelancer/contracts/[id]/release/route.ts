import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { releaseFreelancerContract } from "@/lib/freelancer/engine";
import { toFreelancerReleaseWire } from "@/lib/freelancer/contract-view";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { tryIssueCareerVisaStamp } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";

export const auth = "session" as const;

const RELEASE_ROUTE = "/api/freelancer/contracts/[id]/release";

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
    return await settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: RELEASE_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ contractId: id }),
        requestId,
        request,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const contract = await releaseFreelancerContract(ports, {
          contractId: id,
          actorUserId: user.id,
        });
        const visa =
          contract.status === "RELEASED"
            ? await tryIssueCareerVisaStamp(createPrismaCareerPorts(), {
                sourceKind: "FREELANCER_RELEASE",
                sourceId: contract.id,
                actorUserId: user.id,
              })
            : null;
        logEvent({
          level: "info",
          event: "freelancer.release.settled",
          requestId,
          userId: user.id,
          route: RELEASE_ROUTE,
        });
        return {
          status: 200,
          body: toFreelancerReleaseWire(contract, visa?.stamp ?? null),
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "freelancer.release.failed",
      requestId,
      route: RELEASE_ROUTE,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

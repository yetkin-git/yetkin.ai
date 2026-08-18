import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { RAIL_V1_ACCEPT_FIELDS_INVALID } from "@/lib/kernel/http/v1-contract";
import { acceptFreelancerBid } from "@/lib/freelancer/engine";
import { toFreelancerAcceptWire } from "@/lib/freelancer/contract-view";
import { acceptBidInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import {
  FREELANCER_ESCROW_HOLD_UNIT_KEY,
  FREELANCER_SEED_MODULE_KEY,
} from "@/lib/freelancer/seed";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

export const auth = "session" as const;

const ACCEPT_ROUTE = "/api/freelancer/jobs/[id]/accept";

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
    const parsed = acceptBidInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail(RAIL_V1_ACCEPT_FIELDS_INVALID, 400, requestId, request);
    }

    return await settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: ACCEPT_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ jobId: id, bidId: parsed.data.bidId }),
        requestId,
        request,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const catalog = await createPrismaPriceCatalogStore().findActiveEntry(
          FREELANCER_SEED_MODULE_KEY,
          FREELANCER_ESCROW_HOLD_UNIT_KEY,
        );
        const holdBps = resolveHoldBps(catalog?.amountMinor ?? HOLD_BPS_DEFAULT);
        const { contract } = await acceptFreelancerBid(ports, {
          jobId: id,
          bidId: parsed.data.bidId,
          actorUserId: user.id,
          holdBps,
        });
        logEvent({
          level: "info",
          event: "freelancer.accept.settled",
          requestId,
          userId: user.id,
          route: ACCEPT_ROUTE,
        });
        return {
          status: 200,
          body: toFreelancerAcceptWire(contract),
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "freelancer.accept.failed",
      requestId,
      route: ACCEPT_ROUTE,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

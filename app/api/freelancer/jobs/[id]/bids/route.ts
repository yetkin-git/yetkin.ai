import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { submitFreelancerBid } from "@/lib/freelancer/engine";
import { submitBidInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import { createPrismaCareerStore } from "@/lib/career/prisma-store";

export const auth = "session" as const;

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
    const parsed = submitBidInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Teklif alanları geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/freelancer/jobs/[id]/bids",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          jobId: id,
          amountMinor: parsed.data.amountMinor,
          coverNote: parsed.data.coverNote,
        }),
        requestId,
        request,
      },
      async () => {
        await assertAcademyCareerVisaForListing(createPrismaCareerStore(), user.id);
        const ports = createPrismaFreelancerPorts();
        const bid = await submitFreelancerBid(ports, {
          jobId: id,
          bidderId: user.id,
          amountMinor: parsed.data.amountMinor,
          coverNote: parsed.data.coverNote,
        });
        return { status: 201, body: { bid } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

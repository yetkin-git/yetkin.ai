import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { createDirectFreelancerOffer } from "@/lib/freelancer/engine";
import { createDirectOfferInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import { createPrismaCareerProofStore } from "@/lib/career/prisma-proofs";
import { createPrismaCareerStore } from "@/lib/career/prisma-store";
import { lockFreelancerJobVisaPathway } from "@/lib/freelancer/job-visa-lock";

export const auth = "session" as const;

const DIRECT_OFFERS_ROUTE = "/api/freelancer/direct-offers";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaFreelancerPorts();
    const offers = await ports.freelancer.listDirectOffersForInvitee(user.id);
    return jsonOk({ offers }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId, request);
    }
    const parsed = createDirectOfferInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Doğrudan teklif alanları geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: DIRECT_OFFERS_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          title: parsed.data.title,
          brief: parsed.data.brief,
          budgetMinor: parsed.data.budgetMinor,
          visaPathwayId: parsed.data.visaPathwayId,
          inviteeId: parsed.data.inviteeId,
          dueDays: parsed.data.dueDays,
        }),
        requestId,
        request,
      },
      async () => {
        const visaPathwayId = lockFreelancerJobVisaPathway(parsed.data.visaPathwayId);
        await assertAcademyCareerVisaForListing(
          createPrismaCareerStore(),
          parsed.data.inviteeId,
          {
            title: parsed.data.title,
            brief: parsed.data.brief,
            visaPathwayId,
          },
          createPrismaCareerProofStore(),
        );
        const ports = createPrismaFreelancerPorts();
        const job = await createDirectFreelancerOffer(ports, {
          clientId: user.id,
          inviteeId: parsed.data.inviteeId,
          title: parsed.data.title,
          brief: parsed.data.brief,
          budgetMinor: parsed.data.budgetMinor,
          visaPathwayId: parsed.data.visaPathwayId,
          dueDays: parsed.data.dueDays,
        });
        return { status: 201, body: { job } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

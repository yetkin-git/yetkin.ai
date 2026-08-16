import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
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
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = submitBidInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Teklif alanları geçersiz.", 400);
    }
    await assertAcademyCareerVisaForListing(createPrismaCareerStore(), user.id);
    const ports = createPrismaFreelancerPorts();
    const bid = await submitFreelancerBid(ports, {
      jobId: id,
      bidderId: user.id,
      amountMinor: parsed.data.amountMinor,
      coverNote: parsed.data.coverNote,
    });
    return jsonOk({ bid }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

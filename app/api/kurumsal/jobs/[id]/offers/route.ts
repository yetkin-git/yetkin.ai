import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { submitCorporateJobOffer } from "@/lib/kurumsal/engine";
import { submitJobOfferInputSchema } from "@/lib/kurumsal/schemas";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";
import { assertAcademyCareerVisaForListing } from "@/lib/career/visa-gate";
import { createPrismaCareerStore } from "@/lib/career/prisma-store";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaKurumsalPorts();
    const posting = await ports.kurumsal.getPosting(id);
    if (!posting) {
      return jsonFail("İlan bulunamadı.", 404);
    }
    const offers = await ports.kurumsal.listOffersForPosting(id);
    const visible =
      user.id === posting.userId ? offers : offers.filter((offer) => offer.bidderId === user.id);
    return jsonOk({ offers: visible });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = submitJobOfferInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Teklif alanları geçersiz.", 400);
    }
    await assertAcademyCareerVisaForListing(createPrismaCareerStore(), user.id);
    const ports = createPrismaKurumsalPorts();
    const offer = await submitCorporateJobOffer(ports, {
      postingId: id,
      bidderId: user.id,
      coverNote: parsed.data.coverNote,
    });
    return jsonOk({ offer }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

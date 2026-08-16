import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { awardCorporateJobPosting } from "@/lib/kurumsal/engine";
import { awardJobPostingInputSchema } from "@/lib/kurumsal/schemas";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";
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
    const parsed = awardJobPostingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Ödül alanları geçersiz.", 400);
    }
    await assertAcademyCareerVisaForListing(createPrismaCareerStore(), parsed.data.awardedUserId);
    const ports = createPrismaKurumsalPorts();
    const posting = await awardCorporateJobPosting(ports, {
      postingId: id,
      actorUserId: user.id,
      awardedUserId: parsed.data.awardedUserId,
      awardedDevLabsProjectId: parsed.data.awardedDevLabsProjectId,
    });
    return jsonOk({ posting });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

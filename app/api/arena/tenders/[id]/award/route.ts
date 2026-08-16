import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { awardArenaTender } from "@/lib/arena/engine";
import { awardTenderInputSchema } from "@/lib/arena/schemas";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = awardTenderInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Ödül dağıtımı geçersiz.", 400);
    }
    const ports = createPrismaArenaPorts();
    const result = await awardArenaTender(ports, {
      tenderId: id,
      actorUserId: user.id,
      winners: parsed.data.winners,
    });
    return jsonOk({ tender: result.tender, awards: result.awards });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

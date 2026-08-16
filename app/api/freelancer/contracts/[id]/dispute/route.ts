import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { openFreelancerDispute } from "@/lib/freelancer/dispute-engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { z } from "zod";

export const auth = "session" as const;

const openSchema = z.object({
  partyAClaim: z.string().trim().min(8).max(8000),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = openSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Tur 1 iddiası gerekli.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const result = await openFreelancerDispute(ports, {
      contractId: id,
      actorUserId: user.id,
      partyAClaim: parsed.data.partyAClaim,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

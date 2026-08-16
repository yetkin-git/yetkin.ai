import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { refundFreelancerContract } from "@/lib/freelancer/engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const contract = await refundFreelancerContract(ports, {
      contractId: id,
      actorUserId: user.id,
    });
    return jsonOk({ contract });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

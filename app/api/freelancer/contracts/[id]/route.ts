import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const contract = await ports.freelancer.getContract(id);
    if (!contract) {
      return jsonFail("Sözleşme bulunamadı.", 404, undefined, request);
    }
    if (user.id !== contract.clientId && user.id !== contract.freelancerId) {
      return jsonFail("Bu sözleşmeye erişim yok.", 403, undefined, request);
    }
    const job = await ports.freelancer.getJob(contract.jobId);
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    return jsonOk({ contract, job, hold }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

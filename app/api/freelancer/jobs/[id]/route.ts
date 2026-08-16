import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaFreelancerPorts();
    const job = await ports.freelancer.getJob(id);
    if (!job) {
      return jsonFail("İlan bulunamadı.", 404);
    }
    const bids = await ports.freelancer.listBidsForJob(id);
    const contract = await ports.freelancer.getContractByJobId(id);
    return jsonOk({ job, bids, contract });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

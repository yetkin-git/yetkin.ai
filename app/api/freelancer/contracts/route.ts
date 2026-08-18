import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { listFreelancerContractViews } from "@/lib/freelancer/contract-view";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaFreelancerPorts();
    const contracts = await listFreelancerContractViews(ports.freelancer, user.id);
    return jsonOk({ contracts }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_FREELANCER_PULSE } from "@/lib/dashboard/freelancer-pulse";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaFreelancerPorts();
    const pulse = await ports.freelancer.pulseForUser(user.id);
    return jsonOk({ pulse: { ...pulse, live: true } }, 200, undefined, request);
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_FREELANCER_PULSE }, 200, undefined, request);
    }
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

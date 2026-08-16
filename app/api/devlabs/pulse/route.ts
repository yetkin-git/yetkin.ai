import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_DEVLABS_PULSE } from "@/lib/dashboard/devlabs-pulse";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaDevLabsPorts();
    const pulse = await ports.devlabs.pulseForUser(user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_DEVLABS_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_JUNIOR_PULSE } from "@/lib/dashboard/junior-pulse";
import { buildJuniorPulse } from "@/lib/junior/engine";
import { createPrismaJuniorPorts } from "@/lib/junior/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaJuniorPorts();
    const pulse = await buildJuniorPulse(ports, user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_JUNIOR_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

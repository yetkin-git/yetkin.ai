import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_HIBE_PULSE } from "@/lib/dashboard/hibe-pulse";
import { buildHibePulse } from "@/lib/hibe/engine";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaHibePorts();
    const pulse = await buildHibePulse(ports, user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_HIBE_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

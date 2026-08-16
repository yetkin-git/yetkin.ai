import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_STUDIO_PULSE } from "@/lib/dashboard/studio-pulse";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaStudioPorts();
    const pulse = await ports.studio.pulseForUser(user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_STUDIO_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

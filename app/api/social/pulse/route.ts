import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_SOCIAL_PULSE } from "@/lib/dashboard/social-pulse";
import { buildSocialPulse } from "@/lib/social/engine";
import { createPrismaSocialPorts } from "@/lib/social/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaSocialPorts();
    const pulse = await buildSocialPulse(ports, user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_SOCIAL_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

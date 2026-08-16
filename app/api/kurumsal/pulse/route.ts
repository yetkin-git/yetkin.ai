import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EMPTY_KURUMSAL_PULSE } from "@/lib/dashboard/kurumsal-pulse";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaKurumsalPorts();
    const pulse = await ports.kurumsal.pulseForUser(user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({ pulse: EMPTY_KURUMSAL_PULSE });
    }
    return jsonFromUnknown(error);
  }
}

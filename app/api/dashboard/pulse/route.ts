import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { logEvent } from "@/lib/kernel/observability/log";
import { DASHBOARD_PULSE_PATH } from "@/lib/dashboard/pulse";
import { emptyDashboardPulse, loadDashboardPulse } from "./load";

export const auth = "session" as const;
export const dynamic = "force-dynamic";

function isDatabaseUnconfigured(error: unknown): boolean {
  return error instanceof Error && error.message.includes("DATABASE_URL");
}

export async function GET(request: Request) {
  const started = Date.now();
  try {
    const user = await requireSession(request);
    const pulse = await loadDashboardPulse(user.id);
    logEvent({
      level: "info",
      event: "dashboard.pulse.ok",
      userId: user.id,
      durationMs: Date.now() - started,
      route: DASHBOARD_PULSE_PATH,
    });
    const response = jsonOk({ pulse });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    if (isDatabaseUnconfigured(error)) {
      const response = jsonOk({ pulse: emptyDashboardPulse() });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
    return jsonFromUnknown(error);
  }
}

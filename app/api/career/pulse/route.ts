import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { loadCareerLivePulse } from "@/lib/career/load";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const pulse = await loadCareerLivePulse(user.id);
    if (!pulse) {
      return jsonOk(
        {
          pulse: { live: false, visaCount: 0, portfolioCount: 0, lastVisaTitle: null },
        },
        200,
        undefined,
        request,
      );
    }
    return jsonOk({ pulse }, 200, undefined, request);
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk(
        {
          pulse: { live: false, visaCount: 0, portfolioCount: 0, lastVisaTitle: null },
        },
        200,
        undefined,
        request,
      );
    }
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

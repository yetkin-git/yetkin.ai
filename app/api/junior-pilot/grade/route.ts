import { requireSession } from "@/lib/kernel/auth/session";
import { juniorVisibilityDenied } from "@/lib/junior/require-visibility";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { switchJuniorGrade } from "@/lib/junior/service";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const hidden = juniorVisibilityDenied(request, user.email);
    if (hidden) {
      return hidden;
    }
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const result = await switchJuniorGrade(
      createPrismaJuniorStore(),
      user.id,
      await request.json().catch(() => ({})),
    );
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ profile: result.data.profile }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

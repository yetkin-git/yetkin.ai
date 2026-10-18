import { requireSession } from "@/lib/kernel/auth/session";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { saveJuniorElectives } from "@/lib/junior/checkout";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { isJuniorPlanActive } from "@/lib/junior/plan";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const store = createPrismaJuniorStore();
    const subscription = await store.getSubscription(user.id);
    const locked = juniorLockedResponse(requestId, request, user, "profile", {
      planCovers: isJuniorPlanActive(subscription, new Date()),
    });
    if (locked) {
      return locked;
    }
    const result = await saveJuniorElectives(
      store,
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

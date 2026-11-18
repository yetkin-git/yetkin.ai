import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { peekTezgahQuota } from "@/lib/tezgah/quota";

/** Günlük hak okuması. Hak düşmez. Oturum yoksa misafir kovasıdır. */
export const auth = "public" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const quota = await peekTezgahQuota(actor.userId, actor.guest);
    return jsonOk(
      {
        remaining: quota.remaining,
        limit: quota.limit,
        used: quota.used,
        guest: quota.guest,
        lane: quota.lane,
        paywall: quota.paywall,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

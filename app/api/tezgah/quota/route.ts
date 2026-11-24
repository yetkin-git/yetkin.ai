import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import {
  isTezgahPoolKey,
  parseTezgahToolParam,
  tezgahPoolForTool,
  tezgahPoolQuotaLine,
  tezgahPoolQuotaLineForLane,
  tezgahToolQuotaLineForLane,
  type TezgahPoolKey,
  type TezgahToolId,
  type TezgahToolPool,
} from "@/lib/tezgah/catalog";
import { peekTezgahQuota } from "@/lib/tezgah/quota";

/** Aktif araç / havuz hak okuması. Hak düşmez. Oturum yoksa misafir kovasıdır. */
export const auth = "public" as const;

function resolveQuotaPool(request: Request): {
  pool: TezgahToolPool;
  poolKey: TezgahPoolKey | null;
  toolId: TezgahToolId | null;
} {
  const url = new URL(request.url);
  const toolRaw = url.searchParams.get("tool");
  const poolRaw = url.searchParams.get("pool");
  const toolId = parseTezgahToolParam(toolRaw);
  if (toolId) {
    const pool = tezgahPoolForTool(toolId);
    return {
      pool,
      poolKey: isTezgahPoolKey(pool) ? pool : null,
      toolId,
    };
  }
  if (poolRaw && isTezgahPoolKey(poolRaw)) {
    return { pool: poolRaw, poolKey: poolRaw, toolId: null };
  }
  return { pool: "lite", poolKey: "lite", toolId: null };
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const { pool, poolKey, toolId } = resolveQuotaPool(request);

    if (pool === "local" || pool === "free_template") {
      const line = tezgahPoolQuotaLine(pool, 1, 1, actor.guest);
      return jsonOk(
        {
          remaining: 1,
          limit: 1,
          used: 0,
          guest: actor.guest,
          lane: "free",
          paywall: false,
          poolKey: pool === "free_template" ? "free_template" : "local",
          unlimited: true,
          tool: toolId,
          line,
        },
        200,
        requestId,
        request,
      );
    }

    const key = poolKey ?? "lite";
    const quota = await peekTezgahQuota(actor.userId, actor.guest, new Date(), key);
    // B-02 / S-01: hat bilgisi satıra geçer. Pro kullanıcı "ücretsiz kredi" cümlesi görmez;
    // misafir hattı günlük, üye hattı aylık kredi dilini basar.
    const line = toolId
      ? tezgahToolQuotaLineForLane(
          toolId,
          quota.remaining,
          quota.limit,
          quota.lane,
          quota.guest,
        )
      : tezgahPoolQuotaLineForLane(key, quota.remaining, quota.limit, quota.lane, quota.guest);
    return jsonOk(
      {
        remaining: quota.remaining,
        limit: quota.limit,
        used: quota.used,
        guest: quota.guest,
        lane: quota.lane,
        paywall: quota.paywall,
        poolKey: quota.poolKey,
        unlimited: quota.unlimited,
        rollover: quota.rollover,
        periodKey: quota.periodKey,
        tool: toolId,
        line,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateTezgahOutput } from "@/lib/tezgah/engine";
import { guardTezgahGenerateRate } from "@/lib/tezgah/generate-guard";
import { tezgahGenerateRequestSchema } from "@/lib/tezgah/schema";

/**
 * AI Tezgâh üretimi. Kenar `public`; günlük/aylık hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * S-01: kenar IP tavanına ek olarak **aktör başına** `tezgahGenerateUser` tavanı vardır
 * (30/10dk). Cüzdan yazılmaz. Token maliyeti AiTokenUsage defterine düşer (`recordUsage: true`).
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = tezgahGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const command = readTezgahCommandKey(request);
    if (!command.ok) {
      return jsonFail(command.error, 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const limited = await guardTezgahGenerateRate(request, actor.userId);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const result = await generateTezgahOutput({
      actorId: actor.userId,
      guest: actor.guest,
      request: parsed.data,
      commandKey: command.key,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        tool: result.tool,
        markdown: result.markdown,
        outputId: result.outputId,
        firstOutput: result.firstOutput,
        remaining: result.remaining,
        limit: result.limit,
        guest: result.guest,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

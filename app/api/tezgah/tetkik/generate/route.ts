import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { guardTezgahGenerateRate } from "@/lib/tezgah/generate-guard";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateTetkikReport } from "@/lib/tezgah/tetkik/engine";
import { encodeTetkikArchive } from "@/lib/tezgah/tetkik/archive";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { tetkikGenerateRequestSchema } from "@/lib/tezgah/tetkik/schema";

/**
 * Web sitesi tetkiki. Kenar `public`; günlük hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * Skor kodda hesaplanır. Cüzdan yazılmaz. Token maliyeti AiTokenUsage defterine düşer (`recordUsage: true`).
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = tetkikGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
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
    const result = await generateTetkikReport({
      actorId: actor.userId,
      guest: actor.guest,
      request: parsed.data,
      commandKey: command.key,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    const outputId = await recordSignedTezgahOutput({
      userId: actor.userId,
      guest: actor.guest,
      toolKey: "tetkik",
      title: result.pageTitle || result.url,
      inputSummary: result.url,
      // Y3: arşive özet değil raporun tamamı yazılır (`tetkik-v1` zarfı).
      // Aksi hâlde çekmeceden açılan kayıt rapor değil üç satır olurdu.
      outputContent: encodeTetkikArchive(result),
    });
    return jsonOk(
      {
        tool: result.tool,
        score: result.score,
        outputId,
        maxScore: result.maxScore,
        disclaimer: result.disclaimer,
        measuredAt: result.measuredAt,
        url: result.url,
        businessName: result.businessName,
        freelancerName: result.freelancerName,
        agencyName: result.agencyName,
        pageTitle: result.pageTitle,
        ttfbMs: result.ttfbMs,
        htmlBytes: result.htmlBytes,
        checks: result.checks,
        opportunities: result.opportunities,
        action: result.action,
        narrative: result.narrative,
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

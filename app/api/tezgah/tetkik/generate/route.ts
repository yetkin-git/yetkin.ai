import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateTetkikReport } from "@/lib/tezgah/tetkik/engine";
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
      outputContent: `${result.url}\nSkor: ${result.score}\n${result.narrative}`,
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

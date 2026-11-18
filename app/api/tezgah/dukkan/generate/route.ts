import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { dukkanGenerateRequestSchema } from "@/lib/tezgah/dukkan/schema";

/**
 * Sektörel dijital dükkan. Kenar `public`; günlük hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * Sayfa şablondan basılır. Cüzdan yazılmaz.
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = dukkanGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const command = readTezgahCommandKey(request);
    if (!command.ok) {
      return jsonFail(command.error, 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const result = await generateDukkanPage({
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
      toolKey: "dukkan",
      title: parsed.data.businessName,
      inputSummary: `${parsed.data.place} · ${parsed.data.sector}`,
      outputContent: result.html,
    });
    return jsonOk(
      {
        tool: result.tool,
        html: result.html,
        outputId,
        score: result.score,
        filename: result.filename,
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

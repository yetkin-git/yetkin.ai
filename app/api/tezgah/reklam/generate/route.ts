import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateReklamPackage } from "@/lib/tezgah/reklam/engine";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { reklamGenerateRequestSchema } from "@/lib/tezgah/reklam/schema";

/**
 * Otonom reklam paketi. Kenar `public`; günlük hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * Google karakter sınırı, sektör ilgi alanı ve amaç çağrısı kodda mühürlenir.
 * Cüzdan yazılmaz.
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = reklamGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const command = readTezgahCommandKey(request);
    if (!command.ok) {
      return jsonFail(command.error, 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const result = await generateReklamPackage({
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
      toolKey: "reklam",
      title: parsed.data.businessName,
      inputSummary: `${parsed.data.place} · ${parsed.data.aim}`,
      outputContent: result.markdown,
    });
    return jsonOk(
      {
        tool: result.tool,
        markdown: result.markdown,
        outputId,
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

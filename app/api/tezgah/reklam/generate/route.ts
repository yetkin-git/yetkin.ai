import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { guardTezgahGenerateRate } from "@/lib/tezgah/generate-guard";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateReklamPackage } from "@/lib/tezgah/reklam/engine";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { reklamGenerateRequestSchema } from "@/lib/tezgah/reklam/schema";

/**
 * Otonom reklam paketi — 3 varyantlı A/B matrisi + Google/Meta CSV.
 * Kenar `public`; günlük hak handler'dadır.
 * Karakter sınırı, sahte metrik kalkanı, bütçe dağılımı ve amaç çağrısı kodda mühürlenir.
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
    const limited = await guardTezgahGenerateRate(request, actor.userId);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
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
        googleCsv: result.googleCsv,
        metaCsv: result.metaCsv,
        outputId,
        filename: result.filename,
        googleCsvFilename: result.googleCsvFilename,
        metaCsvFilename: result.metaCsvFilename,
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

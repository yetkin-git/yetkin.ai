import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { generatePazaryeriCatalog } from "@/lib/tezgah/pazaryeri/engine";
import { pazaryeriGenerateRequestSchema } from "@/lib/tezgah/pazaryeri/schema";

/**
 * Pazaryeri katalog fabrikası. Kenar `public`; günlük hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * Ayrıştırma, başlık tavanı ve CSV kodda basılır. Cüzdan yazılmaz.
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = pazaryeriGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const result = await generatePazaryeriCatalog({
      actorId: actor.userId,
      guest: actor.guest,
      request: parsed.data,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        tool: result.tool,
        filename: result.filename,
        csv: result.csv,
        columns: result.columns,
        rows: result.rows,
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

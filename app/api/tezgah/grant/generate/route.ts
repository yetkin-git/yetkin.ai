import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";
import { generateGrantProject } from "@/lib/tezgah/grant/engine";
import { grantGenerateRequestSchema } from "@/lib/tezgah/grant/schema";

/**
 * Hibe proje dosyası. Kenar `public`; günlük hak handler'dadır.
 * Yol `/generate` ile bittiği için kenar ayrıca `llmIp` patlama kalkanını uygular.
 * Uygun program kodda eşleşir. Taslak tablosuna ve cüzdana yazılmaz.
 * İsteğe bağlı `details` kuruma özel tam dosyayı aynı uçta üretir.
 * YetkinHibe odası bu rotayla açılmaz.
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = grantGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const result = await generateGrantProject({
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
        disclaimer: result.disclaimer,
        preparedAt: result.preparedAt,
        businessName: result.businessName,
        freelancerName: result.freelancerName,
        provinceLabel: result.provinceLabel,
        audienceLabel: result.audienceLabel,
        naceLabel: result.naceLabel,
        investmentFocusLabel: result.investmentFocusLabel,
        employeeCount: result.employeeCount,
        companyAgeYears: result.companyAgeYears,
        rdLabel: result.rdLabel,
        exportLabel: result.exportLabel,
        patentLabel: result.patentLabel,
        eligible: result.eligible,
        closed: result.closed,
        unverified: result.unverified,
        purpose: result.purpose,
        market: result.market,
        schedule: result.schedule,
        investments: result.investments,
        risk: result.risk,
        dossier: result.dossier,
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

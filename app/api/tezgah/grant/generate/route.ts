import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { guardTezgahGenerateRate } from "@/lib/tezgah/generate-guard";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { generateGrantProject } from "@/lib/tezgah/grant/engine";
import { renderGrantProjectText } from "@/lib/tezgah/grant/render";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
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
    const command = readTezgahCommandKey(request);
    if (!command.ok) {
      return jsonFail(command.error, 400, requestId, request);
    }
    if (!command.key) {
      return jsonFail("Idempotency-Key zorunludur.", 400, requestId, request);
    }
    const user = await requireSession(request).catch(() => null);
    const actor = assistantActorId(user?.id, resolveRequestIp(request));
    const limited = await guardTezgahGenerateRate(request, actor.userId);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const result = await generateGrantProject({
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
      toolKey: "grant",
      title: result.businessName,
      inputSummary: `${result.provinceLabel} · ${result.naceLabel}`,
      outputContent: renderGrantProjectText(result),
    });
    return jsonOk(
      {
        tool: result.tool,
        outputId,
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

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { generatePaidGrantDossier } from "@/lib/tezgah/grant/paid-dossier";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { grantGenerateRequestSchema } from "@/lib/tezgah/grant/schema";

/**
 * Tam hibe proje dosyası. Katalog fiyatı yoksa üretilmez.
 * PaidCommandReservation + Idempotency-Key + defter DEBIT.
 * YetkinHibe odası açılmaz.
 */
export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const parsed = grantGenerateRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success || !parsed.data.details) {
      return jsonFail("Tam dosya ayrıntı ister.", 400, requestId, request);
    }
    const result = await generatePaidGrantDossier({
      userId: user.id,
      commandKey: idempotency.key,
      request: parsed.data,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    const outputId = await recordSignedTezgahOutput({
      userId: user.id,
      guest: false,
      toolKey: "grant",
      title: result.report.businessName,
      inputSummary: `${result.report.provinceLabel} · tam dosya`,
      outputContent: result.markdown,
    });
    return jsonOk(
      {
        ...result.report,
        outputId,
        markdown: result.markdown,
        docxBase64: result.docxBase64,
        filename: result.filename,
        remaining: 0,
        limit: 0,
        guest: false,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

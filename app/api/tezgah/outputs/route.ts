import { z } from "zod";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { getPrisma } from "@/lib/kernel/db";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";

/**
 * Tezgâh arşivi. Okuma ve tarayıcı-içi üretim kaydı oturum ister.
 * Sunucu araçları kendi üretim yolunda yazar. Cüzdan yazılmaz.
 */
export const auth = "session" as const;

const saveSchema = z.strictObject({
  toolKey: z.enum(["studio-photo", "technical-drawing", "saas-builder"]),
  title: z.string().trim().min(1).max(160),
  inputSummary: z.string().trim().max(500),
  outputContent: z.string().trim().min(1).max(20_000),
});

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const rows = await getPrisma().tezgahOutput.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, toolKey: true, title: true, createdAt: true },
    });
    return jsonOk(
      {
        outputs: rows.map((row) => ({
          id: row.id,
          toolKey: row.toolKey,
          title: row.title,
          createdAt: row.createdAt.toISOString(),
        })),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const parsed = saveSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Çıktı kaydı eksik.", 400, requestId, request);
    }
    const outputId = await recordSignedTezgahOutput({
      userId: user.id,
      guest: false,
      toolKey: parsed.data.toolKey,
      title: parsed.data.title,
      inputSummary: parsed.data.inputSummary,
      outputContent: parsed.data.outputContent,
    });
    if (!outputId) {
      return jsonFail("Çıktı arşive yazılamadı.", 503, requestId, request);
    }
    return jsonOk({ outputId }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

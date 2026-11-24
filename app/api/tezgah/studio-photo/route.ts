import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolveRequestIp, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { readTezgahCommandKey } from "@/lib/tezgah/command-key";
import { guardTezgahGenerateRate } from "@/lib/tezgah/generate-guard";
import { generateStudioPhotoPack } from "@/lib/tezgah/pro/studio-photo-engine";
import { studioPhotoGenerateRequestSchema } from "@/lib/tezgah/pro/studio-photo-schema";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";

/**
 * Görsel & Ürün Stüdyosu — `generateImage` gümrüğü.
 * Oturum zorunlu. Idempotency-Key + kota/iade motorundadır. Cüzdan yazılmaz.
 */
export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const parsed = studioPhotoGenerateRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Alanları kısa ve net doldur.", 400, requestId, request);
    }
    const command = readTezgahCommandKey(request);
    if (!command.ok) {
      return jsonFail(command.error, 400, requestId, request);
    }
    const actor = assistantActorId(user.id, resolveRequestIp(request));
    const limited = await guardTezgahGenerateRate(request, actor.userId);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const result = await generateStudioPhotoPack({
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
      toolKey: "studio-photo",
      title: result.pack.summary.slice(0, 160),
      inputSummary: `${parsed.data.scene} · ${result.pack.standardLabel}`.slice(0, 500),
      outputContent: result.archiveContent,
    });
    return jsonOk(
      {
        tool: result.tool,
        markdown: result.pack.markdown,
        guideMarkdown: result.pack.guideMarkdown,
        altMarkdown: result.pack.altMarkdown,
        summary: result.pack.summary,
        standardLabel: result.pack.standardLabel,
        scene: result.pack.scene,
        sceneLabel: result.pack.sceneLabel,
        aspectRatio: result.pack.aspectRatio,
        targetWidthPx: result.pack.targetWidthPx,
        targetHeightPx: result.pack.targetHeightPx,
        producedWidthPx: result.pack.producedWidthPx,
        producedHeightPx: result.pack.producedHeightPx,
        rules: result.pack.rules,
        gallery: result.pack.gallery,
        altTexts: result.pack.altTexts,
        mimeType: result.mimeType,
        imageBase64: result.imageBase64,
        dataUrl: result.dataUrl,
        zipBase64: result.zipBase64,
        filename: result.filename,
        imageFilename: result.imageFilename,
        zipFilename: result.zipFilename,
        guideFilename: result.guideFilename,
        outputId,
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

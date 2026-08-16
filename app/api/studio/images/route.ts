import { requireCitizenAuth } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { generateStudioImage } from "@/lib/studio/image-engine";
import { generateStudioImageInputSchema } from "@/lib/studio/schemas";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";
import { createCitizenStorageGateway } from "@/lib/studio/citizen-storage";
import { createObjectStoreStudioAssetStorage } from "@/lib/studio/storage";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const citizen = await requireCitizenAuth(request);
    const parsed = generateStudioImageInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Görsel üretim gövdesi geçersiz.", 400, requestId);
    }
    const gateway = createCitizenStorageGateway(citizen.accessToken);
    const ports = createPrismaStudioPorts();
    const result = await generateStudioImage(
      {
        ...ports,
        assetStorage: createObjectStoreStudioAssetStorage(gateway),
      },
      {
        userId: citizen.id,
        prompt: parsed.data.prompt,
        draftId: parsed.data.draftId,
        title: parsed.data.title,
      },
    );
    let previewUrl: string | null = null;
    if (result.asset.storageKind === "object-store" && result.asset.objectPath) {
      try {
        previewUrl = await gateway.createSignedReadUrl(result.asset.objectPath);
      } catch {
        previewUrl = null;
      }
    }
    logEvent({
      level: "info",
      event: "studio.image.settled",
      requestId,
      userId: citizen.id,
      generationId: result.generation.id,
      amountMinor: result.debitMinor,
      route: "/api/studio/images",
    });
    return jsonOk(
      {
        draft: result.draft,
        generation: result.generation,
        asset: {
          id: result.asset.id,
          mimeType: result.asset.mimeType,
          contentHash: result.asset.contentHash,
          promptHash: result.asset.promptHash,
          storageKind: result.asset.storageKind,
          dataBase64: result.asset.dataBase64,
          objectPath: result.asset.objectPath,
          byteSize: result.asset.byteSize,
          previewUrl,
        },
        debitMinor: result.debitMinor,
        remainingMinor: result.remainingMinor,
      },
      200,
      requestId,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "studio.image.failed",
      requestId,
      route: "/api/studio/images",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

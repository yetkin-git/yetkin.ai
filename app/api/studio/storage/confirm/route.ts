import { requireCitizenAuth } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { createCitizenStorageGateway } from "@/lib/studio/citizen-storage";
import { studioConfirmUploadInputSchema } from "@/lib/studio/schemas";
import { confirmStudioUpload } from "@/lib/studio/signed-upload";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const citizen = await requireCitizenAuth(request);
    const parsed = studioConfirmUploadInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Studio onay gövdesi geçersiz.", 400, requestId);
    }
    const ports = createPrismaStudioPorts();
    const gateway = createCitizenStorageGateway(citizen.accessToken);
    const asset = await confirmStudioUpload({
      userId: citizen.id,
      generationId: parsed.data.generationId,
      studio: ports.studio,
      gateway,
    });
    logEvent({
      level: "info",
      event: "studio.storage.confirm",
      requestId,
      userId: citizen.id,
      generationId: parsed.data.generationId,
      route: "/api/studio/storage/confirm",
    });
    return jsonOk(
      {
        asset: {
          id: asset.id,
          mimeType: asset.mimeType,
          contentHash: asset.contentHash,
          promptHash: asset.promptHash,
          storageKind: asset.storageKind,
          bucket: asset.bucket,
          objectPath: asset.objectPath,
          byteSize: asset.byteSize,
        },
      },
      200,
      requestId,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "studio.storage.confirm_failed",
      requestId,
      route: "/api/studio/storage/confirm",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

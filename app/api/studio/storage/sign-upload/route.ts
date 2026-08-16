import { requireCitizenAuth } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { createCitizenStorageGateway } from "@/lib/studio/citizen-storage";
import { studioSignUploadInputSchema } from "@/lib/studio/schemas";
import { signStudioUpload } from "@/lib/studio/signed-upload";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const citizen = await requireCitizenAuth(request);
    const parsed = studioSignUploadInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Studio yükleme gövdesi geçersiz.", 400, requestId);
    }
    const ports = createPrismaStudioPorts();
    const gateway = createCitizenStorageGateway(citizen.accessToken);
    const intent = await signStudioUpload({
      userId: citizen.id,
      generationId: parsed.data.generationId,
      mimeType: parsed.data.mimeType,
      byteSize: parsed.data.byteSize,
      contentHash: parsed.data.contentHash,
      studio: ports.studio,
      gateway,
    });
    logEvent({
      level: "info",
      event: "studio.storage.sign",
      requestId,
      userId: citizen.id,
      generationId: parsed.data.generationId,
      route: "/api/studio/storage/sign-upload",
    });
    return jsonOk(
      {
        bucket: intent.bucket,
        objectPath: intent.objectPath,
        signedPutUrl: intent.signedPutUrl,
        expiresAt: intent.expiresAt,
        mimeType: intent.mimeType,
        maxBytes: intent.maxBytes,
      },
      200,
      requestId,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "studio.storage.sign_failed",
      requestId,
      route: "/api/studio/storage/sign-upload",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

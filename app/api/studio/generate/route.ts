import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { generateStudioContent } from "@/lib/studio/engine";
import { generateStudioInputSchema } from "@/lib/studio/schemas";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const parsed = generateStudioInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Üretim gövdesi geçersiz.", 400, requestId);
    }
    const ports = createPrismaStudioPorts();
    const result = await generateStudioContent(ports, {
      userId: user.id,
      prompt: parsed.data.prompt,
      draftId: parsed.data.draftId,
      title: parsed.data.title,
    });
    logEvent({
      level: "info",
      event: "studio.generate.settled",
      requestId,
      userId: user.id,
      generationId: result.generation.id,
      amountMinor: result.debitMinor,
      route: "/api/studio/generate",
    });
    return jsonOk(
      {
        draft: result.draft,
        generation: result.generation,
        debitMinor: result.debitMinor,
        remainingMinor: result.remainingMinor,
      },
      200,
      requestId,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "studio.generate.failed",
      requestId,
      route: "/api/studio/generate",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

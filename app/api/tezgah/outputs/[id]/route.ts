import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { getPrisma } from "@/lib/kernel/db";

/**
 * Tek arşiv kaydı. Oturum + sahiplik. `outputContent` yalnız sahibine döner.
 */
export const auth = "session" as const;

const OUTPUT_ID = /^[A-Za-z0-9_-]{8,80}$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id: rawId } = await context.params;
    const id = rawId.trim();
    if (!OUTPUT_ID.test(id)) {
      return jsonFail("Arşiv kaydı bulunamadı.", 404, requestId, request);
    }
    const row = await getPrisma().tezgahOutput.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        toolKey: true,
        title: true,
        inputSummary: true,
        outputContent: true,
        createdAt: true,
      },
    });
    if (!row) {
      return jsonFail("Arşiv kaydı bulunamadı.", 404, requestId, request);
    }
    return jsonOk(
      {
        id: row.id,
        toolKey: row.toolKey,
        title: row.title,
        inputSummary: row.inputSummary,
        outputContent: row.outputContent,
        createdAt: row.createdAt.toISOString(),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

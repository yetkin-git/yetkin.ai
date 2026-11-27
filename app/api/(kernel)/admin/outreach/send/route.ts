import { sendOutreachDraft } from "@/lib/kernel/outreach/write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Tek gönderim. `testTo` doluysa alıcı odur ve taslak durumu **değişmez**.
 * Ayar kapalıyken gerçek gönderim 409; test gönderimi ayar şalterini atlar
 * (ama gönderen alan adı, kara liste ve metin kapısını atlamaz).
 */
export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.id !== "string") {
      throw new BadRequestError("Taslak kimliği yok.");
    }
    const result = await sendOutreachDraft({
      actorUserId: session.id,
      id: body.id.trim(),
      testTo: typeof body.testTo === "string" && body.testTo.trim() ? body.testTo.trim() : undefined,
    });
    return jsonOk(
      { id: body.id.trim(), sent: result.sent, sentToday: result.sentToday },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

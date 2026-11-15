import { sendB2bDraft } from "@/lib/kernel/admin/b2b-write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 30;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.id !== "string" || typeof body.subject !== "string" || typeof body.body !== "string") {
      throw new BadRequestError("Taslak, konu ve metin gerekli.");
    }
    const result = await sendB2bDraft({
      actorUserId: session.id,
      id: body.id.trim(),
      subject: body.subject,
      body: body.body,
    });
    return jsonOk({ id: body.id.trim(), status: "SENT", sentToday: result.sentToday }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

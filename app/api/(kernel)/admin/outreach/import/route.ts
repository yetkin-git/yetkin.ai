import { importOutreachTargets } from "@/lib/kernel/outreach/write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Kurumsal hedef listesi. CSV metni veya satır satır yapıştırma.
 * Dosyayı tarayıcı okur; gövde `{ text }` olur. Kara liste ve şahsi kutu elenir.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.text !== "string") {
      throw new BadRequestError("Liste yok.");
    }
    const result = await importOutreachTargets({
      actorUserId: session.id,
      text: body.text,
    });
    return jsonOk(result, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

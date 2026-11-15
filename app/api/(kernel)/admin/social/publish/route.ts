import { publishSocialQueueItem } from "@/lib/kernel/admin/social-write";
import { validateSocialEdit } from "@/lib/kernel/admin/social-desk";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const edit = validateSocialEdit(body);
    if (!edit.ok) {
      throw new BadRequestError(edit.reason);
    }
    const result = await publishSocialQueueItem(edit.value);
    return jsonOk(
      {
        published: result.published,
        status: result.status,
        reason: result.reason,
        externalPostId: result.externalPostId,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

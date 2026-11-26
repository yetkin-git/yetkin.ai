import {
  parseKurumsalOfferPatchBody,
  patchKurumsalOfferRequest,
} from "@/lib/kernel/admin/kurumsal-offer-write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

/**
 * Kurumsal teklif talebi durum güncellemesi (F2.4).
 * Outbound B2B kuyruğundan ayrıdır; yalnız `kurumsal_offer_requests` satırını yazar.
 */
export const auth = "admin" as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const session = await requireSuperAdmin(request);
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseKurumsalOfferPatchBody(body);
    if ("error" in parsed) {
      return jsonFail(parsed.error, 400, requestId, request);
    }
    const row = await patchKurumsalOfferRequest({
      actor: session,
      id,
      status: parsed.status,
      adminNote: parsed.adminNote,
    });
    return jsonOk({ request: row }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

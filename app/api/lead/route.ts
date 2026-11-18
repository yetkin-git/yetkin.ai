import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { applyHttpRateLimit, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { getPrisma } from "@/lib/kernel/db";
import { isKurumsalOfferPackage } from "@/lib/sales/kurumsal-offer-packages";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kurumsal teklif. Oda açılmaz. Gönderim kuyruğuna düşmez. */
export const auth = "public" as const;

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const limit = await applyHttpRateLimit(request, {
    keyPrefix: "kurumsal-lead",
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) {
    return rateLimitedJsonResponse(limit, request);
  }
  try {
    const body: unknown = await request.json().catch(() => null);
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? body : null;
    const companyName = clip(record && "companyName" in record ? record.companyName : "", 120);
    const email = clip(record && "email" in record ? record.email : "", 160).toLowerCase();
    const city = clip(record && "city" in record ? record.city : "", 80);
    const note = clip(record && "note" in record ? record.note : "", 500);
    const packageKey = clip(record && "packageKey" in record ? record.packageKey : "", 40);
    if (companyName.length < 2 || city.length < 2) {
      return jsonFail("Firma adı ve il gerekli.", 400, requestId, request);
    }
    if (!EMAIL_RE.test(email)) {
      return jsonFail("E-posta adresi geçersiz.", 400, requestId, request);
    }
    if (!isKurumsalOfferPackage(packageKey)) {
      return jsonFail("Paket seçin.", 400, requestId, request);
    }
    await getPrisma().kurumsalOfferRequest.create({
      data: { companyName, email, city, note, packageKey },
    });
    return jsonOk({ received: true }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

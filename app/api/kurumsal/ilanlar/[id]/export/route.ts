import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { applyHttpRateLimit, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import {
  buildKurumsalShortlistCsv,
  kurumsalShortlistCsvContentDisposition,
} from "@/lib/sales/kurumsal-shortlist-csv";
import { loadKurumsalShortlistCsvRows } from "@/lib/sales/kurumsal-screening-load";

/**
 * Kısa liste CSV dışa aktarımı (F1.5 / Y-06).
 * Ham `cvSummary` metni **dahil edilmez**. UTF-8 BOM + formül kaçışı.
 * Sahiplik: `ownerUserId` filtresi — çapraz işveren 404.
 */
export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    // Kova kullanıcı bazlı; paylaşılan IP kotayı bölmez.
    const limit = await applyHttpRateLimit(request, {
      keyPrefix: "kurumsal-ilan-export",
      limit: 12,
      windowMs: 10 * 60_000,
    }, user.id);
    if (!limit.allowed) {
      return rateLimitedJsonResponse(limit, request);
    }
    const { id } = await context.params;
    const format = new URL(request.url).searchParams.get("format")?.trim().toLowerCase() ?? "";
    if (format !== "csv") {
      throw new BadRequestError("Yalnız format=csv desteklenir.");
    }
    const { title, rows } = await loadKurumsalShortlistCsvRows({
      ownerUserId: user.id,
      jobId: id,
    });
    const csv = buildKurumsalShortlistCsv(rows);
    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        // Başlık değeri daima ASCII taşır; Türkçe ad `filename*` ile gider (ByteString sınırı).
        "content-disposition": kurumsalShortlistCsvContentDisposition(title),
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

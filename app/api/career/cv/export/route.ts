import { buildCareerCvDocx, buildCareerCvPdf, careerCvFilename } from "@/lib/career/cv-document";
import { loadCareerCv } from "@/lib/career/cv-store";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** A4 PDF veya DOCX CV indirme. Türkçe glifler yetkinhibe motorundan. */
export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const url = new URL(request.url);
    const format = url.searchParams.get("format") === "docx" ? "docx" : "pdf";
    const cv = await loadCareerCv(user.id);
    if (!cv.fullName.trim()) {
      throw new BadRequestError("Önce CV'ni kaydet.");
    }
    const bytes = format === "docx" ? buildCareerCvDocx(cv) : buildCareerCvPdf(cv);
    const filename = careerCvFilename(cv, format);
    const contentType =
      format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

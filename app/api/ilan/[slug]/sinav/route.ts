import { gradeAcademyExam } from "@/lib/academy/exam";
import { parseYetkinCvSubmit } from "@/lib/career/yetkincv";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { applyHttpRateLimit, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { submitKurumsalJobExam } from "@/lib/sales/kurumsal-screening-load";

/** YetkinCV teslimi. Puan akademi sınav motorundan gelir. CV metni yanıtta yoktur. */
export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const requestId = resolveRequestId(request);
  const limit = await applyHttpRateLimit(request, {
    keyPrefix: "kurumsal-ilan-submit",
    limit: 8,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) {
    return rateLimitedJsonResponse(limit, request);
  }
  try {
    const user = await requireSession(request);
    const { slug } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseYetkinCvSubmit(body);
    if (!parsed.ok) {
      throw new BadRequestError(parsed.error);
    }
    const result = await submitKurumsalJobExam({
      slug,
      userId: user.id,
      sittingId: parsed.value.sittingId,
      answers: parsed.value.answers,
      gradeWithEngine(questions, answers) {
        return gradeAcademyExam([...questions], [...answers]);
      },
    });
    return jsonOk(result, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

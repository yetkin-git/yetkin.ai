import { gradeAcademyExam } from "@/lib/academy/exam";
import { parseYetkinCvStart, parseYetkinCvSubmit } from "@/lib/career/yetkincv";
import { sealYetkinCvSitting, startYetkinCvSitting } from "@/lib/career/yetkincv-store";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

/** YetkinCV vaka testi. Puan akademi sınav motorundan gelir. Cüzdan yazılmaz. */
export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestError("İstek gövdesi okunamadı.");
    }
    const action = (body as { action?: unknown }).action;
    if (action === "start") {
      const parsed = parseYetkinCvStart(body);
      if (!parsed.ok) {
        throw new BadRequestError(parsed.error);
      }
      const started = await startYetkinCvSitting({
        userId: user.id,
        roleId: parsed.value.roleId,
        verticalId: parsed.value.verticalId,
        cvText: parsed.value.cvText,
      });
      return jsonOk(started, 200, requestId, request);
    }
    if (action === "submit") {
      const parsed = parseYetkinCvSubmit(body);
      if (!parsed.ok) {
        throw new BadRequestError(parsed.error);
      }
      const card = await sealYetkinCvSitting({
        userId: user.id,
        sittingId: parsed.value.sittingId,
        answers: parsed.value.answers,
        gradeWithEngine(questions) {
          return gradeAcademyExam([...questions], parsed.value.answers);
        },
      });
      return jsonOk({ card }, 200, requestId, request);
    }
    throw new BadRequestError("İşlem start veya submit olmalıdır.");
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

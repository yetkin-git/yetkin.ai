import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { railV1JuniorPilotPracticeRequestSchema } from "@/lib/kernel/http/v1-contract";
import { canonicalJuniorLessonKey } from "@/lib/junior/lesson-key-alias";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { submitJuniorPractice } from "@/lib/junior/service";

export const auth = "session" as const;

/** Sözleşme şeması tek kaynaktır. Ders anahtarı kanonikleştirme yazmadan önce uygulanır. */

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const parsed = railV1JuniorPilotPracticeRequestSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return jsonFail("Cevaplar okunamadı.", 400, requestId, request);
    }
    const result = await submitJuniorPractice(createPrismaJuniorStore(), {
      userId: user.id,
      profileId: parsed.data.profileId,
      lessonKey: canonicalJuniorLessonKey(parsed.data.lessonKey),
      answers: parsed.data.answers,
      actor: user,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        praised: result.data.praised,
        missing: result.data.missing,
        advice: result.data.advice,
        score: result.data.score,
        xpAwarded: result.data.xpAwarded,
        points: result.data.points,
        badges: result.data.badges,
        correct: result.data.correct,
        total: result.data.total,
        notes: result.data.notes,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

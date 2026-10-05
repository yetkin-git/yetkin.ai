import { z } from "zod";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { submitJuniorQuiz } from "@/lib/junior/service";

export const auth = "session" as const;

const quizSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
    lessonKey: z.string().trim().min(1).max(80),
    answers: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).max(40),
            choiceIndex: z.number().int().min(0).max(8).optional(),
          })
          .strict(),
      )
      .max(16),
  })
  .strict();

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const parsed = quizSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Cevaplar okunamadı.", 400, requestId, request);
    }
    const result = await submitJuniorQuiz(createPrismaJuniorStore(), {
      userId: user.id,
      profileId: parsed.data.profileId,
      lessonKey: parsed.data.lessonKey,
      answers: parsed.data.answers,
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
        completed: result.data.completed,
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

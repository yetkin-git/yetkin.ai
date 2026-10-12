import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { railV1JuniorLessonPracticeRequestSchema } from "@/lib/kernel/http/v1-contract";
import { juniorLessonStatus } from "@/lib/junior/chain";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { submitJuniorPractice } from "@/lib/junior/service";

export const auth = "session" as const;

/** Pekiştirme. Puan, kapıdan geçen profilin ilerleme satırına yazılır. */
export async function POST(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const { key } = await context.params;
    const lessonKey = key.trim();
    const parsed = railV1JuniorLessonPracticeRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Cevaplar okunamadı.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/junior/lessons/practice",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          lessonKey,
          profileId: parsed.data.profileId,
          answers: parsed.data.answers,
        }),
        requestId,
        request,
      },
      async () => {
        const store = createPrismaJuniorStore();
        const result = await submitJuniorPractice(store, {
          userId: user.id,
          profileId: parsed.data.profileId,
          lessonKey,
          answers: parsed.data.answers,
          actor: {
            id: user.id,
            email: user.email,
            emailConfirmedAt: user.emailConfirmedAt,
          },
        });
        if (!result.ok) {
          return { status: result.status, body: { error: result.error } };
        }
        const rows = await store.listProgress(user.id, parsed.data.profileId);
        const status = juniorLessonStatus(rows, lessonKey);
        return {
          status: 200,
          body: {
            result: {
              praised: result.data.praised,
              missing: result.data.missing,
              advice: result.data.advice,
              score: result.data.score,
              xpAwarded: result.data.xpAwarded,
              points: result.data.points,
              correct: result.data.correct,
              total: result.data.total,
              status: status === "done" ? "done" : status === "going" ? "going" : "fresh",
            },
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

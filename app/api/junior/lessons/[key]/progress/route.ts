import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { railV1JuniorLessonProgressRequestSchema } from "@/lib/kernel/http/v1-contract";
import { canonicalJuniorLessonKey } from "@/lib/junior/lesson-key-alias";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { recordJuniorListenProgress } from "@/lib/junior/service";

export const auth = "session" as const;

/** Dinleme ilerlemesi. Aynı Idempotency-Key ikinci satır yazmaz. */
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
    const lessonKey = canonicalJuniorLessonKey(key);
    const parsed = railV1JuniorLessonProgressRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("İlerleme kaydı okunamadı.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/junior/lessons/progress",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          lessonKey,
          profileId: parsed.data.profileId,
        }),
        requestId,
        request,
      },
      async () => {
        const saved = await recordJuniorListenProgress(createPrismaJuniorStore(), {
          userId: user.id,
          profileId: parsed.data.profileId,
          lessonKey,
          actor: {
            id: user.id,
            email: user.email,
            emailConfirmedAt: user.emailConfirmedAt,
          },
        });
        if (!saved.ok) {
          return { status: saved.status, body: { error: saved.error } };
        }
        return {
          status: 200,
          body: { progress: saved.data },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { logEvent } from "@/lib/kernel/observability/log";
import { purchaseAcademyCourse } from "@/lib/academy/engine";
import { purchaseCourseInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId);
    }
    const parsed = purchaseCourseInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Satın alma gövdesi geçersiz.", 400, requestId);
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const courseId = course?.id ?? id;

    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/academy/courses/[id]/purchase",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ courseId, lockId: parsed.data.lockId }),
        requestId,
      },
      async () => {
        const result = await purchaseAcademyCourse(ports, {
          courseId,
          userId: user.id,
          lockId: parsed.data.lockId,
        });
        logEvent({
          level: "info",
          event: "academy.purchase.settled",
          requestId,
          userId: user.id,
          applied: result.applied,
          route: "/api/academy/courses/[id]/purchase",
        });
        return {
          status: 200,
          body: {
            applied: result.applied,
            purchase: {
              id: result.purchase.id,
              courseId: result.purchase.courseId,
              amountMinor: result.purchase.amountMinor,
              status: result.purchase.status,
            },
            certificate: result.certificate
              ? {
                  id: result.certificate.id,
                  serialKey: result.certificate.serialKey,
                }
              : null,
          },
        };
      },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "academy.purchase.failed",
      requestId,
      route: "/api/academy/courses/[id]/purchase",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId);
  }
}

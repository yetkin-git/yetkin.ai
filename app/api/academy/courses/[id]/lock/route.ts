import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { lockAcademyCoursePrice } from "@/lib/academy/engine";
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
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const courseId = course?.id ?? id;
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/academy/courses/[id]/lock",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({ courseId }),
        requestId,
        request,
      },
      async () => {
        const result = await lockAcademyCoursePrice(ports, {
          courseId,
          userId: user.id,
        });
        return {
          status: 200,
          body: {
            course: {
              id: result.course.id,
              slug: result.course.slug,
              title: result.course.title,
            },
            lock: {
              id: result.lock.id,
              amountMinor: result.lock.amountMinor,
              currencyCode: result.lock.currencyCode,
              expiresAt: result.lock.expiresAt.toISOString(),
            },
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

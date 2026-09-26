import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { loadOff101ExemptionExam, submitOff101ExemptionExam } from "@/lib/academy/off101-exemption";
import { submitAcademyExamInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const view = await loadOff101ExemptionExam(ports, course.id, user.id);
    return jsonOk(
      {
        exam: view.exam,
        questions: view.questions,
        sessionToken: view.sessionToken,
        expiresAt: view.expiresAt.toISOString(),
        durationMs: view.durationMs,
        drawCount: view.drawCount,
        seal: view.seal
          ? { title: view.seal.title, score: view.seal.score }
          : null,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

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
    const parsed = submitAcademyExamInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Sınav cevapları geçersiz.", 400);
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const courseId = course?.id ?? id;
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/academy/courses/[id]/exemption",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          courseId,
          answers: parsed.data.answers,
          sessionToken: parsed.data.sessionToken,
          timedOut: parsed.data.timedOut ?? false,
        }),
        requestId,
        request,
      },
      async () => {
        const result = await submitOff101ExemptionExam(ports, {
          courseId,
          userId: user.id,
          answers: parsed.data.answers,
          sessionToken: parsed.data.sessionToken,
          timedOut: parsed.data.timedOut,
        });
        return {
          status: 200,
          body: {
            passed: result.passed,
            score: result.score,
            certificate: null,
            visaStamp: null,
            seal: result.seal ? { title: result.seal.title, score: result.seal.score } : null,
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

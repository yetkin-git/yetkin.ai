import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { loadAcademyExam, submitAcademyExam } from "@/lib/academy/exam-engine";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { submitAcademyExamInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { tryIssueCareerVisaStamp } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";

export const auth = "session" as const;

function publicExamCertificate(
  certificate: {
    id: string;
    certificateHash: string | null;
    serialKey: string;
    score: number | null;
  } | null,
) {
  if (!certificate) {
    return null;
  }
  return {
    id: certificate.id,
    certificateHash: certificate.certificateHash,
    serialKey: certificate.serialKey,
    score: certificate.score,
  };
}

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
    const view = await loadAcademyExam(ports, course.id, user.id, undefined, user.email);
    if (!view) {
      return jsonFail("Sınav için bu eğitimi satın almış olman gerekir.", 403);
    }
    return jsonOk(
      {
        exam: view.exam,
        questions: view.questions,
        purchaseId: view.purchaseId,
        certificate: publicExamCertificate(view.certificate),
        sessionToken: view.sessionToken,
        expiresAt: view.expiresAt.toISOString(),
        durationMs: view.durationMs,
        drawCount: view.drawCount,
        proofLessonKey: view.proofLessonKey,
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
        route: "/api/academy/courses/[id]/exam",
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
        const result = await submitAcademyExam(ports, {
          courseId,
          userId: user.id,
          email: user.email,
          answers: parsed.data.answers,
          sessionToken: parsed.data.sessionToken,
          timedOut: parsed.data.timedOut,
          proof: parsed.data.proof,
        });
        const visa =
          result.certificate != null
            ? await tryIssueCareerVisaStamp(createPrismaCareerPorts(), {
                sourceKind: "ACADEMY_CERTIFICATE",
                sourceId: result.certificate.id,
                actorUserId: user.id,
              })
            : null;
        return {
          status: 200,
          body: {
            passed: result.passed,
            score: result.score,
            passScore: ACADEMY_EXAM_PASS_SCORE,
            attempt: {
              id: result.attempt.id,
              score: result.attempt.score,
              passed: result.attempt.passed,
              submittedAt: result.attempt.submittedAt.toISOString(),
            },
            certificate: result.certificate
              ? {
                  id: result.certificate.id,
                  certificateHash: result.certificate.certificateHash,
                  serialKey: result.certificate.serialKey,
                  score: result.certificate.score,
                }
              : null,
            visaStamp: visa?.stamp
              ? {
                  id: visa.stamp.id,
                  title: visa.stamp.title,
                  visaKey: visa.stamp.visaKey,
                }
              : null,
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

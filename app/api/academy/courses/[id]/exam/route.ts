import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { loadPublicAcademyExam, submitAcademyExam } from "@/lib/academy/exam-engine";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { submitAcademyExamInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { tryIssueCareerVisaStamp } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";

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
    const view = await loadPublicAcademyExam(ports, course.id, user.id);
    if (!view) {
      return jsonFail("Sınav için SETTLED satın alma ve tamamlanmış müfredat gerekir.", 403);
    }
    return jsonOk({
      exam: view.exam,
      questions: view.questions,
      purchaseId: view.purchaseId,
      certificate: view.certificate,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = submitAcademyExamInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Sınav cevapları geçersiz.", 400);
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const result = await submitAcademyExam(ports, {
      courseId: course?.id ?? id,
      userId: user.id,
      answers: parsed.data.answers,
    });
    const visa =
      result.certificate != null
        ? await tryIssueCareerVisaStamp(createPrismaCareerPorts(), {
            sourceKind: "ACADEMY_CERTIFICATE",
            sourceId: result.certificate.id,
            actorUserId: user.id,
          })
        : null;
    return jsonOk({
      passed: result.passed,
      score: result.score,
      passScore: ACADEMY_EXAM_PASS_SCORE,
      attempt: {
        id: result.attempt.id,
        score: result.attempt.score,
        passed: result.attempt.passed,
        submittedAt: result.attempt.submittedAt,
      },
      certificate: result.certificate,
      visaStamp: visa?.stamp ?? null,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

import { gradeOff101ExemptionPreview, loadOff101ExemptionPreview } from "@/lib/academy/off101-exemption";
import { submitAcademyExamInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "public" as const;

/**
 * Kayıtsız seviye tespiti. Puan sunucuda hesaplanır.
 * AcademyExemptionSeal ve sınav oturum satırı yazılmaz.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const view = await loadOff101ExemptionPreview(ports, course.id);
    return jsonOk(
      {
        exam: view.exam,
        questions: view.questions,
        sessionToken: view.sessionToken,
        expiresAt: view.expiresAt.toISOString(),
        durationMs: view.durationMs,
        drawCount: view.drawCount,
        seal: null,
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
  try {
    const { id } = await context.params;
    const parsed = submitAcademyExamInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Sınav cevapları geçersiz.", 400);
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const result = await gradeOff101ExemptionPreview(ports, {
      courseId: course.id,
      answers: parsed.data.answers,
      sessionToken: parsed.data.sessionToken,
      timedOut: parsed.data.timedOut,
    });
    return jsonOk(
      {
        passed: result.passed,
        score: result.score,
        gaps: result.gaps,
        certificate: null,
        visaStamp: null,
        seal: null,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import {
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
import { completeAcademyLessonInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

function publicPlayer(player: Awaited<ReturnType<typeof loadAcademyCurriculumPlayer>>) {
  return {
    courseId: player.courseId,
    courseSlug: player.courseSlug,
    courseTitle: player.courseTitle,
    purchaseId: player.purchaseId,
    completedCount: player.completedCount,
    totalCount: player.totalCount,
    curriculumComplete: player.curriculumComplete,
    workTasksComplete: player.workTasksComplete,
    curriculumProofHash: player.curriculumProofHash,
    nextLessonKey: player.nextLessonKey,
    certificate: player.certificate
      ? {
          id: player.certificate.id,
          certificateHash: player.certificate.certificateHash,
          score: player.certificate.score,
        }
      : null,
    lessons: player.lessons.map((lesson) => ({
      key: lesson.key,
      order: lesson.order,
      title: lesson.title,
      body: lesson.body,
      completed: lesson.completed,
      open: lesson.open,
      completedAt: lesson.completedAt ? lesson.completedAt.toISOString() : null,
    })),
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
    const player = await loadAcademyCurriculumPlayer(ports, {
      courseId: course.id,
      userId: user.id,
      email: user.email,
    });
    return jsonOk({ player: publicPlayer(player) });
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
    const parsed = completeAcademyLessonInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Ders anahtarı veya iş kanıtı geçersiz.", 400);
    }
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const result = await completeAcademyLesson(ports, {
      courseId: course.id,
      userId: user.id,
      email: user.email,
      lessonKey: parsed.data.lessonKey,
      proof: parsed.data.proof,
    });
    return jsonOk({
      applied: result.applied,
      player: publicPlayer(result.player),
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

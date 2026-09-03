import { requireSession, sessionUserNotInDatabaseMessage } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import {
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
  lookupAcademyCurriculumCourse,
} from "@/lib/academy/curriculum-engine";
import { completeAcademyLessonInputSchema } from "@/lib/academy/schemas";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import {
  DATABASE_BUSY_ERROR,
  isPrismaClientError,
  isPrismaForeignKeyViolation,
  isPrismaUniqueViolation,
  isPrismaUnavailableError,
} from "@/lib/kernel/db-errors";
import { ensurePrismaQueryEngine } from "@/lib/kernel/db";

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

async function loadPublicPlayerOrBusy(
  ports: ReturnType<typeof createPrismaAcademyPorts>,
  command: { courseId: string; userId: string; email?: string | null },
  applied: boolean,
) {
  try {
    const player = await loadAcademyCurriculumPlayer(ports, command);
    return jsonOk({
      applied,
      player: publicPlayer(player),
    });
  } catch (error) {
    if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
      return jsonFail(DATABASE_BUSY_ERROR, 503);
    }
    throw error;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    if (!(await ensurePrismaQueryEngine())) {
      return jsonFail(DATABASE_BUSY_ERROR, 503);
    }
    const ports = createPrismaAcademyPorts();
    const course = await lookupAcademyCurriculumCourse(ports.academy, id);
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    try {
      const player = await loadAcademyCurriculumPlayer(ports, {
        courseId: course.id,
        userId: user.id,
        email: user.email,
      });
      return jsonOk({ player: publicPlayer(player) });
    } catch (error) {
      if (isPrismaForeignKeyViolation(error)) {
        return jsonFail(sessionUserNotInDatabaseMessage(), 401);
      }
      if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
        return jsonFail(DATABASE_BUSY_ERROR, 503);
      }
      throw error;
    }
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
    if (!(await ensurePrismaQueryEngine())) {
      return jsonFail(DATABASE_BUSY_ERROR, 503);
    }
    const ports = createPrismaAcademyPorts();
    const course = await lookupAcademyCurriculumCourse(ports.academy, id);
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const actor = {
      courseId: course.id,
      userId: user.id,
      email: user.email,
    };
    try {
      const result = await completeAcademyLesson(ports, {
        ...actor,
        lessonKey: parsed.data.lessonKey,
        proof: parsed.data.proof,
      });
      return jsonOk({
        applied: result.applied,
        player: publicPlayer(result.player),
      });
    } catch (error) {
      if (isPrismaForeignKeyViolation(error)) {
        return jsonFail(sessionUserNotInDatabaseMessage(), 401);
      }
      if (isPrismaUniqueViolation(error)) {
        return loadPublicPlayerOrBusy(ports, actor, false);
      }
      if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
        return jsonFail(DATABASE_BUSY_ERROR, 503);
      }
      throw error;
    }
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      return jsonFail(sessionUserNotInDatabaseMessage(), 401);
    }
    if (isPrismaUnavailableError(error) || isPrismaClientError(error)) {
      return jsonFail(DATABASE_BUSY_ERROR, 503);
    }
    return jsonFromUnknown(error);
  }
}

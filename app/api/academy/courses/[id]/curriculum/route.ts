import { requireSession, sessionUserNotInDatabaseMessage } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
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
      body: lesson.open ? lesson.body : "",
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
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
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
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: "/api/academy/courses/[id]/curriculum",
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          courseId: course.id,
          lessonKey: parsed.data.lessonKey,
        }),
        requestId,
        request,
      },
      async () => {
        try {
          const result = await completeAcademyLesson(ports, {
            ...actor,
            lessonKey: parsed.data.lessonKey,
            proof: parsed.data.proof,
          });
          return {
            status: 200,
            body: {
              applied: result.applied,
              player: publicPlayer(result.player),
            },
          };
        } catch (error) {
          if (isPrismaUniqueViolation(error)) {
            const player = await loadAcademyCurriculumPlayer(ports, actor);
            return {
              status: 200,
              body: { applied: false, player: publicPlayer(player) },
            };
          }
          throw error;
        }
      },
    );
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

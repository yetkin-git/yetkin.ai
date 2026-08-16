import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { lockAcademyCoursePrice } from "@/lib/academy/engine";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    const result = await lockAcademyCoursePrice(ports, {
      courseId: course?.id ?? id,
      userId: user.id,
    });
    return jsonOk({ course: result.course, lock: result.lock });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

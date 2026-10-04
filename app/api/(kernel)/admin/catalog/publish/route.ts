import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { runCoursePublish } from "@/lib/kernel/admin/course-publish";
import { createPrismaCoursePublishStore } from "@/lib/kernel/admin/prisma-course-publish";

export const auth = "admin" as const;

export async function PATCH(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    return await runCoursePublish({
      session,
      body,
      getStore: createPrismaCoursePublishStore,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

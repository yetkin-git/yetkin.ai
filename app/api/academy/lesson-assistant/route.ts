import { hasAcademyLockedLessonContentAccess } from "@/lib/academy/access";
import { answerAcademyLessonAssistant, lessonAssistantRequestSchema } from "@/lib/academy/lesson-assistant";
import { loadCourseBySlug, loadPurchaseForUserCourse } from "@/lib/academy/load";
import { isAcademyFreePreviewLessonKey } from "@/lib/academy/purchase-path";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const parsed = lessonAssistantRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Soruyu kısa ve net yaz.", 400, requestId, request);
    }
    const course = await loadCourseBySlug(parsed.data.courseSlug);
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404, requestId, request);
    }
    const purchase = await loadPurchaseForUserCourse(
      user.id,
      course.course.id,
      user.email,
    );
    const commercialEnrolment = hasAcademyLockedLessonContentAccess(purchase, new Date(), {
      userId: user.id,
      email: user.email,
    });
    if (!isAcademyFreePreviewLessonKey(parsed.data.lessonKey) && !commercialEnrolment) {
      return jsonFail("Satın alma mühürlenmeden ders içeriği açılmaz.", 403, requestId, request);
    }
    const result = await answerAcademyLessonAssistant({
      userId: user.id,
      courseSlug: parsed.data.courseSlug,
      lessonKey: parsed.data.lessonKey,
      currentTimeSec: parsed.data.currentTimeSec,
      question: parsed.data.question,
      commercialEnrolment,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        reply: result.reply,
        remaining: result.remaining,
        limit: result.limit,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

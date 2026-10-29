import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";
import { resolveAcademyEntitlement } from "@/lib/academy/access";
import {
  ACADEMY_LESSON_ASSISTANT_FOREIGN,
  ACADEMY_LESSON_ASSISTANT_LOCKED,
  answerAcademyLessonAssistant,
  lessonAssistantRequestSchema,
} from "@/lib/academy/lesson-assistant";
import { loadCourseBySlug, loadPurchaseForUserCourse } from "@/lib/academy/load";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { applyHttpRateLimit, HTTP_RATE_LIMITS, rateLimitedJsonResponse, resolveRequestIp } from "@/lib/kernel/security/http-rate-limit";

/**
 * Anonim ziyaretçi ücretsiz ders önizlemesinde asistanı kullanabilir.
 * Kenar map'inde `public` görünür; asistan kapısı handler'dadır:
 * - oturum yoksa YALNIZ ücretsiz kapı dersi (`academyCourseOffersFreePreview`) açılır,
 * - kova istemci IP'sidir, günlük ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT soru,
 * - kilitli ders ve yabancı ders anahtarı aynı saf kararla 403 döner.
 * Oturumlu kullanıcı bugünkü davranışı korur (kenar oturum ister).
 */
export const auth = "public" as const;

function guestIdentity(request: Request): string {
  // `resolveRequestIp` güvenilir proxy zincirini okur; ham XFF istemci spoof'una açıktır.
  return resolveRequestIp(request);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const parsed = lessonAssistantRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Soruyu kısa ve net yaz.", 400, requestId, request);
    }

    const user = await requireSession(request).catch(() => null);

    if (!user) {
      // Anonim: yalnız ücretsiz önizleme dersi. LLM ucu olduğu için IP kovası ayrıca dar.
      const burst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmIp);
      if (!burst.allowed) {
        return rateLimitedJsonResponse(burst, request);
      }
      if (!academyCourseOffersFreePreview(parsed.data.courseSlug)) {
        return jsonFail(ACADEMY_LESSON_ASSISTANT_LOCKED, 403, requestId, request);
      }
      const course = await loadCourseBySlug(parsed.data.courseSlug);
      if (!course) {
        return jsonFail("Kurs bulunamadı.", 404, requestId, request);
      }
      const guest = resolveAcademyEntitlement({
        actor: null,
        purchase: null,
        courseSlug: parsed.data.courseSlug,
        lessonKey: parsed.data.lessonKey,
        now: new Date(),
      });
      if (!guest.lessonBelongsToCourse) {
        return jsonFail(ACADEMY_LESSON_ASSISTANT_FOREIGN, 403, requestId, request);
      }
      if (!guest.open) {
        return jsonFail(ACADEMY_LESSON_ASSISTANT_LOCKED, 403, requestId, request);
      }
      const guestResult = await answerAcademyLessonAssistant({
        userId: `guest:${requestId}`,
        guestId: guestIdentity(request),
        courseSlug: parsed.data.courseSlug,
        lessonKey: parsed.data.lessonKey,
        currentTimeSec: parsed.data.currentTimeSec,
        question: parsed.data.question,
        commercialEnrolment: false,
      });
      if (!guestResult.ok) {
        return jsonFail(guestResult.error, guestResult.status, requestId, request);
      }
      return jsonOk(
        {
          reply: guestResult.reply,
          remaining: guestResult.remaining,
          limit: guestResult.limit,
          guest: true,
        },
        200,
        requestId,
        request,
      );
    }

    const course = await loadCourseBySlug(parsed.data.courseSlug);
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404, requestId, request);
    }
    const purchase = await loadPurchaseForUserCourse(
      user.id,
      course.course.id,
      user.email,
      user.emailConfirmedAt,
    );
    const entitlement = resolveAcademyEntitlement({
      actor: {
        userId: user.id,
        email: user.email,
        emailConfirmedAt: user.emailConfirmedAt,
      },
      purchase,
      courseSlug: parsed.data.courseSlug,
      lessonKey: parsed.data.lessonKey,
      now: new Date(),
    });
    if (!entitlement.lessonBelongsToCourse) {
      return jsonFail(ACADEMY_LESSON_ASSISTANT_FOREIGN, 403, requestId, request);
    }
    if (!entitlement.open) {
      return jsonFail(ACADEMY_LESSON_ASSISTANT_LOCKED, 403, requestId, request);
    }
    const result = await answerAcademyLessonAssistant({
      userId: user.id,
      courseSlug: parsed.data.courseSlug,
      lessonKey: parsed.data.lessonKey,
      currentTimeSec: parsed.data.currentTimeSec,
      question: parsed.data.question,
      commercialEnrolment: entitlement.commercialEnrolment || entitlement.reason === "admin-bypass",
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

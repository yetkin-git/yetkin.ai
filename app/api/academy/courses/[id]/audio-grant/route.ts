import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { hasPurchased, resolveSettledAcademyPurchase } from "@/lib/academy/access";
import { lookupAcademyCurriculumCourse } from "@/lib/academy/curriculum-engine";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonBedIsHardMixed,
  academyLessonBedPlaybackSrc,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import { ensureAcademySealedStorageSigner } from "@/lib/academy/academy-sealed-storage";
import { resolveAcademyMediaRead, withAcademyAudioGrant } from "@/lib/academy/lesson-audio-grant";
import {
  academyPrepStripForSlug,
  isAcademyPrepStripAudioSealed,
  isAcademyPrepStripKey,
} from "@/lib/academy/prep-strip";
import { isAcademyLessonAudioSealed, isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

function lessonAudioEligible(courseSlug: string, lessonKey: string): boolean {
  if (isAcademyTtsCassetteRevoked(lessonKey)) {
    return false;
  }
  if (isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return true;
  }
  const strip = academyPrepStripForSlug(courseSlug);
  return (
    isAcademyPrepStripKey(lessonKey) &&
    isAcademyPrepStripAudioSealed(courseSlug) &&
    strip?.key === lessonKey
  );
}

/**
 * Satın alınmış dersin kısa ömürlü ses adresi.
 * Satın alma yoksa 403. Adres üretilemezse 503; başka dersin sesi konmaz.
 * local: kenar aynı imzayı ister. storage: özel kovanın 4 saatlik adresi.
 * Bu yanıt dosyanın kendisini taşımaz.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const lessonKey = new URL(request.url).searchParams.get("lesson")?.trim() ?? "";
    if (!lessonKey) {
      return jsonFail("Ders sesi bulunamadı.", 400, undefined, request);
    }
    if (isAcademyTtsCassetteRevoked(lessonKey)) {
      return jsonFail("Bu kayıt yayında değil.", 404, undefined, request);
    }
    const ports = createPrismaAcademyPorts();
    const course = await lookupAcademyCurriculumCourse(ports.academy, id);
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404, undefined, request);
    }
    const actor = {
      userId: user.id,
      email: user.email,
      emailConfirmedAt: user.emailConfirmedAt,
    };
    const purchase = await resolveSettledAcademyPurchase(ports.academy, actor, course.id);
    if (!hasPurchased(purchase, actor)) {
      return jsonFail("Satın alma tamamlanmadan ders sesi açılmaz.", 403, undefined, request);
    }
    if (!lessonAudioEligible(course.slug, lessonKey)) {
      return jsonFail("Bu dersin sesi henüz yok.", 404, undefined, request);
    }
    if (resolveAcademyMediaRead(process.env) === "storage") {
      ensureAcademySealedStorageSigner();
    }
    const src = await withAcademyAudioGrant(academyLessonAudioPlaybackSrc(course.slug, lessonKey));
    if (!src) {
      return jsonFail("Ders sesi şu an açılamıyor.", 503, undefined, request);
    }
    const bedNeeded =
      isAcademyLessonBedSealed(course.slug, lessonKey) && !academyLessonBedIsHardMixed(lessonKey);
    const bedSrc = bedNeeded
      ? await withAcademyAudioGrant(academyLessonBedPlaybackSrc(course.slug, lessonKey))
      : null;
    if (bedNeeded && !bedSrc) {
      return jsonFail("Ders sesi şu an açılamıyor.", 503, undefined, request);
    }
    return jsonOk({ src, bedSrc }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { hasPurchased, resolveSettledAcademyPurchase } from "@/lib/academy/access";
import { lookupAcademyCurriculumCourse } from "@/lib/academy/curriculum-engine";
import { ensureAcademySealedStorageSigner } from "@/lib/academy/academy-sealed-storage";
import { resolveAcademyMediaRead } from "@/lib/academy/lesson-audio-grant";
import {
  academyLessonAudioEligible,
  issueAcademyLessonAudioGrant,
} from "@/lib/academy/lesson-audio-issue";
import { isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

/**
 * Satın alınmış dersin kısa ömürlü ses adresi.
 * Oturum çerez veya Bearer ile doğrulanır (`requireSession`). Kenar kaydı `session` dir.
 * Doğrulanmış Super Admin (`yapinet360@gmail.com`) satın alma satırı aranmadan geçer (`hasPurchased`).
 * Lisans yoksa ve kişi Super Admin değilse 403.
 * Anlatım adresi üretilemezse 503. Fon yatağı boşsa anlatım yine döner; yatak `null` kalır.
 * local: kenar aynı imzayı ister. storage: özel kovanın 4 saatlik adresi.
 * Üretimde okuma anahtarı boşsa storage geçerlidir.
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
    if (!academyLessonAudioEligible(course.slug, lessonKey)) {
      return jsonFail("Bu dersin sesi henüz yok.", 404, undefined, request);
    }
    if (resolveAcademyMediaRead(process.env) === "storage") {
      ensureAcademySealedStorageSigner();
    }
    const issued = await issueAcademyLessonAudioGrant(course.slug, lessonKey, Date.now(), process.env, undefined, {
      allowMissingBed: true,
    });
    if (!issued) {
      return jsonFail("Ders sesi şu an açılamıyor.", 503, undefined, request);
    }
    return jsonOk({ src: issued.src, bedSrc: issued.bedSrc }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

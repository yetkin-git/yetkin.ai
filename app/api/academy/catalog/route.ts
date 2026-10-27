import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { RAIL_V1_CLIENT_SCHEMA } from "@/lib/kernel/http/v1-client-flags";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { academyFocusSalePitch } from "@/lib/academy/focus-sale-pitch";
import {
  loadAcademyCatalogLearnerBoard,
  loadAcademyVitrineCourses,
  publishedLessonCount,
} from "@/lib/academy/load-catalog";
import { ACADEMY_FLAGSHIP_SKU_SLUG } from "@/lib/academy/pilot-sku";
import { academyPublicSaleHold } from "@/lib/academy/sale-hold";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";

export const auth = "session" as const;

/**
 * `GET /api/v1/academy/catalog` — vitrin ve katalog okuması.
 *
 * Native istemci katalogu çizebilsin diye açıldı. Vitrin RSC okuyordu; v1 okuma
 * hop'u yoktu (TESPIT §5.3 madde 1 — mobili bloke eden en somut eksik).
 *
 * Dürüstlük kuralları:
 * - Fiyat ve `purchasable` **tek evden** okunur (`loadAcademyVitrineCourses` →
 *   `academyCatalogPurchasable`: yayın + aktif fiyat + ses/metin mührü).
 *   Bu handler kendi kapısını kurmaz, ikinci fiyat evi açmaz.
 * - Fiyat yoksa `priceMinor/null` döner; uydurma tutar basılmaz.
 * - `saleHold` varsa kartın kapalı olma nedeni açıkça döner.
 * - Raf ayrımı (`hero` / `advanced`) sunucuda biter; istemci "hangi kart önce"
 *   kararını vermez.
 * - Ders gövdesi, ses adresi ve sınav soruları **bu hop'ta yoktur**. Katalog yalnız
 *   başlık, özet, süre, ders adedi, fiyat ve değer önerisi taşır.
 */
export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const [courses, learnerBoard] = await Promise.all([
      loadAcademyVitrineCourses(),
      loadAcademyCatalogLearnerBoard(user.id),
    ]);
    const ownedSlugs = learnerBoard.ownedSlugs;

    const rows = courses.map((course) => {
      const syllabus = curriculumSyllabusForCourseSlug(course.slug);
      const pitch = academyFocusSalePitch(course.slug);
      const owned = ownedSlugs.includes(course.slug);
      return {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        shelf: course.slug === ACADEMY_FLAGSHIP_SKU_SLUG ? ("hero" as const) : ("advanced" as const),
        level: course.level ?? academyCourseLevelBySlug(course.slug) ?? null,
        moduleCode: academyModuleCodeBySlug(course.slug) || null,
        isPublished: course.isPublished,
        purchasable: course.purchasable,
        priceMinor: course.priceMinor ?? null,
        currencyCode: course.priceMinor != null ? course.currencyCode : null,
        lessonCount: publishedLessonCount(course.slug),
        durationMin: syllabus.durationMin,
        modules: syllabus.modules.map((module) => ({
          title: module.title,
          lessonCount: module.lessons.length,
          durationMin: module.durationMin,
        })),
        saleHold: owned ? null : academyPublicSaleHold(course),
        owned,
        learnerStatus: learnerBoard.statusBySlug[course.slug] ?? null,
        checkoutPath: academyCheckoutHref(course.slug),
        // Değer önerisi düğme metnine bağlanır: CTA "ne alıyorum" sorusunu yanıtlar.
        outcomeLead: pitch?.find((row) => row.id === "result")?.text ?? null,
        outputLead: pitch?.find((row) => row.id === "output")?.text ?? null,
      };
    });

    return jsonOk(
      {
        heroSlug: rows.some((row) => row.shelf === "hero")
          ? ACADEMY_FLAGSHIP_SKU_SLUG
          : null,
        courses: rows,
        examPassScore: ACADEMY_EXAM_PASS_SCORE,
        ownedSlugs,
        clientSchema: {
          timelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.timelineSchemaVersion,
          minTimelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.minTimelineSchemaVersion,
        },
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AuthRequiredError") {
      return jsonFromUnknown(error, 401, requestId, request);
    }
    return jsonFail("Katalog okunamadı.", 503, requestId, request);
  }
}

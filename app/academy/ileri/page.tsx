import type { Metadata } from "next";
import { CourseList } from "@/components/academy/course-list";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { RoomFrame } from "@/components/ui/page-header";
import { loadAcademyVitrineCourses, publishedLessonCount } from "@/lib/academy/load-catalog";
import { isAcademyStorefrontSlug } from "@/lib/academy/pilot-sku";
import { academyPublicSaleHold } from "@/lib/academy/sale-hold";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { FUNNEL_VITRINE_VISIT_STEP } from "@/lib/kernel/admin/funnel-constants";
import { recordFunnelDailyDocumentStep } from "@/lib/kernel/admin/funnel-document-hit";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academyAdvanced);

/**
 * `/academy/ileri` — ikincil raf (Faz 3, Adım 1).
 *
 * Vitrin artık **tek kahraman** (`01_office_ai`) gösteriyor. Kalan beş ileri modül
 * silinmedi: karar yorgunluğu yaratmasın diye buraya taşındı. Her kart ayrı bir iştir
 * ve biri diğerinin ön koşulu değildir; bu yüzden burada akış/merdiven basılmaz.
 *
 * Satın alma kapısı vitrindeki ile **aynı** çözücüden gelir (`academyPublicSaleHold`
 * + kart CTA). Bu sayfa kendi ticari kararını vermez.
 */
export default async function AcademyAdvancedShelfPage() {
  const session = await getSession();
  const courses = await loadAcademyVitrineCourses();
  const lessonCounts = Object.fromEntries(
    courses
      .filter((course) => isAcademyStorefrontSlug(course.slug))
      .map((course) => [course.slug, publishedLessonCount(course.slug)] as const),
  );
  await recordFunnelDailyDocumentStep(FUNNEL_VITRINE_VISIT_STEP);
  const signedIn = Boolean(session);
  const buyHrefs = Object.fromEntries(
    courses.map((course) => {
      const checkout = academyCheckoutHref(course.slug);
      return [course.slug, signedIn ? checkout : buildCitizenLoginHref(checkout)] as const;
    }),
  );
  const saleHolds = Object.fromEntries(
    courses.map((course) => [course.slug, academyPublicSaleHold(course)] as const),
  );

  return (
    <RoomFrame className="space-y-3 pb-8">
      <CourseList
        courses={courses}
        advancedOnly
        buyHrefs={buyHrefs}
        saleHolds={saleHolds}
        lessonCounts={lessonCounts}
        title={ACADEMY_SEN.catalog.advancedRoomTitle}
        footer={<LegalColophonStrip />}
      />
    </RoomFrame>
  );
}

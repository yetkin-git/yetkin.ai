import type { Metadata } from "next";
import { CourseList } from "@/components/academy/course-list";
import { JuniorCrossSellBanner } from "@/components/academy/junior-cross-sell";
import { AcademyContinuePanel } from "@/components/academy/continue-panel";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import {
  loadAcademyCatalogLearnerBoard,
  loadAcademyContinueBoard,
  loadAcademyVitrineCourses,
  publishedLessonCount,
} from "@/lib/academy/load-catalog";
import { isAcademyContinueResumeStrip } from "@/lib/academy/continue-board";
import { EMPTY_ACADEMY_CATALOG_LEARNER_BOARD } from "@/lib/academy/catalog-learner";
import { isAcademyStorefrontSlug } from "@/lib/academy/pilot-sku";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { ACADEMY_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { getSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academy);

/**
 * Akademi vitrini — PEDAGOJI §D 5'li Vitrin Karması + A5 dürüst yüzey.
 * Mühürlü `01_office_ai-1` amiral kartı yayındadır. OFF-201 (`01_office_ai_ileri`) canlıdır.
 * EC-102 (`02_ecommerce_ai`) kamu kapısı açıktır; kartın yeşil düğmesi birinci dersi `/oyna` yolunda açar. Satın alma ikincildir.
 * `03_social_media_ai`, `04_chatbot_nocode` ve `05_prompt_practice` aynı kabuktadır.
 * Hayali oynatıcı basılmaz.
 */
export default async function AcademyPage() {
  const copy = SEN_VOICE.academy.catalog;
  const session = await getSession();
  const studioPreview = Boolean(session && isSuperAdminActor(session));
  const [courses, continueBoard, learnerBoard] = await Promise.all([
    loadAcademyVitrineCourses(),
    session ? loadAcademyContinueBoard(session.id) : Promise.resolve(null),
    session
      ? loadAcademyCatalogLearnerBoard(session.id)
      : Promise.resolve(EMPTY_ACADEMY_CATALOG_LEARNER_BOARD),
  ]);
  const lessonCounts = Object.fromEntries(
    courses
      .filter((course) => isAcademyStorefrontSlug(course.slug))
      .map((course) => [course.slug, publishedLessonCount(course.slug)] as const),
  );
  const signedIn = Boolean(session);
  const buyHrefs = Object.fromEntries(
    courses.map((course) => {
      const checkout = academyCheckoutHref(course.slug);
      return [course.slug, signedIn ? checkout : buildCitizenLoginHref(checkout)] as const;
    }),
  );

  return (
    <RoomFrame className="space-y-3 pb-8">
      <JsonLd data={jsonLdDocument([faqPageJsonLd(ACADEMY_LANDING_FAQ)])} />
      <CourseList
        courses={courses}
        learnerBoard={learnerBoard}
        studioPreview={studioPreview}
        buyHrefs={buyHrefs}
        lessonCounts={lessonCounts}
        title={copy.title}
        certificatesCta={copy.certificatesCta}
        lead={
          isAcademyContinueResumeStrip(continueBoard) ? (
            <AcademyContinuePanel board={continueBoard} />
          ) : null
        }
        footer={<LegalColophonStrip />}
      />
      <JuniorCrossSellBanner />
      <LandingFaq heading={copy.faqHeading} items={ACADEMY_LANDING_FAQ} />
    </RoomFrame>
  );
}

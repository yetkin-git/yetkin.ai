import type { Metadata } from "next";
import { CourseList } from "@/components/academy/course-list";
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
import { RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { ACADEMY_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { getSession } from "@/lib/kernel/auth/session";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academy);

/**
 * Akademi vitrini — PEDAGOJI §D 5'li Vitrin Karması + A5 dürüst yüzey.
 * Mühürlü `01_office_ai-1` amiral kartı yayındadır. Kardeş SKU’lar Çok Yakında
 * kabuğudur; hayali oynatıcı ve satın alınır antre basılmaz.
 */
export default async function AcademyPage() {
  const copy = SEN_VOICE.academy.catalog;
  const session = await getSession();
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

  return (
    <RoomFrame className="space-y-3 pb-8">
      <JsonLd data={jsonLdDocument([faqPageJsonLd(ACADEMY_LANDING_FAQ)])} />
      <CourseList
        courses={courses}
        learnerBoard={learnerBoard}
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
      <LandingFaq heading={copy.faqHeading} items={ACADEMY_LANDING_FAQ} />
    </RoomFrame>
  );
}

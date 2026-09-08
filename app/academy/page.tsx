import { CourseList } from "@/components/academy/course-list";
import { AcademyContinuePanel } from "@/components/academy/continue-panel";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import {
  loadAcademyCatalogLearnerBoard,
  loadAcademyContinueBoard,
  loadPublishedCourses,
} from "@/lib/academy/load-catalog";
import { isAcademyContinueResumeStrip } from "@/lib/academy/continue-board";
import { EMPTY_ACADEMY_CATALOG_LEARNER_BOARD } from "@/lib/academy/catalog-learner";
import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { filterAcademyPilotCatalog } from "@/lib/academy/pilot-sku";
import { RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";

/**
 * Katalog vitrini — Katman 1 compact SKU (`01_office_ai` … `05_prompt_practice`).
 * Sıra `ACADEMY_GROWTH_SKU_SLUGS`; her kurs 6 makale.
 */
export default async function AcademyPage() {
  const copy = SEN_VOICE.academy.catalog;
  const sessionPromise = getSession();
  const publishedPromise = loadPublishedCourses();
  const session = await sessionPromise;
  const [published, continueBoard, learnerBoard] = await Promise.all([
    publishedPromise,
    session ? loadAcademyContinueBoard(session.id) : Promise.resolve(null),
    session
      ? loadAcademyCatalogLearnerBoard(session.id)
      : Promise.resolve(EMPTY_ACADEMY_CATALOG_LEARNER_BOARD),
  ]);
  const courses = filterAcademyPilotCatalog(published);
  const lessonCounts = Object.fromEntries(
    courses.map((course) => [course.slug, curriculumLessonCountForSlug(course.slug)] as const),
  );

  return (
    <RoomFrame className="space-y-3 pb-8">
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
    </RoomFrame>
  );
}

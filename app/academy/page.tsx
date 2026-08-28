import { CourseList } from "@/components/academy/course-list";
import { AcademyContinuePanel } from "@/components/academy/continue-panel";
import {
  loadAcademyCatalogLearnerBoard,
  loadAcademyContinueBoard,
  loadPublishedCourses,
} from "@/lib/academy/load-catalog";
import { isAcademyContinueResumeStrip } from "@/lib/academy/continue-board";
import {
  EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  overlayStudioGrowthLearnerBoard,
} from "@/lib/academy/catalog-learner";
import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_GROWTH_SKU_SLUGS, filterAcademyPilotCatalog } from "@/lib/academy/pilot-sku";
import { RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";
import { hasUnlimitedAcademyAccess } from "@/lib/academy/access";

/**
 * Büyüme vitrini: dört popüler yetkinlik yolu. Süzgeç / pazar ızgarası yok.
 * Pazarlama bandı yok — oda emri resume komut satırıdır.
 */
export default async function AcademyPage() {
  const copy = SEN_VOICE.academy.catalog;
  const sessionPromise = getSession();
  const publishedPromise = loadPublishedCourses();
  const session = await sessionPromise;
  const [published, continueBoard, learnerRaw] = await Promise.all([
    publishedPromise,
    session ? loadAcademyContinueBoard(session.id) : Promise.resolve(null),
    session
      ? loadAcademyCatalogLearnerBoard(session.id)
      : Promise.resolve(EMPTY_ACADEMY_CATALOG_LEARNER_BOARD),
  ]);
  const courses = filterAcademyPilotCatalog(published);
  const learnerBoard = session
    ? overlayStudioGrowthLearnerBoard(learnerRaw, {
        studio: hasUnlimitedAcademyAccess({ userId: session.id, email: session.email }),
        growthSlugs: ACADEMY_GROWTH_SKU_SLUGS,
      })
    : EMPTY_ACADEMY_CATALOG_LEARNER_BOARD;
  const lessonCounts = Object.fromEntries(
    courses.map((course) => [course.slug, curriculumLessonCountForSlug(course.slug)] as const),
  );

  return (
    <RoomFrame className="academy-catalog-viewport-lock -my-8 flex h-[calc(100vh-theme(spacing.16))] max-h-[calc(100vh-theme(spacing.16))] flex-col overflow-hidden space-y-3 pt-8">
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
      />
    </RoomFrame>
  );
}

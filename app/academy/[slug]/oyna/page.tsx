import { notFound, redirect } from "next/navigation";
import { RoomFrame } from "@/components/ui/page-header";
import { CurriculumPlayer } from "@/components/academy/curriculum-player";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import {
  loadCourseBySlug,
  loadAcademyCurriculum,
  loadPurchaseForUserCourse,
} from "@/lib/academy/load";
import { hasAcademyPlayerAccess } from "@/lib/academy/access";
import { hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";

export default async function AcademyCurriculumPlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requirePageSession();
  const userEmail = session.email;
  const { slug } = await params;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const purchase = await loadPurchaseForUserCourse(session.id, board.course.id, userEmail);
  const actor = { userId: session.id, email: userEmail };
  const canAccess =
    hasCommercialAcademyEnrolment(purchase) || hasAcademyPlayerAccess(purchase, actor);
  const hasPurchased = canAccess;
  const grantStudio = isSuperAdminActor({ id: session.id, email: userEmail });

  if (!hasPurchased) {
    redirect(`/academy/${board.course.slug}`);
  }

  const player = await loadAcademyCurriculum(session.id, board.course.id, userEmail);
  if (!player) {
    redirect(`/academy/${board.course.slug}`);
  }

  return (
    <RoomFrame className="-my-8 flex max-w-none flex-col gap-0 space-y-0 px-3 sm:px-4">
      <BreadcrumbPageLabel href={`/academy/${board.course.slug}/oyna`} label={board.course.title} />
      <div className="flex flex-col">
        {grantStudio ? (
          <p className="sr-only">Super Admin laboratuvar erişimi</p>
        ) : null}
        <CurriculumPlayer
          courseId={board.course.id}
          courseSlug={board.course.slug}
          lessons={player.lessons}
          curriculumComplete={player.curriculumComplete}
          workTasksComplete={player.workTasksComplete}
        />
      </div>
    </RoomFrame>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { canonicalUrl } from "@/lib/copy/seo";
import { RoomFrame } from "@/components/ui/page-header";
import { CurriculumPlayer } from "@/components/academy/curriculum-player";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import {
  loadCourseBySlug,
  loadAcademyCurriculum,
  loadPurchaseForUserCourse,
} from "@/lib/academy/load";
import { hasAcademyPlayerAccess } from "@/lib/academy/access";
import { hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";
import {
  academyStorefrontStaticParams,
  isAcademyGrowthSkuSlug,
} from "@/lib/academy/pilot-sku";
import { academyCourseOffersFreePreview } from "@/lib/academy/purchase-path";
import { academyPaywallLockedLessonShells } from "@/lib/academy/preview-lock";

export function generateStaticParams() {
  return academyStorefrontStaticParams();
}

/** Vitrinde olmayan slug yumuşak 200 değil, HTTP 404. */
export const dynamicParams = false;

// SEO Tedavi (P1) — duvar arkası oynatıcı indekslenmez.
// Kanonik kendi adresidir; akademi kataloğunu miras almaz.
// `robots.ts` disallow (`/academy/*/oyna`) + oturum duvarı ile kilit.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = canonicalUrl(`/academy/${slug}/oyna`);
  return {
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: { url },
  };
}

export default async function AcademyCurriculumPlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [session, { slug }] = await Promise.all([requirePageSession(), params]);
  if (!isAcademyGrowthSkuSlug(slug)) {
    notFound();
  }
  const userEmail = session.email;
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
    if (!academyCourseOffersFreePreview(board.course.slug)) {
      redirect(`/academy/${board.course.slug}`);
    }
    return (
      <RoomFrame cinema className="flex flex-col gap-0 space-y-0 px-4 py-0 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col">
          <CurriculumPlayer
            courseId={board.course.id}
            courseSlug={board.course.slug}
            lessons={academyPaywallLockedLessonShells(board.course.slug)}
            curriculumComplete={false}
            workTasksComplete={false}
            paywallLocked
          />
        </div>
      </RoomFrame>
    );
  }

  const player = await loadAcademyCurriculum(session.id, board.course.id, userEmail);
  if (!player) {
    redirect(`/academy/${board.course.slug}`);
  }

  return (
    <RoomFrame cinema className="flex flex-col gap-0 space-y-0 px-4 py-0 sm:px-6">
      <div className="flex min-h-0 flex-1 flex-col">
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

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { canonicalUrl } from "@/lib/copy/seo";
import { RoomFrame } from "@/components/ui/page-header";
import { CurriculumPlayer } from "@/components/academy/curriculum-player";
import { getSession, requirePageSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import {
  loadCourseBySlug,
  loadAcademyCurriculum,
  loadPurchaseForUserCourse,
} from "@/lib/academy/load";
import { academyActorFromSession, hasAcademyOynaAccess } from "@/lib/academy/access";
import {
  ACADEMY_OFF201_STOREFRONT_SLUG,
  academyReleasedProductionLineParams,
  academyStorefrontStaticParams,
  isAcademyStorefrontSlug,
} from "@/lib/academy/pilot-sku";
import { academyCourseOffersFreePreview } from "@/lib/academy/purchase-path";
import { sealClosedAcademyLessonPayload } from "@/lib/academy/preview-lock";
import { academyPaywallLockedLessonShells } from "@/lib/academy/paywall-shells";
import { loadAcademyFreePreviewAudioGrants } from "@/lib/academy/free-preview-audio";
import { loadAcademyLessonMediaPrime } from "@/lib/academy/lesson-media-prime";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";

function academyPlayerCheckoutHref(slug: string, signedIn: boolean): string {
  const checkout = academyCheckoutHref(slug);
  return signedIn ? checkout : buildCitizenLoginHref(checkout);
}

function academyPlayerPaywallPrice(course: AcademyCourseWithPrice): string | null {
  if (course.priceMinor == null) {
    return null;
  }
  return formatMinorCompact(course.priceMinor, course.currencyCode);
}

export function generateStaticParams() {
  return [
    ...academyStorefrontStaticParams(),
    { slug: ACADEMY_OFF201_STOREFRONT_SLUG },
    ...academyReleasedProductionLineParams(),
  ];
}

/** Vitrinde olmayan slug yumuşak 200 değil, HTTP 404. */
export const dynamicParams = false;

// SEO Tedavi (P1) — duvar arkası oynatıcı indekslenmez.
// Kanonik kendi adresidir; akademi kataloğunu miras almaz.
// `robots.ts` disallow (`/academy/*/oyna`). Ücretsiz kapı ders 1 satış vitrini
// ve hazırlık şerididir. Ders 2+ gövdesi oturumsuz oynatıcıda kilitlidir.
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
  const { slug } = await params;
  if (!isAcademyStorefrontSlug(slug)) {
    notFound();
  }
  const offersPreview = academyCourseOffersFreePreview(slug);
  const session = offersPreview ? await getSession() : await requirePageSession();
  if (!session) {
    const board = await loadCourseBySlug(slug);
    if (!board || (!board.course.isPublished && !offersPreview)) {
      notFound();
    }
    const freePreviewAudio = await loadAcademyFreePreviewAudioGrants(board.course.slug);
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
            paywallPriceLabel={academyPlayerPaywallPrice(board.course)}
            freePreviewAudio={freePreviewAudio}
            checkoutHref={academyPlayerCheckoutHref(board.course.slug, false)}
            media={loadAcademyLessonMediaPrime(board.course.slug, { paywallLocked: true })}
          />
        </div>
      </RoomFrame>
    );
  }
  const userEmail = session.email;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const actor = academyActorFromSession(session);
  const purchase = await loadPurchaseForUserCourse(
    session.id,
    board.course.id,
    userEmail,
    session.emailConfirmedAt,
  );
  const hasPurchased = hasAcademyOynaAccess(purchase, actor);
  const grantStudio = isSuperAdminActor(session);

  if (!board.course.isPublished && !hasPurchased && !offersPreview) {
    notFound();
  }

  if (!hasPurchased) {
    if (!academyCourseOffersFreePreview(board.course.slug)) {
      redirect(`/academy/${board.course.slug}`);
    }
    const freePreviewAudio = await loadAcademyFreePreviewAudioGrants(board.course.slug);
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
            paywallPriceLabel={academyPlayerPaywallPrice(board.course)}
            freePreviewAudio={freePreviewAudio}
            checkoutHref={academyPlayerCheckoutHref(board.course.slug, true)}
            media={loadAcademyLessonMediaPrime(board.course.slug, { paywallLocked: true })}
          />
        </div>
      </RoomFrame>
    );
  }

  const player = await loadAcademyCurriculum(
    session.id,
    board.course.id,
    userEmail,
    session.emailConfirmedAt,
  );
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
          lessons={sealClosedAcademyLessonPayload(player.lessons)}
          curriculumComplete={player.curriculumComplete}
          workTasksComplete={player.workTasksComplete}
          media={loadAcademyLessonMediaPrime(board.course.slug, {
            openLessonKeys: player.lessons.filter((lesson) => lesson.open).map((lesson) => lesson.key),
          })}
        />
      </div>
    </RoomFrame>
  );
}

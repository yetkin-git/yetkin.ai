import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { OfficeAiExitKit } from "@/components/academy/office-ai-exit-kit";
import { OFFICE_AI_EXIT_KIT_SLUG } from "@/lib/academy/exit-kit";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { loadCourseBySlug, loadPurchaseForUserCourse } from "@/lib/academy/load";
import { hasAcademyPlayerAccess } from "@/lib/academy/access";
import { hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";
import {
  academyStorefrontStaticParams,
  isAcademyGrowthSkuSlug,
} from "@/lib/academy/pilot-sku";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function generateStaticParams() {
  return academyStorefrontStaticParams().filter((row) => row.slug === OFFICE_AI_EXIT_KIT_SLUG);
}

/** Vitrinde olmayan slug yumuşak 200 değil, HTTP 404. */
export const dynamicParams = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AcademyExitKitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [session, { slug }] = await Promise.all([requirePageSession(), params]);
  if (!isAcademyGrowthSkuSlug(slug) || slug !== OFFICE_AI_EXIT_KIT_SLUG) {
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

  if (!canAccess) {
    redirect(`/academy/${board.course.slug}`);
  }

  const copy = ACADEMY_SEN.player;
  const grantStudio = isSuperAdminActor({ id: session.id, email: userEmail });

  return (
    <RoomFrame>
      {grantStudio ? <p className="sr-only">Super Admin laboratuvar erişimi</p> : null}
      <PageHeader
        eyebrow={copy.exitKitCta}
        title="Cuma 30, istem kartları, KVKK maskesi"
        description={copy.exitKitLead}
        actions={
          <LinkButton href={`/academy/${board.course.slug}/oyna` as Route} size="sm" variant="outline">
            Derse dön
          </LinkButton>
        }
      />
      <OfficeAiExitKit />
    </RoomFrame>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamStartGate } from "@/components/academy/exam-start-gate";
import { ExemptionGuestCard } from "@/components/academy/exemption-guest-card";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_EXAM_DURATION_MS } from "@/lib/academy/exam-duration";
import {
  OFF_101_EXEMPTION_COURSE_SLUG,
  OFF_101_EXEMPTION_ENTRY_LABEL,
  OFF_101_EXEMPTION_PATH,
} from "@/lib/academy/off101-exemption";
import { loadAcademyHolderName, loadCourseBySlug } from "@/lib/academy/load";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { pageMetadata } from "@/lib/copy/seo";
import { buildCitizenLoginHref, buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";

export const metadata: Metadata = pageMetadata({
  title: "Ücretsiz yetkinlik testi",
  description: ACADEMY_SEN.exemption.guestLead,
  path: OFF_101_EXEMPTION_PATH,
});

/**
 * Ücretsiz seviye testi. Puanlama `off101-exemption` motorundadır.
 * Oturum yokken sonuç yazılmaz; kayıt dönüşü bu yola iner.
 */
export default async function AcademyExemptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== OFF_101_EXEMPTION_COURSE_SLUG) {
    notFound();
  }
  const board = await loadCourseBySlug(slug);
  if (!board?.course.isPublished) {
    notFound();
  }
  const session = await getSession();
  const holderName = session ? await loadAcademyHolderName(session.id) : undefined;
  const copy = ACADEMY_SEN.exemption;

  return (
    <RoomFrame className="space-y-5">
      <PageHeader eyebrow={copy.eyebrow} title={copy.guestTitle} description={copy.guestLead} />
      {session ? (
        <ExamStartGate
          courseId={board.course.id}
          courseTitle={board.course.title}
          examTitle={OFF_101_EXEMPTION_ENTRY_LABEL}
          passScore={ACADEMY_EXAM_PASS_SCORE}
          durationMs={ACADEMY_EXAM_DURATION_MS}
          holderName={holderName}
          mode="exemption"
        />
      ) : (
        <ExemptionGuestCard
          registerHref={buildCitizenRegisterHref(OFF_101_EXEMPTION_PATH)}
          loginHref={buildCitizenLoginHref(OFF_101_EXEMPTION_PATH)}
        />
      )}
    </RoomFrame>
  );
}

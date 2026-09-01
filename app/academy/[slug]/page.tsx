import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PurchaseButton } from "@/components/academy/purchase-button";
import { ExamStartGate } from "@/components/academy/exam-start-gate";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { AcademyContinuePanel } from "@/components/academy/continue-panel";
import { SettlementSteps } from "@/components/academy/settlement-steps";
import { CurriculumOutline } from "@/components/academy/curriculum-outline";
import { AcademyProgressBar } from "@/components/academy/progress-bar";
import {
  loadAcademyHolderName,
  loadAcademyProgressionForCourse,
  loadArtifactPurchaseForUserCourse,
  loadCourseBySlug,
  loadCurriculumPlayerForUser,
  loadExamGateForUserCourse,
  loadPurchaseForUserCourse,
} from "@/lib/academy/load";
import { academyStorefrontAccess, hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";
import { resolveAcademyAntreHeroCta } from "@/lib/academy/storefront-cta";
import { hasAcademyPlayerAccess } from "@/lib/academy/access";
import { resolveAcademyContinueBoard } from "@/lib/academy/continue-board";
import { LinkButton } from "@/components/ui/link-button";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import { academyProgressPercent } from "@/lib/academy/lesson-meta";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { loadWalletBoard, walletAvailableMinor } from "@/lib/kernel/ledger/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { CourseHeroActions } from "@/components/academy/course-hero-actions";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import { academyInstructorBySlug, academyModeratorForSlug } from "@/lib/academy/instructors";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";
import { isPaytrMockCheckoutAllowed } from "@/lib/kernel/payments/paytr/checkout";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import type { Route } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = academyCourseTitleBySlug(slug);
  return pageMetadata({
    title: title ? `${title} · Akademi` : PAGE_SEO.academy.title,
    description: title
      ? `${title} — yetkin.ai Akademi. Dersi bitir, testi geç, kariyer vizen işlensin.`
      : PAGE_SEO.academy.description,
    path: `/academy/${slug}`,
  });
}

export default async function AcademyCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ gate?: string }>;
}) {
  const { slug } = await params;
  const gate = searchParams ? (await searchParams).gate : undefined;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const session = await getSession();
  const purchase = session
    ? await loadPurchaseForUserCourse(session.id, board.course.id, session.email)
    : null;
  const artifact = session
    ? await loadArtifactPurchaseForUserCourse(session.id, board.course.id, session.email)
    : null;
  const actor = session ? { userId: session.id, email: session.email } : null;
  const labPlayer = actor != null && hasAcademyPlayerAccess(purchase, actor);
  const enrolled = hasCommercialAcademyEnrolment(purchase);
  const access = enrolled ? "enrolled" : academyStorefrontAccess(artifact);
  const holderName = session ? await loadAcademyHolderName(session.id) : "Aday";
  const examGate =
    session && enrolled
      ? await loadExamGateForUserCourse(session.id, board.course.id, session.email)
      : null;
  const preferExamGate = gate === "exam" && Boolean(examGate && !examGate.certificate);
  const wallet = session && !enrolled ? await loadWalletBoard(session.id) : null;
  const paymentsReady = isPaymentsPortConfigured() || isPaytrMockCheckoutAllowed();
  const copy = SEN_VOICE.academy.course;
  const playerCopy = SEN_VOICE.academy.player;
  const instructor = academyInstructorBySlug(board.course.slug);
  const moderator = academyModeratorForSlug(board.course.slug);
  const certificateHash = examGate?.certificate
    ? (examGate.certificate.certificateHash ?? examGate.certificate.serialKey)
    : null;
  const syllabus = curriculumSyllabusForCourseSlug(board.course.slug);
  const priceLabel = board.course.priceMinor
    ? formatMinor(board.course.priceMinor, board.course.currencyCode)
    : null;
  const level = academyCourseLevelBySlug(board.course.slug);
  const progression = await loadAcademyProgressionForCourse({
    userId: session?.id ?? null,
    email: session?.email,
    currentSlug: board.course.slug,
  });
  const player =
    session && enrolled && !examGate?.certificate
      ? await loadCurriculumPlayerForUser(session.id, board.course.id, session.email)
      : null;
  const completedKeys = examGate?.certificate
    ? syllabus.lessons.map((lesson) => lesson.key)
    : (player?.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key) ?? []);
  const continueBoard =
    player && !examGate?.certificate
      ? resolveAcademyContinueBoard({
          courseId: board.course.id,
          courseSlug: board.course.slug,
          courseTitle: board.course.title,
          completedLessonKeys: completedKeys,
          hasCertificate: false,
        })
      : null;
  const examReadyViaCurriculum = continueBoard?.phase === "exam";
  const revealExamGate = Boolean(
    examGate && !examGate.certificate && (preferExamGate || examReadyViaCurriculum),
  );
  const hero = resolveAcademyAntreHeroCta({
    access,
    priceLabel,
    purchasable: board.course.purchasable,
    continueCompletedCount: continueBoard?.completedCount ?? 0,
    continuePhase: continueBoard?.phase ?? null,
    session: Boolean(session),
    courseSlug: board.course.slug,
    loginHref: buildCitizenLoginHref(`/academy/${board.course.slug}`),
  });
  const playLabel =
    continueBoard && continueBoard.completedCount > 0
      ? playerCopy.resumeCta
      : playerCopy.openCta;
  const progressPercent = academyProgressPercent(completedKeys.length, syllabus.lessonCount);

  return (
    <RoomFrame className="space-y-5" data-academy-lab-player={labPlayer ? "true" : undefined}>
      <BreadcrumbPageLabel href={`/academy/${board.course.slug}`} label={board.course.title} />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={board.course.title}
        description={board.course.summary}
        actions={
          <CourseHeroActions
            priceLabel={hero.priceLabel}
            level={level}
            primaryHref={hero.primaryHref}
            primaryLabel={hero.primaryLabel}
            primaryAction={hero.action}
            catalogHref={"/academy" as Route}
            catalogLabel={copy.catalogCta}
          />
        }
      />
      {enrolled && syllabus.lessonCount > 0 ? (
        <AcademyProgressBar
          value={progressPercent}
          label={playerCopy.progress(completedKeys.length, syllabus.lessonCount)}
        />
      ) : null}
      {continueBoard && !revealExamGate ? <AcademyContinuePanel board={continueBoard} /> : null}
      {enrolled ? (
        examGate?.certificate ? (
          <Card title={copy.certificateEyebrow}>
            <p>{copy.certificateBody}</p>
            <div className="mt-4 space-y-4">
              <CertificateSeal
                variant="diploma"
                hash={certificateHash ?? examGate.certificate.serialKey}
                score={examGate.certificate.score}
                issuedAt={examGate.certificate.issuedAt}
                holderName={holderName}
                courseTitle={board.course.title}
                instructorName={instructor.name}
                verifyHref={certificateHash ? `/academy/dogrula/${certificateHash}` : undefined}
              />
            </div>
          </Card>
        ) : revealExamGate && examGate ? (
          <ExamStartGate
            courseId={board.course.id}
            courseTitle={board.course.title}
            examTitle={examGate.examTitle}
            passScore={examGate.passScore}
            durationMs={examGate.durationMs}
            holderName={holderName}
            instructorName={instructor.name}
            nextCourseTitle={progression.bridge.nextTitle}
            nextCourseHref={progression.bridge.nextHref}
          />
        ) : (
          <Card title={playerCopy.eyebrow(instructor.name, moderator.name)}>
            <p>{copy.ownedNoExam}</p>
            <div className="mt-4">
              <LinkButton href={`/academy/${board.course.slug}/oyna` as Route} size="sm">
                {playLabel}
              </LinkButton>
            </div>
          </Card>
        )
      ) : access === "expired" ? (
        <Card title={playerCopy.eyebrow(instructor.name, moderator.name)}>
          <p>{playerCopy.licenseEnded}</p>
        </Card>
      ) : board.course.purchasable ? (
        <div className="scroll-mt-24" id="satin-al">
          <Card title={copy.purchaseEyebrow}>
            <p>{copy.purchaseBody}</p>
            {session ? (
              <div className="mt-4" data-academy-purchase-gate="">
                <PurchaseButton
                  courseId={board.course.id}
                  lockMinutes={PRICE_LOCK_GRACE_MINUTES}
                  priceMinor={board.course.priceMinor}
                  priceLabel={priceLabel}
                  currencyCode={board.course.currencyCode}
                  walletMinor={walletAvailableMinor(wallet)}
                  trainingHref={`/academy/${board.course.slug}/oyna`}
                  courseLevel={level}
                  paymentsReady={paymentsReady}
                />
              </div>
            ) : (
              <div className="mt-4" data-academy-purchase-gate="">
                <p>
                  {copy.loginLead}{" "}
                  <Link href={buildCitizenLoginHref(`/academy/${board.course.slug}`) as Route} className="text-[var(--safir)] hover:underline">
                    {copy.loginCta}
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>{copy.notPurchasable}</Card>
      )}
      <CurriculumOutline
        syllabus={syllabus}
        passScore={ACADEMY_EXAM_PASS_SCORE}
        completedKeys={completedKeys}
        showProgress={enrolled}
      />
      {!enrolled && board.course.purchasable ? (
        <p className="text-xs leading-relaxed text-[var(--muted)]">{copy.libraryGuarantee}</p>
      ) : null}
      {!enrolled && board.course.purchasable ? (
        <Card eyebrow={SEN_VOICE.academy.settlement.title} className="opacity-90">
          <SettlementSteps lockMinutes={PRICE_LOCK_GRACE_MINUTES} />
        </Card>
      ) : null}
    </RoomFrame>
  );
}

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
import { CurriculumOutcomes } from "@/components/academy/curriculum-outcomes";
import { AcademyProgressBar } from "@/components/academy/progress-bar";
import {
  loadAcademyHolderName,
  loadAcademyProgressionForCourse,
  loadAcademyWalletBoard,
  loadArtifactPurchaseForUserCourse,
  loadCourseBySlug,
  loadCurriculumPlayerForUser,
  loadExamGateForUserCourse,
  loadPurchaseForUserCourse,
} from "@/lib/academy/load";
import { academyStorefrontAccess, hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";
import { resolveAcademyAntreHeroCta, academyCheckoutHref, ACADEMY_CHECKOUT_HASH } from "@/lib/academy/storefront-cta";
import { hasAcademyPlayerAccess } from "@/lib/academy/access";
import { resolveAcademyContinueBoard } from "@/lib/academy/continue-board";
import { LinkButton } from "@/components/ui/link-button";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import { academyProgressPercent } from "@/lib/academy/lesson-meta";
import { academyAntreVisaPromise } from "@/lib/academy/antre-visa";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { walletAvailableMinor } from "@/lib/kernel/ledger/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { CourseHeroActions } from "@/components/academy/course-hero-actions";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseCoverPath, academyCourseHasCinemaCover, academyCourseIsComingSoon } from "@/lib/academy/course-cover";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";
import { isPaytrMockCheckoutAllowed } from "@/lib/kernel/payments/paytr/checkout";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import {
  academyCourseHasSealedAudio,
  academyStorefrontStaticParams,
  isAcademyGrowthSkuSlug,
} from "@/lib/academy/pilot-sku";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { OfficeAiGuidePreview } from "@/components/academy/office-ai-guide-preview";
import { PrepStripTeaser } from "@/components/academy/prep-strip-teaser";
import { academyPrepStripForSlug } from "@/lib/academy/prep-strip";
import {
  academyCourseBreadcrumbs,
  breadcrumbListJsonLd,
  courseJsonLd,
  educationalOccupationalProgramJsonLd,
  faqPageJsonLd,
  jsonLdDocument,
  OFFICE_AI_COURSE_TEACHES,
} from "@/lib/copy/json-ld";
import { DEFAULT_OG_IMAGE, OFFICE_AI_SEO, pageMetadata } from "@/lib/copy/seo";
import { OFFICE_AI_COURSE_FAQ, OFFICE_AI_FAQ_HEADING } from "@/lib/copy/sem-keywords";
import type { Route } from "next";

export function generateStaticParams() {
  return academyStorefrontStaticParams();
}

/** Vitrinde olmayan slug (python-temel, 06_n8n, eski dikey) next.config 301 → /academy; harita dışı 404. Satın alma bekletmesi yok. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isAcademyGrowthSkuSlug(slug)) {
    notFound();
  }
  const course = resolveAcademyCourseFromSeed(slug);
  if (!course) {
    notFound();
  }
  // SEO Tedavi (P0) — amiral SKU arama niyeti diline çevrilir (64 kr final title).
  // Sicil/sertifika başlığı (`course.title` SSOT) değişmez; yalnız meta dalı override edilir.
  const isOfficeAiSeo = course.slug === OFFICE_AI_SEO.slug;
  return pageMetadata({
    title: isOfficeAiSeo ? OFFICE_AI_SEO.title : `${course.title} · Akademi`,
    description: isOfficeAiSeo ? OFFICE_AI_SEO.description : course.summary,
    path: `/academy/${course.slug}`,
    image: academyCourseCoverPath(course.slug) ?? DEFAULT_OG_IMAGE,
    keywords: isOfficeAiSeo ? OFFICE_AI_SEO.keywords : undefined,
  });
}

export default async function AcademyCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ gate?: string }>;
}) {
  const [{ slug }, session, gateQuery] = await Promise.all([
    params,
    getSession(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  if (!isAcademyGrowthSkuSlug(slug)) {
    notFound();
  }
  const gate = gateQuery?.gate;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const [purchase, artifact, holderName, progression] = await Promise.all([
    session
      ? loadPurchaseForUserCourse(session.id, board.course.id, session.email)
      : Promise.resolve(null),
    session
      ? loadArtifactPurchaseForUserCourse(session.id, board.course.id, session.email)
      : Promise.resolve(null),
    session ? loadAcademyHolderName(session.id) : Promise.resolve("Aday"),
    loadAcademyProgressionForCourse({
      userId: session?.id ?? null,
      email: session?.email,
      currentSlug: board.course.slug,
    }),
  ]);
  const actor = session ? { userId: session.id, email: session.email } : null;
  const labPlayer = actor != null && hasAcademyPlayerAccess(purchase, actor);
  const enrolled = hasCommercialAcademyEnrolment(purchase);
  const hasAccess = enrolled || labPlayer;
  const access = hasAccess ? "enrolled" : academyStorefrontAccess(artifact);
  const [examGate, wallet, player] = await Promise.all([
    session && enrolled
      ? loadExamGateForUserCourse(session.id, board.course.id, session.email)
      : Promise.resolve(null),
    session && !hasAccess
      ? loadAcademyWalletBoard(session.id)
      : Promise.resolve(null),
    session && hasAccess
      ? loadCurriculumPlayerForUser(session.id, board.course.id, session.email)
      : Promise.resolve(null),
  ]);
  const preferExamGate = gate === "exam" && Boolean(examGate && !examGate.certificate);
  const paymentsReady = isPaymentsPortConfigured() || isPaytrMockCheckoutAllowed();
  const copy = SEN_VOICE.academy.course;
  const playerCopy = SEN_VOICE.academy.player;
  const certificateHash = examGate?.certificate
    ? (examGate.certificate.certificateHash ?? examGate.certificate.serialKey)
    : null;
  const syllabus = curriculumSyllabusForCourseSlug(board.course.slug);
  const prepStrip = academyPrepStripForSlug(board.course.slug);
  const visaPromise = academyAntreVisaPromise(board.course.slug, ACADEMY_EXAM_PASS_SCORE);
  const priceLabel = board.course.priceMinor
    ? formatMinor(board.course.priceMinor, board.course.currencyCode)
    : null;
  const level = academyCourseLevelBySlug(board.course.slug);
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
    loginHref: buildCitizenLoginHref(academyCheckoutHref(board.course.slug)),
  });
  const playLabel =
    continueBoard && continueBoard.completedCount > 0
      ? playerCopy.resumeCta
      : playerCopy.openCta;
  const progressPercent = academyProgressPercent(completedKeys.length, syllabus.lessonCount);

  return (
    <RoomFrame className="space-y-5" data-academy-lab-player={labPlayer ? "true" : undefined}>
      <JsonLd
        data={jsonLdDocument([
          courseJsonLd({
            slug: board.course.slug,
            title: board.course.title,
            description:
              board.course.slug === OFFICE_AI_SEO.slug
                ? OFFICE_AI_SEO.description
                : board.course.summary,
            imagePath: academyCourseCoverPath(board.course.slug) ?? DEFAULT_OG_IMAGE,
            datePublished: board.course.createdAt,
            priceMinor: board.course.priceMinor,
            priceCurrency: board.course.currencyCode,
            teaches:
              board.course.slug === OFFICE_AI_SEO.slug ? [...OFFICE_AI_COURSE_TEACHES] : undefined,
            lessons: syllabus.lessons.map((lesson) => ({
              name: lesson.title,
              durationMin: lesson.durationMin,
            })),
          }),
          // SEO Tedavi (P0) — görünür SSS ile AYNI sabit; JSON-LD/HTML %100 eşleşir.
          ...(board.course.slug === OFFICE_AI_SEO.slug
            ? [
                faqPageJsonLd(OFFICE_AI_COURSE_FAQ),
                educationalOccupationalProgramJsonLd({
                  slug: board.course.slug,
                  name: board.course.title,
                  description: OFFICE_AI_SEO.description,
                  imagePath: academyCourseCoverPath(board.course.slug) ?? DEFAULT_OG_IMAGE,
                  durationMin: syllabus.durationMin,
                  priceMinor: board.course.priceMinor,
                  priceCurrency: board.course.currencyCode,
                }),
              ]
            : []),
          breadcrumbListJsonLd(
            academyCourseBreadcrumbs({
              slug: board.course.slug,
              title: board.course.title,
            }),
          ),
        ])}
      />
      <BreadcrumbPageLabel href={`/academy/${board.course.slug}`} label={board.course.title} />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={board.course.slug === OFFICE_AI_SEO.slug ? OFFICE_AI_SEO.h1 : board.course.title}
        description={board.course.summary}
        actions={
          <CourseHeroActions
            priceLabel={hero.priceLabel}
            level={level}
            moduleCode={academyModuleCodeBySlug(board.course.slug)}
            hasSealedAudio={academyCourseHasSealedAudio(board.course.slug)}
            comingSoon={academyCourseIsComingSoon(board.course.slug)}
            audioPreview={academyCourseHasCinemaCover(board.course.slug)}
            primaryHref={hero.primaryHref}
            primaryLabel={hero.primaryLabel}
            primaryAction={hero.action}
            paytrCheckout={Boolean(session) && hero.action === "buy" && paymentsReady}
            catalogHref={"/academy" as Route}
            catalogLabel={copy.catalogCta}
          />
        }
      />
      {hasAccess && syllabus.lessonCount > 0 ? (
        <AcademyProgressBar
          value={progressPercent}
          label={playerCopy.progress(completedKeys.length, syllabus.lessonCount)}
        />
      ) : null}
      {continueBoard && !revealExamGate ? <AcademyContinuePanel board={continueBoard} /> : null}
      {hasAccess ? (
        enrolled && examGate?.certificate ? (
          <Card title={copy.certificateEyebrow}>
            <p>{copy.certificateBody}</p>
            {visaPromise ? (
              <p className="mt-2 text-sm text-[var(--foreground)]" data-academy-visa-promise="">
                {visaPromise}
              </p>
            ) : null}
            <div className="mt-4 space-y-4">
              <CertificateSeal
                variant="diploma"
                hash={certificateHash ?? examGate.certificate.serialKey}
                score={examGate.certificate.score}
                issuedAt={examGate.certificate.issuedAt}
                holderName={holderName}
                courseTitle={board.course.title}
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
            nextCourseTitle={progression.bridge.nextTitle}
            nextCourseHref={progression.bridge.nextHref}
          />
        ) : (
          <Card title={copy.eyebrow}>
            <p>{copy.ownedNoExam}</p>
            <div className="mt-4">
              <LinkButton href={`/academy/${board.course.slug}/oyna` as Route} size="sm">
                {playLabel}
              </LinkButton>
            </div>
          </Card>
        )
      ) : access === "expired" ? (
        <Card title={copy.eyebrow}>
          <p>{playerCopy.licenseEnded}</p>
        </Card>
      ) : board.course.purchasable ? (
        <div className="scroll-mt-24" id={ACADEMY_CHECKOUT_HASH}>
          <Card title={copy.purchaseEyebrow}>
            <p>{copy.purchaseBody}</p>
            {visaPromise ? (
              <p className="mt-2 text-sm text-[var(--foreground)]" data-academy-visa-promise="">
                {visaPromise}
              </p>
            ) : null}
            {session ? (
              <div className="mt-4" data-academy-purchase-gate="">
                <PurchaseButton
                  courseId={board.course.id}
                  courseSlug={board.course.slug}
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
              <div className="mt-4 space-y-3" data-academy-purchase-gate="">
                {hero.primaryHref && hero.primaryLabel ? (
                  <LinkButton
                    href={hero.primaryHref as Route}
                    size="sm"
                    data-academy-checkout-cta={hero.action}
                  >
                    {hero.primaryLabel}
                  </LinkButton>
                ) : null}
                <p>
                  {copy.loginLead}{" "}
                  <Link href={buildCitizenLoginHref(academyCheckoutHref(board.course.slug)) as Route} className="text-[var(--safir)] hover:underline">
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
      <CurriculumOutcomes slug={board.course.slug} />
      <CurriculumOutline
        syllabus={syllabus}
        passScore={ACADEMY_EXAM_PASS_SCORE}
        completedKeys={completedKeys}
        showProgress={hasAccess}
        visaPromise={visaPromise}
      />
      {prepStrip ? <PrepStripTeaser strip={prepStrip} /> : null}
      {board.course.slug === OFFICE_AI_SEO.slug ? <OfficeAiGuidePreview /> : null}
      {board.course.slug === OFFICE_AI_SEO.slug ? (
        <LandingFaq heading={OFFICE_AI_FAQ_HEADING} items={OFFICE_AI_COURSE_FAQ} />
      ) : null}
      {!hasAccess && board.course.purchasable ? (
        <p className="text-xs leading-relaxed text-[var(--muted)]">{copy.libraryGuarantee}</p>
      ) : null}
      {!hasAccess && board.course.purchasable ? (
        <Card eyebrow={SEN_VOICE.academy.settlement.title} className="opacity-90">
          <SettlementSteps lockMinutes={PRICE_LOCK_GRACE_MINUTES} />
        </Card>
      ) : null}
    </RoomFrame>
  );
}

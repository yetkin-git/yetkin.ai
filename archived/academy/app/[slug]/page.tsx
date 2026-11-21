import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AcademyViewItem } from "@/components/academy/academy-view-item";
import { BeginCheckoutLink } from "@/components/academy/begin-checkout-link";
import { AcademyCheckoutAutostart } from "@/components/academy/checkout-autostart";
import { AcademyCheckoutAnchor } from "@/components/academy/checkout-anchor";
import { PurchaseButton } from "@/components/academy/purchase-button";
import { ExamStartGate } from "@/components/academy/exam-start-gate";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { AcademyContinuePanel } from "@/components/academy/continue-panel";
import { SettlementSteps } from "@/components/academy/settlement-steps";
import { CurriculumOutline } from "@/components/academy/curriculum-outline";
import { CurriculumOutcomes } from "@/components/academy/curriculum-outcomes";
import { FocusSalePitch } from "@/components/academy/focus-sale-pitch";
import { academyFocusSalePitch } from "@/lib/academy/focus-sale-pitch";
import { academyPublicSaleHold } from "@/lib/academy/sale-hold";
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
import { resolveAcademyAntreHeroCta, academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { academyActorFromSession, hasAcademyAdminBypass, hasAcademyOynaAccess, hasAcademyPlayerAccess } from "@/lib/academy/access";
import { resolveAcademyContinueBoard } from "@/lib/academy/continue-board";
import { LinkButton } from "@/components/ui/link-button";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import { academyProgressPercent } from "@/lib/academy/lesson-meta";
import { academyAntreVisaPromise } from "@/lib/academy/antre-visa";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { OFF_101_EXEMPTION_COURSE_SLUG, OFF_101_EXEMPTION_PATH } from "@/lib/academy/off101-exemption";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { FUNNEL_VITRINE_VISIT_STEP } from "@/lib/kernel/admin/funnel-constants";
import { recordFunnelDailyDocumentStep } from "@/lib/kernel/admin/funnel-document-hit";
import { walletAvailableMinor } from "@/lib/kernel/ledger/load";
import { IconArrow, IconBadge, IconBook, IconHash, IconLock } from "@/components/ui/icons";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { CourseHeroActions } from "@/components/academy/course-hero-actions";
import { CourseDeliverables } from "@/components/academy/course-deliverables";
import { FreePreviewLink } from "@/components/academy/free-preview-link";
import { FreePreviewStage } from "@/components/academy/free-preview-stage";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseCoverPath, academyCourseHasCinemaCover, academyCourseIsComingSoon } from "@/lib/academy/course-cover";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";
import { isPaytrMockCheckoutAllowed } from "@/lib/kernel/payments/paytr/checkout";
import { buildCitizenLoginHref, buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";
import {
  ACADEMY_FLAGSHIP_SKU_SLUG,
  academyCourseHasSealedAudio,
  academyMediaSealedLessonKeys,
  academyReleasedProductionLineParams,
  academyStorefrontStaticParams,
  ACADEMY_OFF201_STOREFRONT_SLUG,
  isAcademyStorefrontSlug,
  isAcademyVitrineShellSkuSlug,
} from "@/lib/academy/pilot-sku";
import {
  academyFreePreviewPlayerPath,
  academyFreePreviewWarmupMp4,
} from "@/lib/academy/free-preview-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { OfficeAiGuidePreview } from "@/components/academy/office-ai-guide-preview";
import { PrepStripTeaser } from "@/components/academy/prep-strip-teaser";
import { academyPrepStripForSlug } from "@/lib/academy/prep-strip";
import {
  academyCourseBreadcrumbs,
  academyCourseTeachesForSlug,
  breadcrumbListJsonLd,
  courseJsonLd,
  educationalOccupationalProgramJsonLd,
  faqPageJsonLd,
  jsonLdDocument,
} from "@/lib/copy/json-ld";
import {
  academyCourseSeoOverride,
  DEFAULT_OG_IMAGE,
  OFFICE_AI_SEO,
  pageMetadata,
} from "@/lib/copy/seo";
import { OFFICE_AI_COURSE_FAQ, OFFICE_AI_FAQ_HEADING } from "@/lib/copy/sem-keywords";
import type { Route } from "next";

export function generateStaticParams() {
  return [
    ...academyStorefrontStaticParams(),
    { slug: ACADEMY_OFF201_STOREFRONT_SLUG },
    ...academyReleasedProductionLineParams(),
  ];
}

/** Vitrinde olmayan slug (python-temel, 06_n8n, eski dikey) next.config 301 → /academy; harita dışı 404. Satın alma bekletmesi yok. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isAcademyStorefrontSlug(slug)) {
    notFound();
  }
  const course = resolveAcademyCourseFromSeed(slug);
  if (!course) {
    notFound();
  }
  // Canlı yayın SEO — altı antre. Title `| yetkin.ai` ile biter ve mutlak basılır.
  // Sicil/sertifika başlığı (`course.title`) değişmez; yalnız meta dalı override edilir.
  const seo = academyCourseSeoOverride(course.slug);
  return pageMetadata({
    title: seo?.title ?? `${course.title} · Akademi`,
    description: seo?.description ?? course.summary,
    path: `/academy/${course.slug}`,
    image: academyCourseCoverPath(course.slug) ?? DEFAULT_OG_IMAGE,
    keywords: seo?.keywords,
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
  if (!isAcademyStorefrontSlug(slug)) {
    notFound();
  }
  const gate = gateQuery?.gate;
  if (slug === OFF_101_EXEMPTION_COURSE_SLUG && gate === "exemption") {
    redirect(OFF_101_EXEMPTION_PATH);
  }
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const [purchase, artifact, holderName, progression] = await Promise.all([
    session
      ? loadPurchaseForUserCourse(session.id, board.course.id, session.email, session.emailConfirmedAt)
      : Promise.resolve(null),
    session
      ? loadArtifactPurchaseForUserCourse(
          session.id,
          board.course.id,
          session.email,
          session.emailConfirmedAt,
        )
      : Promise.resolve(null),
    session ? loadAcademyHolderName(session.id) : Promise.resolve("Aday"),
    loadAcademyProgressionForCourse({
      userId: session?.id ?? null,
      email: session?.email,
      emailConfirmedAt: session?.emailConfirmedAt,
      currentSlug: board.course.slug,
    }),
  ]);
  const holdsSeat =
    session != null && hasAcademyOynaAccess(purchase, academyActorFromSession(session));
  if (!board.course.isPublished && !holdsSeat) {
    notFound();
  }
  const actor = session ? academyActorFromSession(session) : null;
  const isAdminBypass = actor != null && hasAcademyAdminBypass(actor);
  if (isAdminBypass && !gate) {
    redirect(`/academy/${board.course.slug}/oyna`);
  }
  await recordFunnelDailyDocumentStep(FUNNEL_VITRINE_VISIT_STEP);
  const labPlayer =
    process.env.NODE_ENV !== "production" &&
    actor != null &&
    hasAcademyPlayerAccess(purchase, actor);
  const enrolled = hasCommercialAcademyEnrolment(purchase);
  const hasAccess = enrolled || labPlayer || isAdminBypass;
  const access = hasAccess ? "enrolled" : academyStorefrontAccess(artifact);
  const [examGate, wallet, player] = await Promise.all([
    session && enrolled
      ? loadExamGateForUserCourse(session.id, board.course.id, session.email, session.emailConfirmedAt)
      : Promise.resolve(null),
    session && !hasAccess
      ? loadAcademyWalletBoard(session.id)
      : Promise.resolve(null),
    session && hasAccess
      ? loadCurriculumPlayerForUser(session.id, board.course.id, session.email, session.emailConfirmedAt)
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
  const isOff201 = board.course.slug === ACADEMY_OFF201_STOREFRONT_SLUG;
  const isGuide = isAcademyVitrineShellSkuSlug(board.course.slug);
  const eightLessonShield = board.course.slug === "01_office_ai";
  const seo = academyCourseSeoOverride(board.course.slug);
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
  const saleHold =
    !hasAccess && !board.course.purchasable ? academyPublicSaleHold(board.course) : null;
  const playLabel =
    continueBoard && continueBoard.completedCount > 0
      ? playerCopy.resumeCta
      : playerCopy.openCta;
  const progressPercent = academyProgressPercent(completedKeys.length, syllabus.lessonCount);
  const showFreePreview = !hasAccess && academyCourseOffersFreePreview(board.course.slug);
  const previewHref = showFreePreview ? academyFreePreviewPlayerPath(board.course.slug) : null;
  const previewMp4 = showFreePreview ? academyFreePreviewWarmupMp4(board.course.slug) : null;
  const workfileNext = academyFreePreviewPlayerPath(board.course.slug);
  const isFlagship = board.course.slug === ACADEMY_FLAGSHIP_SKU_SLUG;
  const outcomeLead = academyFocusSalePitch(board.course.slug)?.find((row) => row.id === "result")?.text;

  return (
    <RoomFrame className="space-y-5" data-academy-lab-player={labPlayer ? "true" : undefined}>
      <AcademyViewItem
        itemId={board.course.slug}
        itemName={board.course.title}
        valueMinor={board.course.priceMinor}
        currency={board.course.currencyCode}
      />
      <JsonLd
        data={jsonLdDocument([
          courseJsonLd({
            slug: board.course.slug,
            title: seo?.title ?? board.course.title,
            description: seo?.description ?? board.course.summary,
            imagePath: academyCourseCoverPath(board.course.slug) ?? DEFAULT_OG_IMAGE,
            datePublished: board.course.createdAt,
            priceMinor: board.course.priceMinor,
            priceCurrency: board.course.currencyCode,
            teaches: academyCourseTeachesForSlug(board.course.slug),
            lessons: syllabus.lessons.map((lesson) => ({
              name: lesson.title,
              durationMin: lesson.durationMin,
            })),
          }),
          // SEO Tedavi (P0) — görünür SSS ile AYNI sabit; JSON-LD/HTML %100 eşleşir.
          ...(board.course.slug === OFFICE_AI_SEO.slug
            ? [faqPageJsonLd(OFFICE_AI_COURSE_FAQ)]
            : []),
          ...(seo
            ? [
                educationalOccupationalProgramJsonLd({
                  slug: board.course.slug,
                  name: board.course.title,
                  description: seo.description,
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
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-5 py-6 text-white shadow-md sm:px-6 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.35),transparent_68%)]"
        />
        <div className="relative">
      <PageHeader
        tone="ink"
        eyebrow={copy.eyebrow}
        title={seo?.h1 ?? board.course.title}
        description={outcomeLead ?? board.course.summary}
        actions={
          <CourseHeroActions
            priceLabel={saleHold ?? hero.priceLabel}
            level={isOff201 ? null : level}
            moduleCode={academyModuleCodeBySlug(board.course.slug)}
            hasSealedAudio={academyCourseHasSealedAudio(board.course.slug)}
            narration={isOff201}
            narrationLabel={
              isOff201
                ? SEN_VOICE.academy.catalog.sealedLessonBadge(
                    academyMediaSealedLessonKeys(board.course.slug).length,
                    curriculumLessonKeysForSlug(board.course.slug).length,
                  )
                : undefined
            }
            comingSoon={isGuide ? false : academyCourseIsComingSoon(board.course.slug)}
            audioPreview={academyCourseHasCinemaCover(board.course.slug)}
            primaryHref={hero.primaryHref}
            primaryLabel={hero.primaryLabel}
            primaryAction={hero.action}
            itemId={board.course.slug}
            itemName={board.course.title}
            valueMinor={board.course.priceMinor}
            currency={board.course.currencyCode}
            paytrCheckout={Boolean(session) && hero.action === "buy" && paymentsReady}
            previewHref={previewHref}
            catalogHref={"/academy" as Route}
            catalogLabel={copy.catalogCta}
            tone="ink"
          />
        }
      />
          <ul className="mt-4 flex flex-wrap gap-2">
            {syllabus.lessonCount > 0 ? (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                <IconBook className="h-3.5 w-3.5" />
                {syllabus.lessonCount} ders
                {syllabus.durationMin > 0 ? ` · ${syllabus.durationMin} dk` : ""}
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
              <IconBadge className="h-3.5 w-3.5" />
              Baraj {ACADEMY_EXAM_PASS_SCORE}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
              <IconHash className="h-3.5 w-3.5" />
              Sertifika SHA-256 özeti
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
              <IconLock className="h-3.5 w-3.5" />
              365 gün kütüphane
            </li>
          </ul>
        </div>
      </section>
      {board.course.slug === OFF_101_EXEMPTION_COURSE_SLUG ? (
        <Card title={SEN_VOICE.academy.exemption.guestTitle}>
          <p className="text-sm leading-6 text-[var(--muted)]">{SEN_VOICE.academy.exemption.courseLead}</p>
          <div className="mt-4">
            <LinkButton href={OFF_101_EXEMPTION_PATH} size="lg" variant="success" data-academy-exemption-entry="">
              {SEN_VOICE.academy.exemption.cta}
            </LinkButton>
          </div>
        </Card>
      ) : null}
      {previewMp4 && previewHref ? (
        <FreePreviewStage
          mp4Src={previewMp4}
          poster={academyCourseCoverPath(board.course.slug)}
          playerHref={previewHref}
          signedIn={Boolean(session)}
          loginHref={buildCitizenLoginHref(workfileNext)}
          registerHref={buildCitizenRegisterHref(workfileNext)}
          offerWorkfile={isFlagship}
        />
      ) : null}
      <FocusSalePitch slug={board.course.slug} previewHref={previewHref} />
      {isFlagship ? <CourseDeliverables /> : null}
      {saleHold ? (
        <p className="text-sm font-medium leading-6 text-[var(--foreground)]" data-academy-sale-hold="">
          {saleHold}
        </p>
      ) : null}
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
                <IconArrow className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
          </Card>
        )
      ) : access === "expired" && !board.course.purchasable ? (
        <Card title={copy.eyebrow}>
          <p>{playerCopy.licenseEndedClosed}</p>
          {saleHold ? <p className="mt-2 text-sm text-[var(--muted)]">{saleHold}</p> : null}
          {previewHref ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <FreePreviewLink href={previewHref} surface="expired" className="w-full sm:w-auto" />
              <p className="text-sm text-[var(--muted)]">{copy.previewLead}</p>
            </div>
          ) : null}
        </Card>
      ) : board.course.purchasable ? (
        <AcademyCheckoutAnchor>
          <Card
            title={isGuide ? SEN_VOICE.academy.catalog.examSealEyebrow : copy.purchaseEyebrow}
            className="border-blue-200/80 shadow-md ring-1 ring-blue-100"
          >
            {access === "expired" ? <p>{playerCopy.licenseEnded}</p> : null}
            <p className={access === "expired" ? "mt-2" : undefined}>
              {isGuide
                ? SEN_VOICE.academy.catalog.examSealBody
                : eightLessonShield
                  ? copy.purchaseBody
                  : copy.purchaseBodyPlain}
            </p>
            {board.course.slug === ACADEMY_OFF201_STOREFRONT_SLUG ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]" data-academy-advisory="">
                {SEN_VOICE.academy.catalog.off201Advisory}
              </p>
            ) : null}
            {visaPromise ? (
              <p className="mt-2 text-sm text-[var(--foreground)]" data-academy-visa-promise="">
                {visaPromise}
              </p>
            ) : null}
            {session ? (
              <div className="mt-4 space-y-4" data-academy-purchase-gate="">
                <AcademyCheckoutAutostart enabled={paymentsReady && hero.action === "buy"} />
                {previewHref ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <FreePreviewLink
                      href={previewHref}
                      surface="purchase"
                      className="w-full sm:w-auto"
                    />
                    <p className="text-sm text-[var(--muted)]">{copy.previewLead}</p>
                  </div>
                ) : null}
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
                  renew={access === "expired"}
                  sealOnly={isGuide}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3" data-academy-purchase-gate="">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {previewHref ? (
                    <FreePreviewLink
                      href={previewHref}
                      surface="purchase"
                      className="w-full sm:w-auto"
                    />
                  ) : null}
                  {hero.primaryHref && hero.primaryLabel ? (
                    hero.action === "play" ? (
                      <LinkButton
                        href={hero.primaryHref as Route}
                        size="lg"
                        variant="success"
                        className="w-full sm:w-auto"
                        data-academy-checkout-cta={hero.action}
                      >
                        {hero.primaryLabel}
                      </LinkButton>
                    ) : (
                      <BeginCheckoutLink
                        href={hero.primaryHref as Route}
                        size="lg"
                        className="w-full sm:w-auto"
                        data-academy-checkout-cta={hero.action}
                        itemId={board.course.slug}
                        itemName={board.course.title}
                        valueMinor={board.course.priceMinor}
                        currency={board.course.currencyCode}
                      >
                        {hero.primaryLabel}
                      </BeginCheckoutLink>
                    )
                  ) : null}
                  {isGuide && priceLabel ? (
                    <BeginCheckoutLink
                      href={buildCitizenLoginHref(academyCheckoutHref(board.course.slug)) as Route}
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                      data-academy-checkout-cta="buy"
                      itemId={board.course.slug}
                      itemName={board.course.title}
                      valueMinor={board.course.priceMinor}
                      currency={board.course.currencyCode}
                    >
                      {SEN_VOICE.academy.catalog.examSealCta}
                    </BeginCheckoutLink>
                  ) : null}
                </div>
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
        </AcademyCheckoutAnchor>
      ) : isGuide ? (
        <Card title={SEN_VOICE.academy.catalog.examSealEyebrow}>
          <p>{SEN_VOICE.academy.catalog.examSealClosed}</p>
          <div className="mt-4">
            <LinkButton href={`/academy/${board.course.slug}/oyna` as Route} size="sm">
              {SEN_VOICE.academy.catalog.cardCtaStartGuide}
            </LinkButton>
          </div>
        </Card>
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
        showKind={!isOff201}
        showExamShield={eightLessonShield}
        freemium={showFreePreview}
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JuniorPackageDoor } from "@/components/junior/package-door";
import { LessonChain } from "@/components/junior/lesson-chain";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref, buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import {
  isJuniorAuditActor,
  isJuniorCheckoutLocked,
  JUNIOR_CHECKOUT_LOCKED_ERROR,
} from "@/lib/kernel/security/junior-gate";
import { juniorBookletCopy, juniorLessonMicroQuestion } from "@/lib/junior/booklet";
import { juniorCourseByLessonKey, juniorCourseSealed, juniorLessonAccess } from "@/lib/junior/catalog";
import { juniorLessonCurriculumLabel } from "@/lib/junior/curriculum-label";
import { juniorShortTopicLabel } from "@/lib/junior/short-topic";
import { juniorLessonGate } from "@/lib/junior/enter";
import { juniorCourseTitleFromLessonKey } from "@/lib/junior/human-titles";
import {
  JUNIOR_QUIZ_MIN_ITEMS,
  JUNIOR_QUIZ_PREPARING_LABEL,
  isJuniorPilotTrialLesson,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_PILOT_PUBLIC_NOTE,
  JUNIOR_PILOT_PUBLIC_TITLE,
  juniorPaidActionError,
  juniorQuizControlLabel,
} from "@/lib/junior/limits";
import { juniorQuizPack } from "@/lib/junior/quiz";
import { loadJuniorLessonPage } from "@/lib/junior/load";
import { juniorLessonPageMetadata, juniorPublicLessonJsonLd } from "@/lib/junior/seo";
import { juniorWebPlaybackMedia } from "@/lib/junior/media-grant";
import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { isLockedTimeline } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import {
  getPilotTimelineForLesson,
  loadPilotTimelineForLesson,
} from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { isJuniorPilotPlaybackLesson } from "@/lib/junior/pilot-engine/playback-key";
import {
  JUNIOR_MAT6_LOCKED_NARRATION_MS,
  JUNIOR_SHORT_NARRATION_LESSON_KEY,
  juniorNarrationBandWarning,
} from "@/lib/junior/narration-band";
import { readJuniorLesson, readJuniorPilotTrialFace } from "@/lib/junior/service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonKey: string }>;
}): Promise<Metadata> {
  const { lessonKey } = await params;
  return juniorLessonPageMetadata(lessonKey);
}

export default async function JuniorLessonPage({
  params,
}: {
  params: Promise<{ lessonKey: string }>;
}) {
  const { lessonKey } = await params;
  const session = await getSession();
  const actor = session
    ? { id: session.id, email: session.email, emailConfirmedAt: session.emailConfirmedAt ?? null }
    : null;
  const page = session
    ? await loadJuniorLessonPage(session.id, lessonKey)
    : {
        ready: true,
        profileId: null,
        nickname: null,
        selectedElectives: [] as string[],
        tellPassed: false,
        lessonDone: false,
        planActive: false,
      };
  const gate = juniorLessonGate(actor, lessonKey, {
    active: page.planActive,
    selectedElectives: page.selectedElectives,
    profileId: page.profileId,
  });
  const lesson = readJuniorLesson(lessonKey, gate.renderPlan);
  if (lesson.access === "missing" || (!gate.lesson.allow && gate.lesson.reason === "missing")) {
    notFound();
  }
  const course = juniorCourseByLessonKey(lessonKey);
  const electiveDraft = course?.track === "elective" && !juniorCourseSealed(course);
  const courseLabel = juniorCourseTitleFromLessonKey(lessonKey) ?? lesson.courseTitle;
  const publicFree =
    juniorCourseByLessonKey(lessonKey) !== null && juniorLessonAccess(lessonKey) === "free";
  const structured = publicFree ? juniorPublicLessonJsonLd(lessonKey) : null;
  const trialFace = lesson.access === "locked" ? readJuniorPilotTrialFace(lessonKey) : null;
  const quizReady = lesson.access === "free" && lesson.quiz.length >= JUNIOR_QUIZ_MIN_ITEMS;
  const isAuditActor = isJuniorAuditActor(actor);
  const canAct = Boolean((gate.paid.allow && page.profileId) || isAuditActor);
  const pilotFreeTrial = isJuniorPilotTrialLesson(lessonKey) && lesson.access === "free";
  const trialOpen = trialFace !== null;
  const recording = canAct || pilotFreeTrial || trialOpen ? "open" : "locked";
  const quizSlot = quizReady ? (canAct || pilotFreeTrial ? "ready" : "locked") : "preparing";
  const quizControlTitle =
    lesson.access === "free"
      ? juniorQuizControlLabel(lesson.quiz.length)
      : juniorQuizControlLabel(juniorQuizPack(lessonKey)?.questions.length);
  const auditOpen = lesson.access === "free" && gate.lesson.allow && gate.lesson.via === "audit";
  const playback = juniorWebPlaybackMedia({
    lessonKey,
    catalogLocked: juniorLessonAccess(lessonKey) === "locked",
    opened: lesson.access === "free",
  });

  const resolvedTimeline = getPilotTimelineForLesson(lessonKey);
  const studioFlow = isJuniorPilotPlaybackLesson(lessonKey) || isLockedTimeline(resolvedTimeline);
  const pilotTimeline = studioFlow
    ? ((await loadPilotTimelineForLesson(lessonKey)) ?? resolvedTimeline)
    : null;
  const measuredNarrationMs =
    pilotTimeline?.audio.durationMs ??
    (lessonKey === JUNIOR_SHORT_NARRATION_LESSON_KEY ? JUNIOR_MAT6_LOCKED_NARRATION_MS : null);
  const narrationBand =
    measuredNarrationMs === null
      ? null
      : juniorNarrationBandWarning(lessonKey, measuredNarrationMs);
  const openerFace = lessonKey.trim() === JUNIOR_FREE_LESSON_KEY;
  const curriculumLabel = course ? juniorLessonCurriculumLabel(course.slug, lessonKey) : null;
  const shortTopicLabel = juniorShortTopicLabel(lessonKey);
  const returnPath = `/junior/ders/${lessonKey}`;
  const guestPilotTrial = !session && isJuniorPilotTrialLesson(lessonKey) && (pilotFreeTrial || trialOpen);
  const accountGate =
    guestPilotTrial || isAuditActor
      ? "ready"
      : !session
        ? "account"
        : !page.profileId
          ? "profile"
          : "ready";

  return (
    <RoomFrame
      cinema
      data-junior-lesson-layout={studioFlow ? "studio-flow" : "rail"}
      data-junior-narration-band={narrationBand?.flag}
      data-junior-lesson-contract="catalog"
      className={
        studioFlow
          ? "flex w-full flex-col gap-3 space-y-0 pb-6"
          : "flex h-full min-h-0 w-full flex-1 flex-col gap-1.5 space-y-0 overflow-hidden pb-0"
      }
    >
      {structured ? <JsonLd data={structured} /> : null}
      <BreadcrumbPageLabel href="/junior" label={courseLabel} />
      <BreadcrumbPageLabel href={`/junior/ders/${lessonKey}`} label={lesson.title} />
      <PageHeader
        tight
        className="shrink-0"
        titleClassName="text-lg leading-tight sm:text-xl"
        title={openerFace ? JUNIOR_PILOT_PUBLIC_TITLE : lesson.title}
        description={
          auditOpen
            ? `Denetim açık. Anlatış ve ${quizControlTitle} kendi test profilinle yürür. Nakit satırı yazılmaz.`
            : openerFace
              ? JUNIOR_PILOT_PUBLIC_NOTE
              : undefined
        }
        actions={
          <>
            <span className="ml-auto inline-flex h-8 max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--safir)_35%,var(--border))] bg-[var(--safir-soft)] px-2.5 text-xs font-semibold text-[var(--safir-deep)]">
              {courseLabel}
            </span>
            {curriculumLabel ? (
              <span
                data-junior-curriculum-label=""
                className="inline-flex h-8 max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--amber)_40%,var(--border))] bg-[var(--amber-soft)] px-2.5 text-xs font-semibold text-[var(--amber)]"
              >
                {curriculumLabel}
              </span>
            ) : null}
            {shortTopicLabel ? (
              <span
                data-junior-short-topic=""
                className="inline-flex h-8 max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--amber)_40%,var(--border))] bg-[var(--amber-soft)] px-2.5 text-xs font-semibold text-[var(--amber)]"
              >
                {shortTopicLabel}
              </span>
            ) : null}
            <LinkButton href="/junior" variant="outline" size="sm" className="shrink-0">
              Ders listesi
            </LinkButton>
          </>
        }
      />
      {narrationBand ? (
        <p className="shrink-0 text-sm font-semibold text-[var(--muted)]" data-junior-short-narration="">
          Bu anlatım 3 dakikanın altında ({Math.round(narrationBand.measuredDurationMs / 1000)} sn). Tam ders gibi durmaz.
        </p>
      ) : null}
      {electiveDraft ? (
        <section className="junior-shield-card shrink-0 rounded-xl border border-[var(--border)] p-3">
          <p className="text-sm font-semibold text-[var(--muted)]">
            {JUNIOR_QUIZ_PREPARING_LABEL}. Bu konu henüz tam ders değildir. Sesi, sorusu ve ısınması hazır olunca açılır.
          </p>
        </section>
      ) : null}
      {!electiveDraft && "preparing" in lesson && lesson.preparing ? (
        <p className="shrink-0 text-sm font-semibold text-[var(--muted)]">
          {JUNIOR_QUIZ_PREPARING_LABEL}. Bu konu henüz tam ders değildir.
        </p>
      ) : null}
      {!page.ready ? (
        <p className="shrink-0 text-sm text-[var(--rose)]">Profil kaydı şu an yazılamıyor.</p>
      ) : null}
      {!electiveDraft && lesson.access === "locked" && !trialFace ? (
        <section className="junior-shield-card shrink-0 rounded-xl border border-[var(--border)] p-3">
          <p>{lesson.teaser}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Her kartın ilk konusu ücretsizdir. İkinci konu için{" "}
            {juniorPaidActionError(juniorQuizPack(lessonKey)?.questions.length)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session ? (
              <JuniorPackageDoor
                checkoutOpen={!isJuniorCheckoutLocked()}
                closedMessage={JUNIOR_CHECKOUT_LOCKED_ERROR}
              />
            ) : (
              <LinkButton href={buildCitizenLoginHref(`/junior/ders/${lessonKey}`)} size="sm">
                Veli girişi
              </LinkButton>
            )}
          </div>
        </section>
      ) : null}
      {!electiveDraft && lesson.access === "free" ? (
        <LessonChain
          profileId={page.profileId ?? ""}
          nickname={page.nickname}
          lessonKey={lessonKey}
          title={lesson.title}
          script={lesson.script}
          scene={lesson.scene}
          mebNote={lesson.mebNote}
          lifeUse={lesson.lifeUse}
          steps={lesson.steps}
          outcomes={lesson.outcomes}
          booklet={juniorBookletCopy(lessonKey)}
          tellPassed={page.tellPassed}
          lessonDone={page.lessonDone}
          quiz={lesson.quiz}
          activities={lesson.activities}
          tellGuides={lesson.tellGuides}
          recording={recording}
          quizSlot={quizSlot}
          accountGate={accountGate}
          loginHref={buildCitizenLoginHref(returnPath)}
          registerHref={buildCitizenRegisterHref(returnPath)}
          profileHref="/junior#cocuk-profili"
          grantedAudioUrl={playback.audioUrl}
          grantedWarmupUrl={playback.warmupUrl}
          lockPublicMedia={playback.lockPublicMedia}
          microQuestion={juniorLessonMicroQuestion(lessonKey)}
          pilotTimeline={pilotTimeline}
        />
      ) : null}
      {trialFace ? (
        <>
          <p className="shrink-0 text-sm font-semibold text-[var(--muted)]">
            Bu konuda bir kez anlatış ve bir kez konu testi ücretsizdir. İkinci deneme veli girişi ile yıllık paket ister.
          </p>
          <LessonChain
            profileId={page.profileId ?? ""}
            nickname={page.nickname}
            lessonKey={lessonKey}
            title={trialFace.title}
            script={trialFace.script}
            scene={trialFace.scene}
            mebNote={trialFace.mebNote}
            lifeUse={trialFace.lifeUse}
            steps={trialFace.steps}
            outcomes={trialFace.outcomes}
            booklet={juniorBookletCopy(lessonKey)}
            tellPassed={page.tellPassed}
            lessonDone={page.lessonDone}
            quiz={trialFace.quiz}
            activities={trialFace.activities}
            tellGuides={trialFace.tellGuides}
            recording={recording}
            quizSlot={trialFace.quiz.length >= JUNIOR_QUIZ_MIN_ITEMS ? "ready" : "preparing"}
            accountGate={accountGate}
            loginHref={buildCitizenLoginHref(returnPath)}
            registerHref={buildCitizenRegisterHref(returnPath)}
            profileHref="/junior#cocuk-profili"
            grantedAudioUrl={null}
            grantedWarmupUrl={null}
            lockPublicMedia
            microQuestion={juniorLessonMicroQuestion(lessonKey)}
            pilotTimeline={pilotTimeline}
          />
        </>
      ) : null}
    </RoomFrame>
  );
}

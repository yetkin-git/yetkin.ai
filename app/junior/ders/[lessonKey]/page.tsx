import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonChain } from "@/components/junior/lesson-chain";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { juniorBookletCopy, juniorLessonMicroQuestion } from "@/lib/junior/booklet";
import { juniorCourseByLessonKey, juniorLessonAccess } from "@/lib/junior/catalog";
import { juniorLessonGate } from "@/lib/junior/enter";
import { juniorCourseTitleFromLessonKey } from "@/lib/junior/human-titles";
import {
  JUNIOR_QUIZ_CONTROL_LABEL,
  JUNIOR_QUIZ_MIN_ITEMS,
  JUNIOR_QUIZ_PREPARING_LABEL,
} from "@/lib/junior/limits";
import { loadJuniorLessonPage } from "@/lib/junior/load";
import { juniorLessonPageMetadata, juniorPublicLessonJsonLd } from "@/lib/junior/seo";
import { juniorWebPlaybackMedia } from "@/lib/junior/media-grant";
import { readJuniorLesson } from "@/lib/junior/service";

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
  const session = await getSession();
  const { lessonKey } = await params;
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
  const courseLabel = juniorCourseTitleFromLessonKey(lessonKey) ?? lesson.courseTitle;
  const publicFree =
    juniorCourseByLessonKey(lessonKey) !== null && juniorLessonAccess(lessonKey) === "free";
  const structured = publicFree ? juniorPublicLessonJsonLd(lessonKey) : null;
  const quizReady = lesson.access === "free" && lesson.quiz.length >= JUNIOR_QUIZ_MIN_ITEMS;
  const canAct = Boolean(gate.paid.allow && page.profileId);
  const recording = canAct ? "open" : "locked";
  const quizSlot = quizReady ? (canAct ? "ready" : "locked") : "preparing";
  const auditOpen = lesson.access === "free" && gate.lesson.allow && gate.lesson.via === "audit";
  const playback = juniorWebPlaybackMedia({
    lessonKey,
    catalogLocked: juniorLessonAccess(lessonKey) === "locked",
    opened: lesson.access === "free",
  });

  return (
    <RoomFrame className="space-y-3 pb-12">
      {structured ? <JsonLd data={structured} /> : null}
      <BreadcrumbPageLabel href="/junior" label={courseLabel} />
      <BreadcrumbPageLabel href={`/junior/ders/${lessonKey}`} label={lesson.title} />
      <PageHeader
        tight
        className="shrink-0"
        title={lesson.title}
        description={
          auditOpen
            ? `Denetim açık. Anlatış ve ${JUNIOR_QUIZ_CONTROL_LABEL} kendi test profilinle yürür. Nakit satırı yazılmaz.`
            : undefined
        }
        actions={
          <>
            <span className="ml-auto inline-flex h-8 max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--safir)_35%,var(--border))] bg-[var(--safir-soft)] px-2.5 text-xs font-semibold text-[var(--safir-deep)]">
              {courseLabel}
            </span>
            <LinkButton href="/junior" variant="outline" size="sm" className="shrink-0">
              Ders listesi
            </LinkButton>
          </>
        }
      />
      {"preparing" in lesson && lesson.preparing ? (
        <p className="shrink-0 text-sm font-semibold text-[var(--muted)]">
          {JUNIOR_QUIZ_PREPARING_LABEL}. Bu konu henüz tam ders değildir.
        </p>
      ) : null}
      {!page.ready ? (
        <p className="shrink-0 text-sm text-[var(--rose)]">Profil kaydı şu an yazılamıyor.</p>
      ) : null}
      {lesson.access === "locked" ? (
        <section className="junior-shield-card shrink-0 rounded-xl border border-[var(--border)] p-3">
          <p>{lesson.teaser}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Her dersin ilk konusu ücretsizdir. İkinci konu, anlatış kaydı ve {JUNIOR_QUIZ_CONTROL_LABEL} veli
            girişi ile yıllık paket ister.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session ? (
              <LinkButton href="/junior/checkout" size="sm">
                Paketi gör
              </LinkButton>
            ) : (
              <LinkButton href={buildCitizenLoginHref(`/junior/ders/${lessonKey}`)} size="sm">
                Veli girişi
              </LinkButton>
            )}
          </div>
        </section>
      ) : null}
      {lesson.access === "free" ? (
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
          grantedAudioUrl={playback.audioUrl}
          grantedWarmupUrl={playback.warmupUrl}
          lockPublicMedia={playback.lockPublicMedia}
          microQuestion={juniorLessonMicroQuestion(lessonKey)}
        />
      ) : null}
    </RoomFrame>
  );
}

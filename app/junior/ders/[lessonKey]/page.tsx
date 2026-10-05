import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonChain } from "@/components/junior/lesson-chain";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { readJuniorLesson } from "@/lib/junior/service";
import { JUNIOR_PAID_ACTION_ERROR, JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import { loadJuniorLessonPage } from "@/lib/junior/load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function JuniorLessonPage({
  params,
}: {
  params: Promise<{ lessonKey: string }>;
}) {
  const session = await getSession();
  const { lessonKey } = await params;
  const page = session
    ? await loadJuniorLessonPage(session.id, lessonKey)
    : {
        ready: true,
        lesson: readJuniorLesson(lessonKey),
        profileId: null,
        tellPassed: false,
        lessonDone: false,
        planActive: false,
      };
  if (page.lesson.access === "missing") {
    notFound();
  }
  const quizReady = page.lesson.access === "free" && page.lesson.quiz.length >= JUNIOR_QUIZ_MIN_ITEMS;
  const canAct = Boolean(session && page.planActive && page.profileId);
  const recording = canAct ? "open" : "locked";
  const quizSlot = quizReady ? (canAct ? "ready" : "locked") : "preparing";

  return (
    <RoomFrame className="space-y-2 lg:-my-8 lg:flex lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:min-h-0 lg:flex-col lg:gap-2 lg:space-y-0 lg:overflow-hidden lg:py-2">
      <PageHeader
        tight
        className="shrink-0"
        title={page.lesson.title}
        description={
          page.lesson.access === "free"
            ? "İlk konu ücretsizdir. Anlatış kaydı ve konu testi veli girişi ile yıllık paket ister."
            : "Bu konu veli girişi ve yıllık paket ister."
        }
        actions={
          <>
            <span className="ml-auto inline-flex h-8 max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--safir)_35%,var(--border))] bg-[var(--safir-soft)] px-2.5 text-xs font-semibold text-[var(--safir-deep)]">
              {page.lesson.courseTitle}
            </span>
            <LinkButton href="/junior" variant="outline" size="sm" className="shrink-0">
              Ders listesi
            </LinkButton>
          </>
        }
      />
      {!page.ready ? (
        <p className="shrink-0 text-sm text-[var(--rose)]">Profil kaydı şu an yazılamıyor.</p>
      ) : null}
      {page.lesson.access === "locked" ? (
        <section className="junior-shield-card shrink-0 rounded-xl border border-[var(--border)] p-3">
          <p>{page.lesson.teaser}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Her dersin ilk konusu ücretsizdir. İkinci konu, anlatış kaydı ve konu testi veli girişi ile yıllık paket ister.
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
      {page.lesson.access === "free" ? (
        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
          {!canAct ? <p className="shrink-0 text-sm text-[var(--muted)]">{JUNIOR_PAID_ACTION_ERROR}</p> : null}
          <LessonChain
            profileId={page.profileId ?? ""}
            lessonKey={lessonKey}
            title={page.lesson.title}
            script={page.lesson.script}
            scene={page.lesson.scene}
            mebNote={page.lesson.mebNote}
            lifeUse={page.lesson.lifeUse}
            steps={page.lesson.steps}
            tellPassed={page.tellPassed}
            lessonDone={page.lessonDone}
            quiz={page.lesson.quiz}
            recording={recording}
            quizSlot={quizSlot}
          />
        </div>
      ) : null}
    </RoomFrame>
  );
}

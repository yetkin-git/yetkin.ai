"use client";

import { ActivityRail } from "@/components/junior/activity-rail";
import { LessonBooklet } from "@/components/junior/lesson-booklet";
import { TopicQuiz } from "@/components/junior/topic-quiz";
import type { JuniorAccountGate } from "@/components/junior/account-gate-modal";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import {
  juniorPaidActionError,
  JUNIOR_QUIZ_PREPARING_LABEL,
  isJuniorPilotTrialLesson,
} from "@/lib/junior/limits";
import type { JuniorPracticeChoice, JuniorVectorScene } from "@/lib/junior/types";

export type JuniorHubModule = "activities" | "tests" | "notes" | "tutor";

const MODULES = [
  { id: "activities", label: "🎮 Etkinlikler ve Bulmacalar" },
  { id: "tests", label: "📝 Soru Bankası ve Testler" },
  { id: "notes", label: "📘 Ders Notu ve Zihin Haritası" },
  { id: "tutor", label: "👨‍🏫 Selim Öğretmen'e Sor" },
] as const satisfies readonly { id: JuniorHubModule; label: string }[];

export function ActivityHub({
  module,
  onModule,
  profileId,
  lessonKey,
  title,
  scene,
  outcomes = [],
  lifeUse,
  booklet,
  activities,
  quiz,
  quizSlot,
  tellPassed,
  onQuizCompleted,
  accountGate = "ready",
  onNeedAccount,
  chrome = "tabs",
}: {
  module: JuniorHubModule;
  onModule: (next: JuniorHubModule) => void;
  profileId: string;
  lessonKey: string;
  title: string;
  scene: JuniorVectorScene;
  outcomes?: readonly string[];
  lifeUse: string;
  booklet: JuniorBookletCopy;
  activities: readonly JuniorActivityPublic[];
  quiz: JuniorPracticeChoice[];
  quizSlot: "ready" | "preparing" | "locked";
  tellPassed: boolean;
  onQuizCompleted?: () => void;
  accountGate?: JuniorAccountGate;
  onNeedAccount?: () => void;
  /** `panel` stüdyo düzeninde sekmeyi sağ raya bırakır. Diğer dersler `tabs` kalır. */
  chrome?: "tabs" | "panel";
}) {
  const modules = activities.length > 0 ? MODULES : MODULES.filter((item) => item.id !== "activities");
  const active = modules.find((item) => item.id === module) ?? modules[0] ?? MODULES[1];
  const panelId = `junior-hub-${active.id}`;

  return (
    <section
      id={chrome === "tabs" ? "junior-activity-hub" : undefined}
      data-junior-activity-hub=""
      className="grid gap-3"
    >
      {chrome === "tabs" ? (
      <div role="tablist" aria-label="Konu içerik modülleri" className="flex flex-wrap gap-2">
        {modules.map((item) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`junior-hub-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`junior-hub-${item.id}`}
              className={`rounded-full border px-3 py-1.5 text-left text-sm font-semibold ${
                selected
                  ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                  : "border-[var(--border)] bg-white"
              }`}
              onClick={() => onModule(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      ) : null}
      <div role="tabpanel" id={panelId} aria-labelledby={`junior-hub-tab-${active.id}`} className="grid gap-3">
        {active.id === "activities" && activities.length > 0 ? (
          <ActivityRail profileId={profileId} lessonKey={lessonKey} items={[...activities]} />
        ) : null}
        {active.id === "tests" ? (
          <TestBank
            profileId={profileId}
            lessonKey={lessonKey}
            quiz={quiz}
            quizSlot={quizSlot}
            tellPassed={tellPassed}
            accountGate={accountGate}
            onNeedAccount={onNeedAccount}
            onQuizCompleted={onQuizCompleted}
          />
        ) : null}
        {active.id === "notes" ? (
          <LessonBooklet
            title={title}
            scene={scene}
            concept={booklet.concept}
            example={booklet.example}
            warning={booklet.warning}
            recap={booklet.recap}
            lifeUse={lifeUse}
            outcomes={outcomes}
            hint={booklet.hint}
            heroQuestion={booklet.heroQuestion}
            heroFocus={booklet.heroFocus}
          />
        ) : null}
        {active.id === "tutor" ? (
          <p className="rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm font-semibold text-sky-950">
            Selim Öğretmen stüdyo derslerinde sağ raydan açılır.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function TestBank({
  profileId,
  lessonKey,
  quiz,
  quizSlot,
  tellPassed,
  onQuizCompleted,
  accountGate = "ready",
  onNeedAccount,
}: {
  profileId: string;
  lessonKey: string;
  quiz: JuniorPracticeChoice[];
  quizSlot: "ready" | "preparing" | "locked";
  tellPassed: boolean;
  onQuizCompleted?: () => void;
  accountGate?: JuniorAccountGate;
  onNeedAccount?: () => void;
}) {
  if (quizSlot === "preparing" || quiz.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4">
        <h3 className="text-lg font-semibold">Soru bankası ve testler</h3>
        <p className="mt-1 text-sm">{JUNIOR_QUIZ_PREPARING_LABEL}</p>
      </section>
    );
  }
  const pilotTrial = isJuniorPilotTrialLesson(lessonKey);
  const submitLocked =
    quizSlot === "locked"
      ? juniorPaidActionError(quiz.length)
      : !profileId
        ? pilotTrial
          ? null
          : "Puanın yazılması için veli girişi ve profil gerekir."
        : !tellPassed && !pilotTrial
          ? "Soruları okuyabilirsin. Puan, dinleyip kendi sözünle anlatınca açılır."
          : null;
  return (
    <TopicQuiz
      profileId={profileId}
      lessonKey={lessonKey}
      items={quiz}
      submitLocked={submitLocked}
      accountGate={accountGate}
      onNeedAccount={onNeedAccount}
      onCompleted={onQuizCompleted}
    />
  );
}


"use client";

import { useState } from "react";
import {
  JuniorAccountGateModal,
  type JuniorAccountGate,
} from "@/components/junior/account-gate-modal";
import { ActivityHub, type JuniorHubModule } from "@/components/junior/activity-hub";
import {
  ActivityStudio,
  JuniorLessonEngineShell,
  type ActivityStudioStatus,
} from "@/components/junior/activity-studio";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import { ListenAndTell } from "@/components/junior/listen-and-tell";
import { LiveTutorPanel } from "@/components/junior/live-tutor-panel";
import { DiscoveryPrompts } from "@/components/junior/discovery-prompts";
import { PrimeSieve } from "@/components/junior/prime-sieve";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { discoveryPromptsForLesson } from "@/lib/junior/discovery";
import { hasJuniorLessonBlueprint, resolveJuniorEngineTimeline } from "@/lib/junior/lesson-engine";
import { isLockedTimeline } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import { JUNIOR_TELL_PASS_SCORE } from "@/lib/junior/limits";
import { isJuniorPilotPlaybackLesson } from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { JUNIOR_VECTOR_STEP_COUNT, type JuniorPracticeChoice, type JuniorVectorScene } from "@/lib/junior/types";

export function LessonChain({
  profileId,
  lessonKey,
  nickname = null,
  title,
  script,
  scene,
  mebNote,
  lifeUse,
  steps,
  outcomes = [],
  booklet,
  tellPassed,
  lessonDone,
  quiz,
  activities = [],
  tellGuides = [],
  recording = "open",
  quizSlot = "ready",
  grantedAudioUrl = null,
  grantedWarmupUrl = null,
  lockPublicMedia = false,
  microQuestion = "",
  accountGate = "ready",
  loginHref = "/login",
  registerHref = "/register",
  profileHref = "/junior#cocuk-profili",
  pilotTimeline: pilotTimelineProp,
}: {
  profileId: string;
  lessonKey: string;
  nickname?: string | null;
  title: string;
  script: string;
  scene: JuniorVectorScene;
  mebNote: string;
  lifeUse: string;
  steps?: readonly string[];
  outcomes?: readonly string[];
  booklet: JuniorBookletCopy;
  tellPassed: boolean;
  lessonDone: boolean;
  quiz: JuniorPracticeChoice[];
  activities?: readonly JuniorActivityPublic[];
  tellGuides?: readonly string[];
  recording?: "open" | "locked";
  quizSlot?: "ready" | "preparing" | "locked";
  grantedAudioUrl?: string | null;
  grantedWarmupUrl?: string | null;
  lockPublicMedia?: boolean;
  /** Senaryodaki özgün mikro soru. */
  microQuestion?: string;
  accountGate?: JuniorAccountGate;
  loginHref?: string;
  registerHref?: string;
  profileHref?: string;
  /** Sunucu bileşeninden (`page.tsx`) yalnızca açılan ders için dinamik yüklenen timeline. */
  pilotTimeline?: TimelineJSON | null;
}) {
  const [passed, setPassed] = useState(tellPassed);
  const [done, setDone] = useState(lessonDone);
  const [module, setModule] = useState<JuniorHubModule>("activities");
  const [gateOpen, setGateOpen] = useState(false);
  const [studioStatus, setStudioStatus] = useState<ActivityStudioStatus>({
    solved: 0,
    total: 3,
    badge: false,
  });
  const pilotTimeline =
    pilotTimelineProp !== undefined
      ? pilotTimelineProp
      : isJuniorPilotPlaybackLesson(lessonKey) || hasJuniorLessonBlueprint(lessonKey)
        ? resolveJuniorEngineTimeline(lessonKey)
        : null;
  const studioLesson =
    isJuniorPilotPlaybackLesson(lessonKey) ||
    hasJuniorLessonBlueprint(lessonKey) ||
    isLockedTimeline(pilotTimeline);
  const totalScenes = pilotTimeline?.cues.length ?? JUNIOR_VECTOR_STEP_COUNT;

  function openTests() {
    if (accountGate !== "ready") {
      setGateOpen(true);
      return;
    }
    setModule("tests");
    window.requestAnimationFrame(() => {
      document.getElementById("junior-activity-hub")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const player = (
    <ListenAndTell
          profileId={profileId}
          lessonKey={lessonKey}
          nickname={nickname}
          title={title}
          script={script}
          scene={scene}
          mebNote={mebNote}
          lifeUse={lifeUse}
          steps={steps}
          hasQuiz={quiz.length > 0}
          quizCount={quiz.length}
          tellGuides={tellGuides}
          recording={recording}
          quizSlot={quizSlot}
          tellPassed={passed}
          quizDone={done}
          grantedAudioUrl={grantedAudioUrl}
          grantedWarmupUrl={grantedWarmupUrl}
          lockPublicMedia={lockPublicMedia}
          microQuestion={microQuestion}
          pilotTimeline={pilotTimeline}
          onScored={(feedback) => {
            if (feedback.score >= JUNIOR_TELL_PASS_SCORE) {
              setPassed(true);
            }
          }}
          onOpenQuiz={openTests}
          accountGate={accountGate}
          onNeedAccount={() => setGateOpen(true)}
        />
  );

  const accountModal =
    accountGate === "ready" ? null : (
      <JuniorAccountGateModal
        open={gateOpen}
        gate={accountGate}
        onClose={() => setGateOpen(false)}
        loginHref={loginHref}
        registerHref={registerHref}
        profileHref={profileHref}
      />
    );

  if (studioLesson) {
    return (
      <>
      {accountModal}
      <JuniorLessonEngineShell
        lessonKey={lessonKey}
        profileId={profileId}
        totalScenes={totalScenes}
        module={module}
        onModule={setModule}
        status={studioStatus}
        player={player}
        studio={
          <div className="flex flex-col gap-3">
            {lessonKey === "jr_06_mat-2" ? <PrimeSieve /> : null}
            <DiscoveryPrompts prompts={discoveryPromptsForLesson(lessonKey)} />
            <ActivityStudio
              profileId={profileId}
              lessonKey={lessonKey}
              items={[...activities]}
              onStatus={setStudioStatus}
            />
          </div>
        }
        tests={
          <ActivityHub
            chrome="panel"
            module="tests"
            onModule={setModule}
            profileId={profileId}
            lessonKey={lessonKey}
            title={title}
            scene={scene}
            outcomes={outcomes}
            lifeUse={lifeUse}
            booklet={booklet}
            activities={activities}
            quiz={quiz}
            quizSlot={quizSlot}
            tellPassed={passed}
            accountGate={accountGate}
            onNeedAccount={() => setGateOpen(true)}
            onQuizCompleted={() => setDone(true)}
          />
        }
        notes={
          <ActivityHub
            chrome="panel"
            module="notes"
            onModule={setModule}
            profileId={profileId}
            lessonKey={lessonKey}
            title={title}
            scene={scene}
            outcomes={outcomes}
            lifeUse={lifeUse}
            booklet={booklet}
            activities={activities}
            quiz={quiz}
            quizSlot={quizSlot}
            tellPassed={passed}
            onQuizCompleted={() => setDone(true)}
          />
        }
        tutor={<LiveTutorPanel lessonKey={lessonKey} />}
      />
      </>
    );
  }

  return (
    <>
    {accountModal}
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_9rem] gap-2 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:grid-rows-1">
      <div className="flex min-h-0 flex-col overflow-hidden">{player}</div>
      <div className="min-h-0 overflow-y-auto overscroll-contain">
        <ActivityHub
          module={module}
          onModule={setModule}
          profileId={profileId}
          lessonKey={lessonKey}
          title={title}
          scene={scene}
          outcomes={outcomes}
          lifeUse={lifeUse}
          booklet={booklet}
          activities={activities}
          quiz={quiz}
          quizSlot={quizSlot}
          tellPassed={passed}
          accountGate={accountGate}
          onNeedAccount={() => setGateOpen(true)}
          onQuizCompleted={() => setDone(true)}
        />
      </div>
    </div>
    </>
  );
}

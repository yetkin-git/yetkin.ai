"use client";

import { useState } from "react";
import { ActivityHub, type JuniorHubModule } from "@/components/junior/activity-hub";
import {
  ActivityStudio,
  JuniorLessonEngineShell,
  type ActivityStudioStatus,
} from "@/components/junior/activity-studio";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import { ListenAndTell } from "@/components/junior/listen-and-tell";
import { LiveTutorPanel } from "@/components/junior/live-tutor-panel";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { hasJuniorLessonBlueprint, resolveJuniorEngineTimeline } from "@/lib/junior/lesson-engine";
import { JUNIOR_TELL_PASS_SCORE } from "@/lib/junior/limits";
import { isJuniorPilotPlaybackLesson } from "@/lib/junior/pilot-engine/playback-key";
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
}) {
  const [passed, setPassed] = useState(tellPassed);
  const [done, setDone] = useState(lessonDone);
  const [module, setModule] = useState<JuniorHubModule>("activities");
  const [studioStatus, setStudioStatus] = useState<ActivityStudioStatus>({
    solved: 0,
    total: 3,
    badge: false,
  });
  const studioLesson =
    isJuniorPilotPlaybackLesson(lessonKey) || hasJuniorLessonBlueprint(lessonKey);
  const pilotTimeline = studioLesson ? resolveJuniorEngineTimeline(lessonKey) : null;
  const totalScenes = pilotTimeline?.cues.length ?? JUNIOR_VECTOR_STEP_COUNT;

  function openTests() {
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
          tellGuides={tellGuides}
          recording={recording}
          quizSlot={quizSlot}
          tellPassed={passed}
          quizDone={done}
          grantedAudioUrl={grantedAudioUrl}
          grantedWarmupUrl={grantedWarmupUrl}
          lockPublicMedia={lockPublicMedia}
          microQuestion={microQuestion}
          onScored={(feedback) => {
            if (feedback.score >= JUNIOR_TELL_PASS_SCORE) {
              setPassed(true);
            }
          }}
          onOpenQuiz={openTests}
        />
  );

  if (studioLesson) {
    return (
      <JuniorLessonEngineShell
        lessonKey={lessonKey}
        profileId={profileId}
        totalScenes={totalScenes}
        module={module}
        onModule={setModule}
        status={studioStatus}
        player={player}
        studio={
          <ActivityStudio
            profileId={profileId}
            lessonKey={lessonKey}
            items={[...activities]}
            onStatus={setStudioStatus}
          />
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
    );
  }

  return (
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
          onQuizCompleted={() => setDone(true)}
        />
      </div>
    </div>
  );
}

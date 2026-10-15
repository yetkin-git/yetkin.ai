"use client";

import { useState } from "react";
import { ActivityHub, type JuniorHubModule } from "@/components/junior/activity-hub";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import { ListenAndTell } from "@/components/junior/listen-and-tell";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { JUNIOR_TELL_PASS_SCORE } from "@/lib/junior/limits";
import type { JuniorPracticeChoice, JuniorVectorScene } from "@/lib/junior/types";

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

  function openTests() {
    setModule("tests");
    window.requestAnimationFrame(() => {
      document.getElementById("junior-activity-hub")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_9rem] gap-2 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:grid-rows-1">
      <div className="flex min-h-0 flex-col overflow-hidden">
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
      </div>
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

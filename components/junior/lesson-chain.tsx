"use client";

import { useState } from "react";
import { ListenAndTell } from "@/components/junior/listen-and-tell";
import { TopicQuiz } from "@/components/junior/topic-quiz";
import { JUNIOR_TELL_PASS_SCORE } from "@/lib/junior/limits";
import type { JuniorPracticeChoice, JuniorVectorScene } from "@/lib/junior/types";

export function LessonChain({
  profileId,
  lessonKey,
  title,
  script,
  scene,
  mebNote,
  lifeUse,
  steps,
  tellPassed,
  lessonDone,
  quiz,
  recording = "open",
  quizSlot = "ready",
}: {
  profileId: string;
  lessonKey: string;
  title: string;
  script: string;
  scene: JuniorVectorScene;
  mebNote: string;
  lifeUse: string;
  steps?: readonly string[];
  tellPassed: boolean;
  lessonDone: boolean;
  quiz: JuniorPracticeChoice[];
  recording?: "open" | "locked";
  quizSlot?: "ready" | "preparing" | "locked";
}) {
  const [passed, setPassed] = useState(tellPassed);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(lessonDone);

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <ListenAndTell
        profileId={profileId}
        lessonKey={lessonKey}
        title={title}
        script={script}
        scene={scene}
        mebNote={mebNote}
        lifeUse={lifeUse}
        steps={steps}
        hasQuiz={quiz.length > 0}
        recording={recording}
        quizSlot={quizSlot}
        tellPassed={passed}
        quizDone={done}
        onScored={(feedback) => {
          if (feedback.score >= JUNIOR_TELL_PASS_SCORE) {
            setPassed(true);
          }
        }}
        onOpenQuiz={() => setOpen(true)}
        trailing={
          open && passed && quizSlot === "ready" && quiz.length > 0 ? (
            <TopicQuiz
              profileId={profileId}
              lessonKey={lessonKey}
              items={quiz}
              onCompleted={() => setDone(true)}
            />
          ) : null
        }
      />
    </div>
  );
}

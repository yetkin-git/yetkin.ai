"use client";

import { useState, type ReactElement } from "react";
import { ActivityStudio, type ActivityStudioStatus } from "@/components/junior/activity-studio";
import { JuniorLessonEngine } from "@/components/junior/lesson-engine/JuniorLessonEngine";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import type { JuniorVectorScene } from "@/lib/junior/types";

/**
 * Katalog senaryosu olmayan üretim dersi.
 * Aynı `JuniorLessonEngine` kabuğunu kullanır. Saat `resolveJuniorEngineTimeline` içindedir.
 * Dokunsal ray varsa stüdyo onu açar; yoksa kabuk blueprint simülasyonunu bağlar.
 */
export function JuniorEngineProductionLesson({
  lessonKey,
  title,
  outcomes,
  lifeUse,
  booklet,
  activities,
  scene = "number-ops",
}: {
  lessonKey: string;
  title: string;
  outcomes: readonly string[];
  lifeUse: string;
  booklet: JuniorBookletCopy;
  activities: readonly JuniorActivityPublic[];
  scene?: JuniorVectorScene;
}): ReactElement {
  const [status, setStatus] = useState<ActivityStudioStatus>({
    solved: 0,
    total: 3,
    badge: false,
  });
  const studio =
    activities.length > 0 ? (
      <ActivityStudio
        profileId=""
        lessonKey={lessonKey}
        items={[...activities]}
        onStatus={setStatus}
        initialGame="sim"
      />
    ) : undefined;

  return (
    <JuniorLessonEngine
      lessonKey={lessonKey}
      profileId=""
      title={title}
      scene={scene}
      outcomes={outcomes}
      lifeUse={lifeUse}
      booklet={booklet}
      activities={activities}
      quiz={[]}
      quizSlot="preparing"
      tellPassed={false}
      status={status}
      studio={studio}
    />
  );
}

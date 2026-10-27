"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { ActivityHub, type JuniorHubModule } from "@/components/junior/activity-hub";
import { AnimatedSimulationStudio } from "@/components/junior/animated-simulations";
import { LiveTutorPanel } from "@/components/junior/live-tutor-panel";
import { JuniorPilotPlayer } from "@/components/junior/pilot-player/JuniorPilotPlayer";
import { QuickTools, type QuickToolsStatus } from "@/components/junior/quick-tools";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import {
  playApplauseSound,
  playOopsSound,
  primeActivityAudio,
} from "@/lib/junior/activity-sound";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import {
  getJuniorLessonBlueprint,
  listJuniorMatLessonBlueprints,
  registerJuniorLessonBlueprint,
  resolveJuniorEngineTimeline,
  type JuniorLessonBlueprint,
} from "@/lib/junior/lesson-engine";
import {
  resolveStickyFrame,
  sceneHasRenderableContent,
  type StickyFrameResolution,
} from "@/lib/junior/pilot-engine/sticky-frame";
import { JUNIOR_VECTOR_STEP_COUNT, type JuniorPracticeChoice, type JuniorVectorScene } from "@/lib/junior/types";

export {
  AnimatedSimulationStudio,
  JuniorPilotPlayer,
  LiveTutorPanel,
  QuickTools,
  getJuniorLessonBlueprint,
  listJuniorMatLessonBlueprints,
  playApplauseSound,
  playOopsSound,
  primeActivityAudio,
  registerJuniorLessonBlueprint,
  resolveJuniorEngineTimeline,
  resolveStickyFrame,
  sceneHasRenderableContent,
  type JuniorLessonBlueprint,
  type QuickToolsStatus,
  type StickyFrameResolution,
};

export const JUNIOR_ENGINE_TOOLS = [
  { id: "activities", label: "Etkinlikler" },
  { id: "tests", label: "Soru Bankası" },
  { id: "notes", label: "Ders Notu" },
  { id: "tutor", label: "Selim Öğretmen'e Sor" },
] as const satisfies readonly { id: JuniorHubModule; label: string }[];

export type JuniorLessonEngineShellProps = {
  lessonKey: string;
  profileId?: string;
  module: JuniorHubModule;
  onModule: (next: JuniorHubModule) => void;
  status: QuickToolsStatus;
  player: ReactNode;
  studio: ReactNode;
  tests: ReactNode;
  notes: ReactNode;
  tutor?: ReactNode;
  /** Pilot timeline cue sayısı; kart/yüzde hesabı için. */
  totalScenes?: number;
};

/**
 * `JuniorLessonEngineShell` — `jr_06_mat-1` amiral gemisinden soyutlanan,
 * tüm 6. sınıf derslerinde (`jr_06_mat-1..4` ve devamı) yeniden kullanılan
 * modüler stüdyo iskeleti (`Player` + `StickyFrame` + `ActivityStudio` + `LiveTutorPanel` + `QuickTools`).
 */
export function JuniorLessonEngineShell({
  lessonKey,
  profileId = "",
  module,
  onModule,
  status,
  player,
  studio,
  tests,
  notes,
  tutor,
  totalScenes,
}: JuniorLessonEngineShellProps): ReactElement {
  const blueprint = getJuniorLessonBlueprint(lessonKey);

  function choose(next: JuniorHubModule) {
    onModule(next);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("junior-activity-hub")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  return (
    <div
      data-junior-lesson-engine={lessonKey}
      data-junior-lesson-meb={blueprint?.content.mebCode ?? ""}
      data-junior-studio-flow={lessonKey}
      data-junior-fold="flow"
      className="flex w-full min-w-0 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_14.5rem] xl:items-start xl:gap-6"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div
          data-junior-player-shell=""
          className="flex h-[52dvh] min-h-[20rem] w-full min-w-0 flex-col sm:h-[min(48rem,calc(100dvh-6.5rem))] sm:min-h-[28rem]"
        >
          {player}
        </div>
        <p className="text-xs font-semibold text-slate-500 sm:hidden" data-junior-flow-hint="">
          İzle → Kendin Keşfet → Anlat → Test et. Araçlar aşağıda tek sırada durur.
        </p>
        <div id="junior-activity-hub" className="min-w-0">
          <div className={module === "activities" ? "block" : "hidden"}>{studio}</div>
          {module === "tests" ? <div>{tests}</div> : null}
          {module === "notes" ? <div>{notes}</div> : null}
          {module === "tutor" ? (
            <div data-junior-tutor-slot="">{tutor ?? <LiveTutorPanel lessonKey={lessonKey} />}</div>
          ) : null}
        </div>
      </div>
      <QuickTools
        lessonKey={lessonKey}
        profileId={profileId}
        totalScenes={totalScenes}
        status={status}
        tools={
          <div
            role="tablist"
            aria-label="Ders araçları"
            className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4 xl:mt-3 xl:grid-cols-1 xl:gap-2"
          >
            {JUNIOR_ENGINE_TOOLS.map((tool) => {
              const selected = tool.id === module;
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  data-junior-studio-tool={tool.id}
                  className={`min-w-0 whitespace-normal rounded-xl border px-1.5 py-2 text-center text-xs font-extrabold leading-tight xl:px-3 xl:py-2.5 xl:text-left xl:text-sm ${
                    selected
                      ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                      : "border-[var(--border)] bg-white text-slate-800"
                  }`}
                  onClick={() => choose(tool.id)}
                >
                  {tool.label}
                </button>
              );
            })}
          </div>
        }
      />
    </div>
  );
}

export type JuniorLessonEngineProps = {
  lessonKey: string;
  profileId?: string;
  title?: string;
  scene?: JuniorVectorScene;
  outcomes?: readonly string[];
  lifeUse?: string;
  booklet?: JuniorBookletCopy;
  activities?: readonly JuniorActivityPublic[];
  quiz?: JuniorPracticeChoice[];
  quizSlot?: "ready" | "preparing" | "locked";
  tellPassed?: boolean;
  onQuizCompleted?: () => void;
  player?: ReactNode;
  studio?: ReactNode;
  /** Dışarıdan gelen rozet durumu. Verilmezse kabuk kendi sayacını tutar. */
  status?: QuickToolsStatus;
  grantedAudioUrl?: string | null;
};

/**
 * Bağımsız ya da `LessonChain` içinden çağrılabilen tam kapsamlı `JuniorLessonEngine`.
 * `player` verilmezse dersin `TimelineJSON` kaynağını çözümleyip `JuniorPilotPlayer` bağlar.
 */
export function JuniorLessonEngine({
  lessonKey,
  profileId = "",
  title,
  scene = "number-ops",
  outcomes,
  lifeUse = "",
  booklet,
  activities = [],
  quiz = [],
  quizSlot = "ready",
  tellPassed = false,
  onQuizCompleted,
  player,
  studio,
  status: statusProp,
  grantedAudioUrl = null,
}: JuniorLessonEngineProps): ReactElement {
  const blueprint = getJuniorLessonBlueprint(lessonKey);
  const timeline = resolveJuniorEngineTimeline(lessonKey);
  const [module, setModule] = useState<JuniorHubModule>("activities");
  const [internalStatus] = useState<QuickToolsStatus>({
    solved: 0,
    total: 3,
    badge: false,
  });
  const status = statusProp ?? internalStatus;

  const resolvedTitle = title ?? blueprint?.title ?? lessonKey;
  const resolvedOutcomes = outcomes ?? blueprint?.content.outcomes ?? [];
  const resolvedBooklet: JuniorBookletCopy = booklet ?? {
    heroQuestion: blueprint?.content.heroQuestion ?? "",
    heroFocus: blueprint?.content.heroFocus ?? "",
    concept: blueprint?.content.conceptSummary ?? "",
    example: blueprint?.notes?.example ?? "",
    warning: blueprint?.notes?.warning ?? "",
    recap: blueprint?.notes?.recap ?? [],
    hint: blueprint?.notes?.hint ?? "gold",
  };
  const resolvedLifeUse = lifeUse || blueprint?.notes?.lifeUse || "";

  const defaultPlayer = timeline ? (
    <JuniorPilotPlayer timeline={timeline} grantedAudioUrl={grantedAudioUrl} fill />
  ) : null;

  const defaultStudio = studio ?? (
    <AnimatedSimulationStudio lessonKey={lessonKey} profileId={profileId} />
  );

  return (
    <JuniorLessonEngineShell
      lessonKey={lessonKey}
      profileId={profileId}
      totalScenes={timeline?.cues.length ?? JUNIOR_VECTOR_STEP_COUNT}
      module={module}
      onModule={setModule}
      status={status}
      player={player ?? defaultPlayer}
      studio={defaultStudio}
      tests={
        <ActivityHub
          chrome="panel"
          module="tests"
          onModule={setModule}
          profileId={profileId}
          lessonKey={lessonKey}
          title={resolvedTitle}
          scene={scene}
          outcomes={resolvedOutcomes}
          lifeUse={resolvedLifeUse}
          booklet={resolvedBooklet}
          activities={activities}
          quiz={quiz}
          quizSlot={quizSlot}
          tellPassed={tellPassed}
          onQuizCompleted={onQuizCompleted}
        />
      }
      notes={
        <ActivityHub
          chrome="panel"
          module="notes"
          onModule={setModule}
          profileId={profileId}
          lessonKey={lessonKey}
          title={resolvedTitle}
          scene={scene}
          outcomes={resolvedOutcomes}
          lifeUse={resolvedLifeUse}
          booklet={resolvedBooklet}
          activities={activities}
          quiz={quiz}
          quizSlot={quizSlot}
          tellPassed={tellPassed}
          onQuizCompleted={onQuizCompleted}
        />
      }
      tutor={<LiveTutorPanel lessonKey={lessonKey} />}
    />
  );
}

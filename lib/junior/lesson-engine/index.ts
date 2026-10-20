export type {
  JuniorLessonBadgeSpec,
  JuniorLessonBlueprint,
  JuniorLessonContentSpec,
  JuniorLessonNotesSpec,
  JuniorLessonTutorSpec,
  JuniorSimulationModeId,
  JuniorSimulationTabSpec,
  JuniorTactileActivityRules,
  JuniorTactileExplanations,
} from "./types";

export {
  JR_06_MAT_1_BLUEPRINT,
  JR_06_MAT_2_BLUEPRINT,
  JR_06_MAT_3_BLUEPRINT,
  JR_06_MAT_4_BLUEPRINT,
  JR_06_MAT_5_BLUEPRINT,
  MAT_5_SIMULATION_TABS,
} from "./modules/mat-1-to-5";

export {
  getJuniorLessonBlueprint,
  hasJuniorLessonBlueprint,
  listJuniorMatLessonBlueprints,
  peekJuniorLessonBlueprint,
  registerJuniorLessonBlueprint,
  resolveJuniorEngineTimeline,
  resolveJuniorTactileRules,
} from "./registry";

export {
  resolveStickyFrame,
  sceneHasRenderableContent,
  type StickyFrameResolution,
} from "@/lib/junior/pilot-engine/sticky-frame";

export {
  playApplauseSound,
  playOopsSound,
  primeActivityAudio,
} from "@/lib/junior/activity-sound";

import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { JR_06_MAT_1_BLUEPRINT } from "./modules/mat-5";
import { JR_06_MAT_2_BLUEPRINT } from "./modules/mat-6";
import type { JuniorLessonBlueprint, JuniorTactileActivityRules } from "./types";

const BLUEPRINT_REGISTRY = new Map<string, JuniorLessonBlueprint>([
  [JR_06_MAT_1_BLUEPRINT.lessonKey, JR_06_MAT_1_BLUEPRINT],
  [JR_06_MAT_2_BLUEPRINT.lessonKey, JR_06_MAT_2_BLUEPRINT],
]);

/**
 * Yeni bir 6. sınıf ders şablonunu çalışma zamanında kayıt defterine ekler veya günceller.
 */
export function registerJuniorLessonBlueprint(blueprint: JuniorLessonBlueprint): void {
  BLUEPRINT_REGISTRY.set(blueprint.lessonKey, blueprint);
}

/** Kayıtlı şablon. Fallback üretmez; katalog dışı anahtarlarda `null`. */
export function peekJuniorLessonBlueprint(lessonKey: string): JuniorLessonBlueprint | null {
  return BLUEPRINT_REGISTRY.get(lessonKey) ?? null;
}

/** Kayıt defterinde gerçek şablon var. Fallback «Süper Kaşif» kabuğa girmez. */
export function hasJuniorLessonBlueprint(lessonKey: string): boolean {
  return BLUEPRINT_REGISTRY.has(lessonKey);
}

const EMPTY_TACTILE_RULES: JuniorTactileActivityRules = {
  matchTargets: {},
  gapAnswers: {},
  rocketRules: {},
};

/**
 * Dokunsal puan anahtarı. Kayıtlı ders kendi haritasını kullanır.
 * Altın anahtar yalnız `jr_06_mat-1` içindir. Başka ders o kurallara düşmez.
 */
export function resolveJuniorTactileRules(lessonKey: string): JuniorTactileActivityRules {
  const registered = BLUEPRINT_REGISTRY.get(lessonKey)?.tactileRules;
  if (registered) {
    return {
      matchTargets: registered.matchTargets ?? {},
      gapAnswers: registered.gapAnswers ?? {},
      rocketRules: registered.rocketRules ?? {},
      explanations: registered.explanations,
    };
  }
  if (lessonKey === "jr_06_mat-1") {
    const gold = JR_06_MAT_1_BLUEPRINT.tactileRules;
    return {
      matchTargets: gold?.matchTargets ?? {},
      gapAnswers: gold?.gapAnswers ?? {},
      rocketRules: gold?.rocketRules ?? {},
      explanations: gold?.explanations,
    };
  }
  return EMPTY_TACTILE_RULES;
}

/**
 * Kayıtlı şablon. Yazılmamış derste jenerik rozet ve `MEB.6` kabı üretilmez.
 */
export function getJuniorLessonBlueprint(lessonKey: string): JuniorLessonBlueprint | null {
  return BLUEPRINT_REGISTRY.get(lessonKey) ?? null;
}

/** Eski 1–4 taslağı silindi. Kamu dersi bu listede durmaz. */
export function listQuarantinedJuniorMatBlueprints(): readonly JuniorLessonBlueprint[] {
  return [];
}

/**
 * Canlı 6. sınıf matematik şablonu. Açılış `jr_06_mat-1`.
 */
export function listJuniorMatLessonBlueprints(): readonly JuniorLessonBlueprint[] {
  return [JR_06_MAT_1_BLUEPRINT];
}

/**
 * Dersin pilot/grafik timeline nesnesini önce resmi pilot yükleyiciden,
 * yoksa `JuniorLessonBlueprint.resolveTimeline` kancasından çözümler.
 */
export function resolveJuniorEngineTimeline(lessonKey: string): TimelineJSON | null {
  const official = getPilotTimelineForLesson(lessonKey);
  if (official) {
    return official;
  }
  const blueprint = BLUEPRINT_REGISTRY.get(lessonKey);
  return blueprint?.resolveTimeline?.() ?? null;
}

import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import { peekJuniorLessonBlueprint } from "@/lib/junior/lesson-engine/registry";
import { juniorMicroQuestion } from "@/lib/junior/micro-question";
import { mat5CanonicalBooklet } from "@/lib/junior/pilot-engine/mat-1.choreography";

export type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";

const EMPTY: JuniorBookletCopy = {
  concept: "",
  example: "",
  warning: "",
  recap: [],
  hint: "trap",
  heroQuestion: "",
  heroFocus: "",
};

/** Yıldız panelinin sorusu. Kab ve paketsiz konuda boş kalır. */
export function juniorLessonMicroQuestion(lessonKey: string): string {
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (!scenario) {
    return "";
  }
  return juniorMicroQuestion(scenario);
}

export function juniorBookletCopy(lessonKey: string): JuniorBookletCopy {
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (lessonKey.trim() === "jr_06_mat-1") {
    const canonical = mat5CanonicalBooklet();
    return {
      ...canonical,
      recap: scenario && scenario.recap.length > 0 ? scenario.recap : canonical.recap,
    };
  }
  if (!scenario) {
    const blueprint = peekJuniorLessonBlueprint(lessonKey);
    if (!blueprint?.notes) {
      return EMPTY;
    }
    return {
      concept: blueprint.content.conceptSummary,
      example: blueprint.notes.example,
      warning: blueprint.notes.warning,
      recap: blueprint.notes.recap,
      hint: blueprint.notes.hint,
      heroQuestion: blueprint.content.heroQuestion,
      heroFocus: blueprint.content.heroFocus,
    };
  }
  return {
    concept: scenario.concept,
    example: scenario.example,
    warning: scenario.warning,
    recap: scenario.recap,
    hint: scenario.hint ?? "trap",
    heroQuestion: scenario.heroQuestion?.trim() ?? "",
    heroFocus: scenario.heroFocus?.trim() ?? "",
  };
}

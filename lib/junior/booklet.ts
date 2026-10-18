import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import type { JuniorBookletCopy } from "@/lib/junior/booklet-copy";
import { juniorMicroQuestion } from "@/lib/junior/micro-question";
import { mat5CanonicalBooklet } from "@/lib/junior/pilot-engine/mat-5.choreography";

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
  if (lessonKey.trim() === "jr_06_mat-5") {
    return mat5CanonicalBooklet();
  }
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (!scenario) {
    return EMPTY;
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

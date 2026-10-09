import {
  canEnterJunior,
  type JuniorActor,
  type JuniorGateDecision,
} from "@/lib/kernel/security/junior-gate";
import { juniorLessonAccess, juniorLessonAccessForPlan, type JuniorPlanAccess } from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_SLUGS } from "@/lib/junior/limits";

export function juniorPlanCoversLesson(
  lessonKey: string,
  planActive: boolean,
  selectedElectives: readonly string[],
): boolean {
  if (!planActive) {
    return false;
  }
  return (
    juniorLessonAccessForPlan(lessonKey, {
      active: true,
      selectedElectives,
    }) === "free"
  );
}

export function juniorLessonGate(
  actor: JuniorActor,
  lessonKey: string,
  plan: { active: boolean; selectedElectives: readonly string[]; profileId?: string | null },
): {
  lessonAccess: "free" | "locked" | "missing";
  planCovers: boolean;
  lesson: JuniorGateDecision;
  paid: JuniorGateDecision;
  renderPlan: JuniorPlanAccess | null;
} {
  const lessonAccess = juniorLessonAccess(lessonKey);
  const planCovers = juniorPlanCoversLesson(lessonKey, plan.active, plan.selectedElectives);
  const lesson = canEnterJunior(actor, lessonKey, {
    intent: "lesson",
    lessonAccess,
    planCovers,
    id: plan.profileId,
  });
  const paid = canEnterJunior(actor, lessonKey, {
    intent: "paid-action",
    lessonAccess,
    planCovers,
    id: plan.profileId,
  });
  const renderPlan =
    lesson.allow && lesson.via === "audit"
      ? { active: true, selectedElectives: [...JUNIOR_ELECTIVE_SLUGS] }
      : planCovers
        ? { active: true, selectedElectives: plan.selectedElectives }
        : null;
  return { lessonAccess, planCovers, lesson, paid, renderPlan };
}

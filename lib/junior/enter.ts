import {
  canEnterJunior,
  type JuniorActor,
  type JuniorGateDecision,
} from "@/lib/kernel/security/junior-gate";

export type { JuniorGateDecision };
import {
  juniorCourseByLessonKey,
  juniorCourseSealed,
  juniorLessonAccess,
  juniorLessonAccessForPlan,
  juniorPaidElectives,
  type JuniorPlanAccess,
} from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_SLUGS } from "@/lib/junior/limits";

/**
 * Ücretli paket bu dersi kapsıyor mu (T-06). Denetim dalı bu fonksiyonu kullanmaz.
 * Kamuya açık tanıtım kapısı (`free` taban) paket kapsamı sayılmaz; onu paket değil
 * kamu kapısı açar. Bu yüzden karar erişim dizesinden değil, kursun pakete
 * girebilirliğinden okunur: fiyat dışı seçmeli (`jr_06_ing`) hiçbir zaman kapsanmaz.
 */
export function juniorPlanCoversLesson(
  lessonKey: string,
  planActive: boolean,
  selectedElectives: readonly string[],
): boolean {
  if (!planActive) {
    return false;
  }
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course || !juniorCourseSealed(course)) {
    return false;
  }
  if (course.track === "core") {
    return true;
  }
  return juniorPaidElectives(selectedElectives).includes(course.slug);
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
        ? { active: true, selectedElectives: juniorPaidElectives(plan.selectedElectives) }
        : null;
  return { lessonAccess, planCovers, lesson, paid, renderPlan };
}

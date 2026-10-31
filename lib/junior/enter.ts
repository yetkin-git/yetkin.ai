import {
  canEnterJunior,
  type JuniorActor,
  type JuniorGateDecision,
} from "@/lib/kernel/security/junior-gate";

export type { JuniorGateDecision };
import {
  juniorCourseByLessonKey,
  juniorCourseSealed,
  juniorElectiveOpenable,
  juniorLessonAccess,
  juniorPaidElectives,
  type JuniorPlanAccess,
} from "@/lib/junior/catalog";
import {
  JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
  JUNIOR_ELECTIVE_PRICE_EXCLUDED,
  JUNIOR_ELECTIVE_SLUGS,
  JUNIOR_ELECTIVE_SOON_LESSON_ERROR,
} from "@/lib/junior/limits";

/** Paketi olan veli, seçmediği seçmeli dersin 2. konusuna gelince. */
export const JUNIOR_LOCK_ELECTIVE_NOTICE =
  "Sonraki dersler için paketinize seçmeli ders olarak ekleyin.";

export const JUNIOR_LOCK_GUEST_NOTICE =
  "Bu konu kilitli. İkinci ve sonraki dersler yıllık Junior paketiyle açılır. Devam etmek için veli girişi gerekir.";

export const JUNIOR_LOCK_PLAN_NOTICE =
  "Bu konu kilitli. İkinci ve sonraki dersler yıllık Junior paketiyle açılır.";

export type JuniorLockNotice = {
  reason: "login" | "plan" | "elective";
  title: string;
  body: string;
};

/**
 * Kilitli 2. ve sonraki konu için ekran cümlesi.
 * Karar `juniorPlanCoversLesson` + `canEnterJunior` (`juniorLessonGate`) üzerinden okunur.
 * Açık ders ve denetim dalı uyarı vermez.
 */
export function juniorLessonLockNotice(
  actor: JuniorActor,
  lessonKey: string,
  plan: { active: boolean; selectedElectives: readonly string[]; profileId?: string | null },
): JuniorLockNotice | null {
  const gate = juniorLessonGate(actor, lessonKey, plan);
  if (gate.lesson.allow) {
    return null;
  }
  if (gate.lesson.reason === "missing" || gate.lessonAccess === "missing") {
    return null;
  }
  const course = juniorCourseByLessonKey(lessonKey);
  if (plan.active && course?.track === "elective" && !gate.planCovers) {
    if ((JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug)) {
      return {
        reason: "plan",
        title: "Bu konu kilitli",
        body: JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
      };
    }
    if (!juniorElectiveOpenable(course)) {
      return {
        reason: "plan",
        title: "Bu konu kilitli",
        body: JUNIOR_ELECTIVE_SOON_LESSON_ERROR,
      };
    }
    return {
      reason: "elective",
      title: "Seçmeli ders kilitli",
      body: JUNIOR_LOCK_ELECTIVE_NOTICE,
    };
  }
  if (!actor?.id) {
    return {
      reason: "login",
      title: "Bu konu kilitli",
      body: JUNIOR_LOCK_GUEST_NOTICE,
    };
  }
  return {
    reason: "plan",
    title: "Bu konu kilitli",
    body: JUNIOR_LOCK_PLAN_NOTICE,
  };
}

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

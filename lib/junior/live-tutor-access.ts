import { canEnterJunior, type JuniorActor } from "@/lib/kernel/security/junior-gate";
import {
  juniorCourseByLessonKey,
  juniorCourseSealed,
  juniorLessonAccess,
} from "@/lib/junior/catalog";
import { juniorPlanCoversLesson } from "@/lib/junior/enter";
import {
  isJuniorPilotTrialLesson,
  JUNIOR_ELECTIVE_SOON_LESSON_ERROR,
  juniorElectiveNotInQuotaError,
} from "@/lib/junior/limits";

/** Oturumlu koç, yıllık paket yokken modeli çağırmaz. */
export const JUNIOR_LIVE_TUTOR_PLAN_ERROR =
  "Bu konu veli girişi ve yıllık paket ister." as const;

export type JuniorLiveTutorAccess =
  | { ok: true; mode: "guest-local" | "model" }
  | { ok: false; status: 403 | 404; error: string };

/**
 * Canlı koç kapısı.
 * Misafir yalnız `jr_06_mat-1..3` için yerel yanıt alır.
 * Oturum, `canEnterJunior` (`paid-action`) ve `juniorLessonAccess` geçmeden modele gitmez.
 * Aktif paket çekirdeği açar. Seçmeli ders, seçilmiş ve mühürlü değilse 403 kalır.
 */
export function authorizeJuniorLiveTutor(input: {
  actor: JuniorActor;
  lessonKey: string;
  planActive: boolean;
  selectedElectives: readonly string[];
  profileId?: string | null;
}): JuniorLiveTutorAccess {
  const lessonAccess = juniorLessonAccess(input.lessonKey);
  const planCovers = juniorPlanCoversLesson(
    input.lessonKey,
    input.planActive,
    input.selectedElectives,
  );
  const decision = canEnterJunior(input.actor, input.lessonKey, {
    intent: input.actor?.id ? "paid-action" : "lesson",
    lessonAccess,
    planCovers,
    id: input.profileId ?? undefined,
  });

  if (lessonAccess === "missing" || (!decision.allow && decision.reason === "missing")) {
    return { ok: false, status: 404, error: "Bu ders yok." };
  }

  if (!input.actor?.id) {
    if (!isJuniorPilotTrialLesson(input.lessonKey)) {
      return { ok: false, status: 403, error: JUNIOR_LIVE_TUTOR_PLAN_ERROR };
    }
    return { ok: true, mode: "guest-local" };
  }

  if (!decision.allow) {
    if (!input.planActive) {
      return { ok: false, status: 403, error: JUNIOR_LIVE_TUTOR_PLAN_ERROR };
    }
    const course = juniorCourseByLessonKey(input.lessonKey);
    if (course?.track === "elective" && !juniorCourseSealed(course)) {
      return { ok: false, status: 403, error: JUNIOR_ELECTIVE_SOON_LESSON_ERROR };
    }
    return { ok: false, status: 403, error: juniorElectiveNotInQuotaError() };
  }

  return { ok: true, mode: "model" };
}

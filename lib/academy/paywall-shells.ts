import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { resolveAcademyEntitlement } from "@/lib/academy/entitlement";
import type { AcademyLessonDiagramSlot, AcademyLessonMicroVideoSlot } from "@/lib/academy/lesson-media";

export type AcademyPaywallLockedLessonShell = {
  key: string;
  order: number;
  title: string;
  body: string;
  completed: false;
  open: boolean;
  diagrams: readonly AcademyLessonDiagramSlot[];
  microVideos: readonly AcademyLessonMicroVideoSlot[];
};

/**
 * Ödeme duvarı kabuğu.
 * Satış vitrini (ders 1) gövdesi açık kalır. Diğer derslerin gövdesi istemciye gitmez.
 */
export function academyPaywallLockedLessonShells(
  courseSlug: string,
): AcademyPaywallLockedLessonShell[] {
  const now = new Date();
  return curriculumForCourseSlug(courseSlug).map((lesson) => {
    const preview = resolveAcademyEntitlement({
      actor: null,
      purchase: null,
      courseSlug,
      lessonKey: lesson.key,
      now,
    }).open;
    if (!preview) {
      return {
        key: lesson.key,
        order: lesson.order,
        title: lesson.title,
        body: "",
        completed: false,
        open: false,
        diagrams: [],
        microVideos: [],
      };
    }
    return {
      key: lesson.key,
      order: lesson.order,
      title: lesson.title,
      body: lesson.body,
      completed: false,
      open: true,
      diagrams: lesson.diagrams,
      microVideos: lesson.microVideos,
    };
  });
}

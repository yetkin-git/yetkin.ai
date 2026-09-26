import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

export type AcademyPaywallLockedLessonShell = {
  key: string;
  order: number;
  title: string;
  body: "";
  completed: false;
  open: false;
};

/**
 * Ödeme duvarı kabuğu. Müfredat gövdesini istemci paketine taşımaz;
 * oynatıcı `preview-lock` üzerinden yalnız kilit kararını okur.
 */
export function academyPaywallLockedLessonShells(
  courseSlug: string,
): AcademyPaywallLockedLessonShell[] {
  return curriculumForCourseSlug(courseSlug).map((lesson) => ({
    key: lesson.key,
    order: lesson.order,
    title: lesson.title,
    body: "",
    completed: false,
    open: false,
  }));
}

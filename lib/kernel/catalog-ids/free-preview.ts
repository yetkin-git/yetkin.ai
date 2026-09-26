/**
 * Ücretsiz hazırlık şeridi olan kurs.
 * Kenar (`edge-guard`) bu kimliği akademi motorundan okumaz.
 */
export const ACADEMY_FREE_PREVIEW_COURSE_SLUG = "01_office_ai" as const;

export function academyCourseOffersFreePreview(courseSlug: string): boolean {
  return courseSlug.trim() === ACADEMY_FREE_PREVIEW_COURSE_SLUG;
}

/**
 * Yayın SKU kimliği — vize damgası başlık eşlemesi.
 * Vitrin metni akademi odasında çoğaltılmaz; bu sicil SSOT’tur.
 */

export const ACADEMY_COURSE_TITLES = {
  "python-temel": "Python ile Sıfırdan Programlama ve Problem Çözme",
  "fullstack-temel": "Full-Stack Web Geliştirme (React, Next.js ve Node.js)",
  "ai-temel": "Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)",
  "ux-temel": "Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)",
} as const;

export type AcademyCourseTitleSlug = keyof typeof ACADEMY_COURSE_TITLES;

/**
 * Matrix kilidi sonrası ayrı onboarding SKU yoktur.
 * Visa / sınav özel yolu kapalıdır; null gönderilir.
 */
export const ACADEMY_ONBOARDING_COURSE_SLUG: AcademyCourseTitleSlug | null = null;

export function academyCourseTitleBySlug(slug: string): string | undefined {
  return ACADEMY_COURSE_TITLES[slug as AcademyCourseTitleSlug];
}

export function academySlugFromCourseTitle(title: string): AcademyCourseTitleSlug | null {
  const trimmed = title.trim();
  for (const [slug, courseTitle] of Object.entries(ACADEMY_COURSE_TITLES)) {
    if (courseTitle === trimmed) {
      return slug as AcademyCourseTitleSlug;
    }
  }
  return null;
}

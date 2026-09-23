/**
 * Antre müfredat grupları — JSON-LD ve ders listesi aynı planı paylaşır.
 * Müfredat gövdesini import etmez.
 */

const DEFAULT_LESSONS_PER_MODULE = 4;

export type AcademySyllabusModulePlan = {
  title: string;
  size: number;
};

/** Amiral antre — 4+4+1 «Modül N» rafı değil; iş adıyla grup. */
const COURSE_SYLLABUS_MODULE_PLANS: Readonly<
  Record<string, readonly AcademySyllabusModulePlan[]>
> = {
  "01_office_ai": [
    { title: "Tablo ve güvenlik", size: 2 },
    { title: "Karar ve slayt", size: 3 },
    { title: "Kutu ve belge", size: 2 },
    { title: "Haftalık sistem", size: 1 },
  ],
};

export function academySyllabusModulePlansFor(
  slug: string,
  lessonCount: number,
): AcademySyllabusModulePlan[] {
  const named = COURSE_SYLLABUS_MODULE_PLANS[slug];
  if (named) {
    const total = named.reduce((sum, plan) => sum + plan.size, 0);
    if (total === lessonCount) {
      return named.map((plan) => ({ title: plan.title, size: plan.size }));
    }
  }
  const plans: AcademySyllabusModulePlan[] = [];
  for (let offset = 0; offset < lessonCount; offset += DEFAULT_LESSONS_PER_MODULE) {
    plans.push({
      title: `Modül ${plans.length + 1}`,
      size: Math.min(DEFAULT_LESSONS_PER_MODULE, lessonCount - offset),
    });
  }
  return plans;
}

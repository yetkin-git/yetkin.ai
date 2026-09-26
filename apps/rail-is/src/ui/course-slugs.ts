import {
  academyStorefrontTitleBySlug,
  ACADEMY_STOREFRONT_EXTRA_TITLES,
} from "@yetkin/kernel";

/**
 * Native vitrin sırası. Web `ACADEMY_VITRINE_SHELL` satın alınır kartlarıyla aynı çekirdek:
 * amiral `01_office_ai` ve OFF-201 `01_office_ai_ileri`.
 * Kanon 13 tip kilidi `packages/kernel` içindedir; bu liste onu genişletmez.
 */
export const DRON_COURSE_SLUGS = ["01_office_ai", "01_office_ai_ileri"] as const;

export type DronCourseSlug = (typeof DRON_COURSE_SLUGS)[number];

export { ACADEMY_STOREFRONT_EXTRA_TITLES, academyStorefrontTitleBySlug };

export function dronCourseTitle(slug: string): string {
  return academyStorefrontTitleBySlug(slug) ?? slug;
}

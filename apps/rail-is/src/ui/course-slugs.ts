import {
  academyStorefrontTitleBySlug,
  ACADEMY_STOREFRONT_EXTRA_TITLES,
  COURSE_REGISTRY,
} from "@yetkin/kernel";

/**
 * Native vitrin sırası. Kartta `nativeListed` açık olan eğitimler.
 * Bugün amiral `01_office_ai` ve OFF-201 `01_office_ai_ileri`.
 * Kanon 13 tip kilidi `packages/kernel` içindedir; bu liste onu genişletmez.
 */
type NativeListedSlug = Extract<(typeof COURSE_REGISTRY)[number], { nativeListed: true }>["slug"];

export const DRON_COURSE_SLUGS = COURSE_REGISTRY.filter((row) => row.nativeListed).map(
  (row) => row.slug,
) as readonly NativeListedSlug[];

export type DronCourseSlug = (typeof DRON_COURSE_SLUGS)[number];

export { ACADEMY_STOREFRONT_EXTRA_TITLES, academyStorefrontTitleBySlug };

export function dronCourseTitle(slug: string): string {
  return academyStorefrontTitleBySlug(slug) ?? slug;
}

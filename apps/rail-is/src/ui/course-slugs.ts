import {
  academyStorefrontTitleBySlug,
  ACADEMY_STOREFRONT_EXTRA_TITLES,
  COURSE_REGISTRY,
} from "@yetkin/kernel";

/**
 * Native vitrin sırası. Kartta `nativeListed` açık olan altı vitrin eğitimi.
 * Sıra kayıt defterindeki `vitrineOrder` alanıdır. Boş kanon kabuk bu listeye girmez.
 * Kanon 13 tip kilidi `packages/kernel` içindedir; bu liste onu genişletmez.
 */
type NativeListedSlug = Extract<(typeof COURSE_REGISTRY)[number], { nativeListed: true }>["slug"];

export const DRON_COURSE_SLUGS = COURSE_REGISTRY.filter((row) => row.nativeListed)
  .slice()
  .sort((left, right) => (left.vitrineOrder ?? 0) - (right.vitrineOrder ?? 0))
  .map((row) => row.slug) as readonly NativeListedSlug[];

export type DronCourseSlug = (typeof DRON_COURSE_SLUGS)[number];

export { ACADEMY_STOREFRONT_EXTRA_TITLES, academyStorefrontTitleBySlug };

export function dronCourseTitle(slug: string): string {
  return academyStorefrontTitleBySlug(slug) ?? slug;
}

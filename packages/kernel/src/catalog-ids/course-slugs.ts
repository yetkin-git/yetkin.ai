/**
 * Yayın SKU kimliği — vize damgası başlık eşlemesi.
 * Vitrin metni akademi odasında çoğaltılmaz. Sicil `course-registry.ts` kartındadır.
 *
 * Kanon: pazar analizindeki 13 odaklı eğitim (Katman 1×5 + Katman 2×5 + Katman 3×3).
 * Canlı vitrin `ACADEMY_GROWTH_SKU_SLUGS` mühürlü amiral SKU’dur.
 */

import { COURSE_REGISTRY } from "./course-registry";

type CourseCard = (typeof COURSE_REGISTRY)[number];
type CanonCard = Extract<CourseCard, { canon: true; audience: "adult" }>;
type CanonSlug = CanonCard["slug"];
type AdultExtraCard = Extract<CourseCard, { canon: false; audience: "adult" }>;

function isCanonCard(row: CourseCard): row is CanonCard {
  return row.audience === "adult" && row.canon;
}

export const ACADEMY_CANON_SKU_SLUGS = COURSE_REGISTRY.filter(isCanonCard).map((row) => row.slug);

export const ACADEMY_COURSE_TITLES = Object.fromEntries(
  COURSE_REGISTRY.filter(isCanonCard).map((row) => [row.slug, row.title]),
) as { [K in CanonSlug]: Extract<CanonCard, { slug: K }>["title"] };

export type AcademyCourseTitleSlug = keyof typeof ACADEMY_COURSE_TITLES;

/** PR-105 alt tanım. Vitrin özeti bu cümleyle açılır. */
export const PROMPT_PRACTICE_SUBTITLE = "Yapay Zekâya Doğru Talimat Verme Sanatı";

/**
 * Kanon 13 dışı canlı vitrin kartı. 13’lük tip kilidi burada genişlemez.
 * Başlık web `OFF_201_TITLE` ile aynı cümledir.
 */
export const ACADEMY_STOREFRONT_EXTRA_TITLES = Object.fromEntries(
  COURSE_REGISTRY.filter((row): row is AdultExtraCard => row.audience === "adult" && !row.canon).map(
    (row) => [row.slug, row.title],
  ),
) as { [K in AdultExtraCard["slug"]]: Extract<AdultExtraCard, { slug: K }>["title"] };

export type AcademyStorefrontExtraSlug = keyof typeof ACADEMY_STOREFRONT_EXTRA_TITLES;

export const ACADEMY_CATALOG_LAYER_BY_SLUG = Object.fromEntries(
  COURSE_REGISTRY.filter(isCanonCard).map((row) => [row.slug, row.layer]),
) as { [K in CanonSlug]: Extract<CanonCard, { slug: K }>["layer"] };

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type LastOf<T> = UnionToIntersection<T extends unknown ? () => T : never> extends () => infer R ? R : never;
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : [...TuplifyUnion<Exclude<T, L>>, L];

type CanonLength = TuplifyUnion<CanonSlug>["length"];
const _canonIsThirteen: CanonLength extends 13 ? true : never = true;
void _canonIsThirteen;

type MissingTitle = Exclude<(typeof ACADEMY_CANON_SKU_SLUGS)[number], AcademyCourseTitleSlug>;
type ExtraTitle = Exclude<AcademyCourseTitleSlug, (typeof ACADEMY_CANON_SKU_SLUGS)[number]>;
type _TitlesMatchCanon = [MissingTitle] extends [never]
  ? [ExtraTitle] extends [never]
    ? true
    : ExtraTitle
  : MissingTitle;
const _titlesMatchCanon: _TitlesMatchCanon = true;
void _titlesMatchCanon;

/**
 * Matrix kilidi sonrası ayrı onboarding SKU yoktur.
 * Visa / sınav özel yolu kapalıdır; null gönderilir.
 */
export const ACADEMY_ONBOARDING_COURSE_SLUG: AcademyCourseTitleSlug | null = null;

export function academyCourseTitleBySlug(slug: string): string | undefined {
  return ACADEMY_COURSE_TITLES[slug as AcademyCourseTitleSlug];
}

/** Kanon başlık, yoksa vitrin eki (`01_office_ai_ileri`). */
export function academyStorefrontTitleBySlug(slug: string): string | undefined {
  return (
    academyCourseTitleBySlug(slug) ??
    ACADEMY_STOREFRONT_EXTRA_TITLES[slug as AcademyStorefrontExtraSlug]
  );
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

export function isAcademyCanonSkuSlug(slug: string): slug is AcademyCourseTitleSlug {
  return Object.prototype.hasOwnProperty.call(ACADEMY_COURSE_TITLES, slug);
}

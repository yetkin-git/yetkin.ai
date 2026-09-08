/**
 * Client-safe akademi vitrin başlıkları. Sınav şıkları ve tohum özeti burada yoktur.
 * Kimlik SSOT: `lib/kernel/catalog-ids`. Bu dosya oda içi import yolu olarak durur.
 */

export {
  ACADEMY_CANON_SKU_SLUGS,
  ACADEMY_CATALOG_LAYER_BY_SLUG,
  ACADEMY_COURSE_TITLES,
  ACADEMY_ONBOARDING_COURSE_SLUG,
  academyCourseTitleBySlug,
  academySlugFromCourseTitle,
  isAcademyCanonSkuSlug,
  type AcademyCourseTitleSlug,
} from "@/lib/kernel/catalog-ids";

/**
 * Çapraz oda katalog kimliği — Proof vizesi ve Marketplace ilan kapısı.
 * SSOT buradadır. lib/kernel/proof mühür okur; bu klasör kimliği taşır.
 */

export {
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_RINGS,
  ACADEMY_PATHWAY_TITLES,
  catalogPathwayRingSlugs,
  catalogPathwayTitleById,
  isAcademyPathwayId,
  parseAcademyPathwayId,
  type AcademyPathwayId,
  type CatalogPathwayRings,
} from "@/lib/kernel/catalog-ids/pathway-ids";

export {
  ACADEMY_COURSE_TITLES,
  ACADEMY_ONBOARDING_COURSE_SLUG,
  academyCourseTitleBySlug,
  academySlugFromCourseTitle,
  type AcademyCourseTitleSlug,
} from "@/lib/kernel/catalog-ids/course-slugs";

export {
  AGILE_ESG_SIBER_LISTING_PATHWAY,
  FREELANCER_LISTING_VISA_DOORS,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  LISTING_VISA_PATHWAY_BY_JOB_ID,
  RAYLI_BIM_LISTING_PATHWAY,
  SIBER_AGILE_ESG_LISTING_PATHWAY,
  TASARIM_FINTEK_BULUT_LISTING_PATHWAY,
  TEKNIK_URUN_AGILE_LISTING_PATHWAY,
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
  YAZILIM_BULUT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  isFreelancerListingVisaDoor,
  parseListingVisaPathwayId,
  type FreelancerListingVisaDoor,
} from "@/lib/kernel/catalog-ids/listing-doors";

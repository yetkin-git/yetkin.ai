import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  parseAcademyPathwayId,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids";

/**
 * Freelancer ilan yazım kilidi — Kariyer inspect'ine import yok (oda duvarı).
 * İşveren seçmezse oda native dikeyi; kelime piyangosu yazımda kullanılmaz.
 */
export const FREELANCER_JOB_DEFAULT_VISA_PATHWAY = FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY;

/** Tohum ilanlar YZ mühendislik dikeyine kilitlenir (sicil id haritası ile aynı). */
export const FREELANCER_SEED_VISA_PATHWAY = YZ_ICERIK_LISTING_PATHWAY;

export function parseFreelancerJobVisaPathwayId(
  value: string | null | undefined,
): AcademyPathwayId | null {
  return parseAcademyPathwayId(value);
}

export function lockFreelancerJobVisaPathway(
  explicit?: AcademyPathwayId | null,
): AcademyPathwayId {
  return parseFreelancerJobVisaPathwayId(explicit) ?? FREELANCER_JOB_DEFAULT_VISA_PATHWAY;
}

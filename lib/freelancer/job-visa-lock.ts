import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  parseListingVisaLockId,
  type ListingVisaLockId,
} from "@/lib/kernel/catalog-ids";

/**
 * Freelancer ilan yazım kilidi — Kariyer inspect'ine import yok (oda duvarı).
 * İşveren ihtiyaç seçmezse oda native ihtiyacı; kelime piyangosu yazımda kullanılmaz.
 */
export const FREELANCER_JOB_DEFAULT_VISA_PATHWAY = FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY;

/** Tohum ilan varsayılanı — sosyal içerik belgesi (tasarım işleri). */
export const FREELANCER_SEED_VISA_PATHWAY = FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY;

export function parseFreelancerJobVisaPathwayId(
  value: string | null | undefined,
): ListingVisaLockId | null {
  return parseListingVisaLockId(value);
}

export function lockFreelancerJobVisaPathway(
  explicit?: ListingVisaLockId | null,
): ListingVisaLockId {
  return parseFreelancerJobVisaPathwayId(explicit) ?? FREELANCER_JOB_DEFAULT_VISA_PATHWAY;
}

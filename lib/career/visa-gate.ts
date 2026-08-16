import { ForbiddenError } from "@/lib/kernel/http/errors";
import type { CareerStore, CareerVisaSourceKind } from "@/lib/career/types";

/** Teklif kapısının istediği vize — emanete / BPS'e girmez. */
export const LISTING_ACCESS_VISA_KIND = "ACADEMY_CERTIFICATE" as const satisfies CareerVisaSourceKind;

export const LISTING_ACCESS_VISA_DENIED =
  "Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir.";

export type ListingVisaStampView = {
  sourceKind: CareerVisaSourceKind;
};

export function hasValidAcademyCareerVisa(stamps: readonly ListingVisaStampView[]): boolean {
  return stamps.some((stamp) => stamp.sourceKind === LISTING_ACCESS_VISA_KIND);
}

/**
 * İlan / teklif kapısı. Hold, RELEASE ve platform payı bu fonksiyonun dışında kalır.
 */
export async function assertAcademyCareerVisaForListing(
  career: Pick<CareerStore, "listStampsForUser">,
  userId: string,
): Promise<void> {
  const stamps = await career.listStampsForUser(userId);
  if (!hasValidAcademyCareerVisa(stamps)) {
    throw new ForbiddenError(LISTING_ACCESS_VISA_DENIED);
  }
}

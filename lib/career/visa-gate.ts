import { ForbiddenError } from "@/lib/kernel/http/errors";
import { ACADEMY_ONBOARDING_COURSE_SLUG } from "@/lib/kernel/catalog-ids";
import type { CareerProofStore, CareerStore, CareerVisaStampRecord } from "@/lib/career/types";
import {
  listingVisaCourseSlugFromStamp,
  qualifyingCourseSlugsForListingPathway,
  resolveListingVisaPathway,
  type ListingVisaSubject,
} from "@/lib/career/listing-visa-scope";

export const LISTING_ACCESS_VISA_KIND = "ACADEMY_CERTIFICATE" as const;

export const LISTING_ACCESS_VISA_DENIED =
  "Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir.";

export const LISTING_ACCESS_VISA_ONBOARDING =
  "Platform onboarding belgesi iş ilanı kapısı değildir. Teklif, ilgili dikey halkanın iş kanıtı belgesine bağlıdır.";

export const LISTING_ACCESS_VISA_SCOPE_DENIED =
  "Bu ilanın dikeyi, taşıdığın akademi vizesinin kapsamı dışında. İlgili dikeyin iş kanıtı belgesi gerekir.";

export type ListingVisaGateCode = "ok" | "denied" | "onboarding" | "scope";

export type ListingVisaGateDecision =
  | { ok: true; code: "ok" }
  | { ok: false; code: Exclude<ListingVisaGateCode, "ok">; message: string };

type ListingVisaStampView = Pick<CareerVisaStampRecord, "sourceKind" | "title"> & {
  courseSlug?: string | null;
};

export function hasValidAcademyCareerVisa(
  stamps: readonly Pick<CareerVisaStampRecord, "sourceKind">[],
): boolean {
  return stamps.some((stamp) => stamp.sourceKind === LISTING_ACCESS_VISA_KIND);
}

export function hasMatchingAcademyListingVisa(
  stamps: readonly ListingVisaStampView[],
  listing: ListingVisaSubject,
): boolean {
  const pathwayId = resolveListingVisaPathway(listing);
  if (!pathwayId) {
    return false;
  }
  const qualifying = new Set(qualifyingCourseSlugsForListingPathway(pathwayId));
  if (qualifying.size === 0) {
    return false;
  }
  return stamps.some((stamp) => {
    if (stamp.sourceKind !== LISTING_ACCESS_VISA_KIND) {
      return false;
    }
    const slug = listingVisaCourseSlugFromStamp({
      title: stamp.title,
      courseSlug: stamp.courseSlug,
    });
    if (
      !slug ||
      (ACADEMY_ONBOARDING_COURSE_SLUG !== null && slug === ACADEMY_ONBOARDING_COURSE_SLUG)
    ) {
      return false;
    }
    return qualifying.has(slug);
  });
}

async function liveAcademyListingStamps(
  stamps: readonly CareerVisaStampRecord[],
  proofs?: Pick<CareerProofStore, "getSealedProof">,
): Promise<ListingVisaStampView[]> {
  const academyStamps = stamps.filter((stamp) => stamp.sourceKind === LISTING_ACCESS_VISA_KIND);
  if (!proofs) {
    return academyStamps;
  }
  const live: ListingVisaStampView[] = [];
  for (const stamp of academyStamps) {
    const proof = await proofs.getSealedProof(stamp.sourceKind, stamp.sourceId);
    if (!proof) {
      continue;
    }
    live.push({
      sourceKind: stamp.sourceKind,
      title: proof.title,
      courseSlug: proof.courseSlug,
    });
  }
  return live;
}

export async function inspectAcademyCareerVisaForListing(
  store: Pick<CareerStore, "listStampsForUser">,
  userId: string,
  listing: ListingVisaSubject,
  proofs?: Pick<CareerProofStore, "getSealedProof">,
): Promise<ListingVisaGateDecision> {
  const stamps = await store.listStampsForUser(userId);
  const academyStamps = await liveAcademyListingStamps(stamps, proofs);
  if (academyStamps.length === 0) {
    return { ok: false, code: "denied", message: LISTING_ACCESS_VISA_DENIED };
  }
  if (hasMatchingAcademyListingVisa(academyStamps, listing)) {
    return { ok: true, code: "ok" };
  }
  const onlyOnboarding =
    ACADEMY_ONBOARDING_COURSE_SLUG !== null &&
    academyStamps.every((stamp) => {
      const slug = listingVisaCourseSlugFromStamp({
        title: stamp.title,
        courseSlug: stamp.courseSlug,
      });
      return slug === ACADEMY_ONBOARDING_COURSE_SLUG;
    });
  if (onlyOnboarding) {
    return { ok: false, code: "onboarding", message: LISTING_ACCESS_VISA_ONBOARDING };
  }
  return { ok: false, code: "scope", message: LISTING_ACCESS_VISA_SCOPE_DENIED };
}

export async function assertAcademyCareerVisaForListing(
  store: Pick<CareerStore, "listStampsForUser">,
  userId: string,
  listing: ListingVisaSubject,
  proofs?: Pick<CareerProofStore, "getSealedProof">,
): Promise<void> {
  const decision = await inspectAcademyCareerVisaForListing(store, userId, listing, proofs);
  if (!decision.ok) {
    throw new ForbiddenError(decision.message);
  }
}

import {
  academyCourseTitleBySlug,
  FREELANCER_GUARANTEED_NEED_IDS,
  listingVisaLockTitle,
  type ListingVisaLockId,
} from "@/lib/kernel/catalog-ids";
import {
  listingVisaCourseSlugFromStamp,
  lockListingVisaPathway,
  qualifyingCourseSlugsForListingPathway,
  type ListingVisaSubject,
} from "@/lib/career/listing-visa-scope";
import { parsePublicTalentId, publicTalentPath } from "@/lib/career/public-talent";
import type { CareerVisaStampRecord } from "@/lib/career/types";
import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";

type VisaStampView = Pick<CareerVisaStampRecord, "sourceKind" | "title"> & {
  id?: string;
  courseSlug?: string | null;
};

export type VisaScopeBenefitId = "employer-network" | "sealed-cv" | "project-proof";

export type VisaScopeBenefit = {
  id: VisaScopeBenefitId;
  held: boolean;
  href: string | null;
};

export type VisaScopeCourse = {
  slug: string;
  title: string;
  href: string;
  held: boolean;
};

export type VisaScopeDoor = {
  pathwayId: ListingVisaLockId;
  pathwayTitle: string;
  courses: VisaScopeCourse[];
  open: boolean;
  benefits: VisaScopeBenefit[];
  publicTalentHref: string | null;
};

export type ListingVisaScopeSignView = {
  pathwayId: ListingVisaLockId;
  pathwayTitle: string;
  courses: readonly { slug: string; title: string; href: string }[];
};

function courseTitle(slug: string): string {
  return academyCourseTitleBySlug(slug) ?? slug;
}

function courseHref(slug: string): string {
  return `${ACADEMY_STAMP_SURFACE_PATH}/${slug}`;
}

function stampHoldsSlug(stamp: VisaStampView, slug: string): boolean {
  if (stamp.sourceKind !== "ACADEMY_CERTIFICATE") {
    return false;
  }
  const held = listingVisaCourseSlugFromStamp({
    title: stamp.title,
    courseSlug: stamp.courseSlug,
  });
  return held === slug;
}

function lockTitle(lockId: ListingVisaLockId): string {
  return listingVisaLockTitle(lockId) ?? lockId;
}

function stampPublicHref(stamp: VisaStampView): string | null {
  const id = stamp.id ? parsePublicTalentId(stamp.id) : null;
  return id ? publicTalentPath(id) : null;
}

/** Kariyer odası tabelası — freelancer teklif kapılarının dürüst haritası. */
export function buildCareerVisaScopeBoard(
  stamps: readonly VisaStampView[],
  portfolio: readonly { visaStampId: string }[] = [],
): VisaScopeDoor[] {
  const proofStampIds = new Set(portfolio.map((item) => item.visaStampId));
  return FREELANCER_GUARANTEED_NEED_IDS.map((pathwayId) => {
    const courses = qualifyingCourseSlugsForListingPathway(pathwayId).map((slug) => ({
      slug,
      title: courseTitle(slug),
      href: courseHref(slug),
      held: stamps.some((stamp) => stampHoldsSlug(stamp, slug)),
    }));
    const qualifyingStamps = stamps.filter((stamp) =>
      courses.some((course) => course.held && stampHoldsSlug(stamp, course.slug)),
    );
    const publicTalentHref = qualifyingStamps.map(stampPublicHref).find((href) => href != null) ?? null;
    const proofHeld = qualifyingStamps.some((stamp) => stamp.id != null && proofStampIds.has(stamp.id));
    const open = courses.some((course) => course.held);
    const benefits: VisaScopeBenefit[] = [
      {
        id: "employer-network",
        held: open,
        href: publicTalentHref,
      },
      {
        id: "sealed-cv",
        held: publicTalentHref != null,
        href: publicTalentHref,
      },
      {
        id: "project-proof",
        held: proofHeld,
        href: proofHeld ? publicTalentHref : null,
      },
    ];
    return {
      pathwayId,
      pathwayTitle: lockTitle(pathwayId),
      courses,
      open,
      benefits,
      publicTalentHref,
    };
  });
}

/** Teklif 403 — bu ilanı hangi kurs açar. */
export function listingVisaScopeSign(listing: ListingVisaSubject): ListingVisaScopeSignView {
  const pathwayId = lockListingVisaPathway(listing);
  const courses = qualifyingCourseSlugsForListingPathway(pathwayId).map((slug) => ({
    slug,
    title: courseTitle(slug),
    href: courseHref(slug),
  }));
  return {
    pathwayId,
    pathwayTitle: lockTitle(pathwayId),
    courses,
  };
}

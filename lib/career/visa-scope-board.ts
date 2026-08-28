import {
  academyCourseTitleBySlug,
  catalogPathwayTitleById,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids";
import {
  FREELANCER_LISTING_VISA_DOORS,
  listingVisaCourseSlugFromStamp,
  lockListingVisaPathway,
  qualifyingCourseSlugsForListingPathway,
  type ListingVisaSubject,
} from "@/lib/career/listing-visa-scope";
import type { CareerVisaStampRecord } from "@/lib/career/types";
import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";

type VisaStampView = Pick<CareerVisaStampRecord, "sourceKind" | "title"> & {
  courseSlug?: string | null;
};

export type VisaScopeCourse = {
  slug: string;
  title: string;
  href: string;
  held: boolean;
};

export type VisaScopeDoor = {
  pathwayId: AcademyPathwayId;
  pathwayTitle: string;
  courses: VisaScopeCourse[];
  open: boolean;
};

export type ListingVisaScopeSignView = {
  pathwayId: AcademyPathwayId;
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

function pathwayTitle(pathwayId: AcademyPathwayId): string {
  return catalogPathwayTitleById(pathwayId) ?? pathwayId;
}

/** Kariyer odası tabelası — freelancer teklif kapılarının dürüst haritası. */
export function buildCareerVisaScopeBoard(
  stamps: readonly VisaStampView[],
): VisaScopeDoor[] {
  return FREELANCER_LISTING_VISA_DOORS.map((pathwayId) => {
    const courses = qualifyingCourseSlugsForListingPathway(pathwayId).map((slug) => ({
      slug,
      title: courseTitle(slug),
      href: courseHref(slug),
      held: stamps.some((stamp) => stampHoldsSlug(stamp, slug)),
    }));
    return {
      pathwayId,
      pathwayTitle: pathwayTitle(pathwayId),
      courses,
      open: courses.some((course) => course.held),
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
    pathwayTitle: pathwayTitle(pathwayId),
    courses,
  };
}

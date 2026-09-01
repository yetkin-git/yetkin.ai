import { listingVisaCourseSlugFromStamp } from "@/lib/career/listing-visa-scope";
import type { CareerVisaStampRecord } from "@/lib/career/types";
import {
  passportAcademyVerifyHref,
  passportFreelancerContractHref,
} from "@/lib/kernel/passport/display";
import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";

/**
 * Liyakat defteri derin bağları — damga → Akademi dersi / Freelancer sözleşme.
 * Uydurma slug veya id üretmez; çözülemezse null.
 */
export function careerStampCourseHref(
  stamp: Pick<CareerVisaStampRecord, "sourceKind" | "title"> & { courseSlug?: string | null },
): string | null {
  if (stamp.sourceKind !== "ACADEMY_CERTIFICATE") {
    return null;
  }
  const slug = listingVisaCourseSlugFromStamp({
    title: stamp.title,
    courseSlug: stamp.courseSlug,
  });
  if (!slug) {
    return null;
  }
  return `${ACADEMY_STAMP_SURFACE_PATH}/${slug}`;
}

export function careerStampContractHref(
  stamp: Pick<CareerVisaStampRecord, "sourceKind" | "sourceId">,
): string | null {
  return passportFreelancerContractHref(stamp);
}

export function careerStampVerifyHref(
  stamp: Pick<CareerVisaStampRecord, "sourceKind" | "certificateHash">,
): string | null {
  return passportAcademyVerifyHref(stamp);
}

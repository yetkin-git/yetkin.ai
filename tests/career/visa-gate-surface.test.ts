import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("kariyer vize kapısı — yüzey mühürü", () => {
  it("visa-gate listinge akademi damgası ister; onboarding slug null iken özel kapı yolu yok", () => {
    const gate = readSrc("lib/career/visa-gate.ts");
    const scope = readSrc("lib/career/listing-visa-scope.ts");
    const titles = readSrc("lib/kernel/catalog-ids/course-slugs.ts");
    expect(gate).toContain("LISTING_ACCESS_VISA_KIND");
    expect(gate).toContain("ACADEMY_CERTIFICATE");
    expect(gate).toContain("assertAcademyCareerVisaForListing");
    expect(gate).toContain("LISTING_ACCESS_VISA_ONBOARDING");
    expect(gate).toContain("LISTING_ACCESS_VISA_SCOPE_DENIED");
    expect(gate).toContain("hasMatchingAcademyListingVisa");
    expect(gate).not.toContain("@/lib/academy");
    expect(scope).toContain("qualifyingCourseSlugsForListingPathway");
    expect(scope).toContain("listingVisaCourseSlugFromStamp");
    expect(scope).not.toContain("@/lib/academy");
    expect(titles).toContain("ACADEMY_ONBOARDING_COURSE_SLUG: AcademyCourseTitleSlug | null = null");
    expect(gate).not.toContain("FREELANCER_RELEASE");
  });

  it("freelancer teklif yolu vize kapısını çağırır; accept vize basmaz", () => {
    const bids = readSrc("app/api/freelancer/jobs/[id]/bids/route.ts");
    const accept = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    expect(bids).toContain("assertAcademyCareerVisaForListing");
    expect(accept).not.toContain("issueCareerVisaStamp");
    expect(accept).not.toContain("tryIssueCareerVisaStamp");
  });
});

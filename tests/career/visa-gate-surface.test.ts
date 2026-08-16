import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D2.3 Kariyer Vizesi teklif kapısı yüzeyi", () => {
  it("kapı yalnız ACADEMY_CERTIFICATE okur; hold/BPS/RELEASE yok", () => {
    const gate = readSrc("lib/career/visa-gate.ts");
    expect(gate).toContain("ACADEMY_CERTIFICATE");
    expect(gate).toContain("ForbiddenError");
    expect(gate).toContain("assertAcademyCareerVisaForListing");
    expect(gate).not.toContain("createEscrowHold");
    expect(gate).not.toContain("holdBps");
    expect(gate).not.toContain("releaseEscrowHold");
    expect(gate).not.toContain("splitGross");
    expect(gate).not.toContain("amountMinor");
  });

  it("freelancer ve kurumsal teklif HTTP kapıyı çağırır; motorlar vize import etmez", () => {
    const bids = readSrc("app/api/freelancer/jobs/[id]/bids/route.ts");
    const offers = readSrc("app/api/kurumsal/jobs/[id]/offers/route.ts");
    const award = readSrc("app/api/kurumsal/jobs/[id]/award/route.ts");
    const freelancerEngine = readSrc("lib/freelancer/engine.ts");
    const kurumsalEngine = readSrc("lib/kurumsal/engine.ts");
    expect(bids).toContain("assertAcademyCareerVisaForListing");
    expect(bids).toContain("submitFreelancerBid");
    expect(offers).toContain("assertAcademyCareerVisaForListing");
    expect(offers).toContain("submitCorporateJobOffer");
    expect(award).toContain("assertAcademyCareerVisaForListing");
    expect(freelancerEngine).not.toContain("assertAcademyCareerVisaForListing");
    expect(freelancerEngine).not.toContain("@/lib/career");
    expect(kurumsalEngine).not.toContain("assertAcademyCareerVisaForListing");
    expect(kurumsalEngine).not.toContain("@/lib/career");
    expect(kurumsalEngine).not.toContain("@/lib/freelancer");
  });
});

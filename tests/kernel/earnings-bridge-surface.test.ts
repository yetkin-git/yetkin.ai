import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D2.3 kazanç köprüsü yüzeyi — tek emanet, oda duvarı, vize kapısı", () => {
  it("freelancer ve kurumsal aynı çekirdek EscrowHold yazıcısını çağırır; birbirini import etmez", () => {
    const freelancer = readSrc("lib/freelancer/engine.ts");
    const kurumsal = readSrc("archived/lib/kurumsal/engine.ts");
    const escrow = readSrc("lib/kernel/escrow/engine.ts");
    expect(freelancer).toContain('from "@/lib/kernel/escrow"');
    expect(freelancer).toContain("createEscrowHold");
    expect(freelancer).toContain("escrowHoldId: hold.id");
    expect(kurumsal).toContain('from "@/lib/kernel/escrow"');
    expect(kurumsal).toContain("createEscrowHold");
    expect(kurumsal).toContain("escrowHoldId: hold.id");
    expect(freelancer).not.toContain("@/lib/kurumsal");
    expect(kurumsal).not.toContain("@/lib/freelancer");
    expect(escrow).not.toContain("ACADEMY_CERTIFICATE");
    expect(escrow).not.toContain("@/lib/career");
    expect(escrow).not.toContain("@/lib/freelancer");
    expect(escrow).not.toContain("@/lib/kurumsal");
  });

  it("HTTP release FREELANCER_RELEASE damgası basar; kurumsal release 410 stub; accept vize sokmaz", () => {
    const freelancerRelease = readSrc("app/api/freelancer/contracts/[id]/release/route.ts");
    const kurumsalRelease = readSrc("app/api/_gone/[...path]/route.ts");
    const accept = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    const helper = readSrc("tests/helpers/earnings-bridge.ts");
    expect(freelancerRelease).toContain("tryIssueCareerVisaStamp");
    expect(freelancerRelease).toContain("FREELANCER_RELEASE");
    expect(kurumsalRelease).toContain("frozenRoomGone");
    expect(accept).not.toContain("tryIssueCareerVisaStamp");
    expect(helper).toContain("assertAcademyCareerVisaForListing");
    expect(helper).toContain("postFreelancerContractMessage");
    expect(helper).toContain("kind: \"DELIVERY\"");
    expect(helper).toContain("issueCareerVisaStamp");
    expect(helper).toContain("HOLD_BPS_DEFAULT");
  });

  it("verify:boundaries freelancer/kurumsal oda duvarını tarar", () => {
    const boundaries = readSrc("scripts/verify-boundaries.ts");
    const eslint = readSrc("eslint.config.mjs");
    expect(boundaries).toContain("EARNINGS_WALL");
    expect(boundaries).toContain("room.wall");
    expect(eslint).toContain("EARNINGS_WALL");
    expect(eslint).toContain("room.wall");
  });
});

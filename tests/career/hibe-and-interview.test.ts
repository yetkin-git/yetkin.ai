import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { careerSourceModuleId, careerVisaKey } from "@/lib/career/types";
import { PASSPORT_STAMP_SOURCE_KINDS } from "@/lib/kernel/passport/types";
import { passportSourceLabel } from "@/lib/kernel/passport/display";
import { CAREER_INTERVIEW_STATUSES } from "@/lib/career/interview-types";

describe("Y6 / F2.5 — YetkinHibe proje kanıtı", () => {
  it("PassportStampSourceKind YETKINHIBE_PROJECT içerir", () => {
    expect(PASSPORT_STAMP_SOURCE_KINDS).toContain("YETKINHIBE_PROJECT");
    expect(passportSourceLabel("YETKINHIBE_PROJECT")).toBe("YetkinHibe proje kanıtı");
    expect(careerVisaKey("YETKINHIBE_PROJECT", "app1")).toBe("yetkinhibe.project:app1");
    expect(careerSourceModuleId("YETKINHIBE_PROJECT")).toBe("yetkinhibe");
  });

  it("Prisma enum + ProofReadPort + hibe-proof API IDOR korumalı", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema/career.prisma"), "utf8");
    expect(schema).toContain("YETKINHIBE_PROJECT");
    const proof = readFileSync(join(process.cwd(), "lib/kernel/proof/prisma-read.ts"), "utf8");
    expect(proof).toContain("getYetkinHibeProjectProofRow");
    expect(proof).toContain('sourceKind: "YETKINHIBE_PROJECT"');
    const route = readFileSync(join(process.cwd(), "app/api/career/hibe-proof/route.ts"), "utf8");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("attachHibeApplicationAsCareerProof");
    const bridge = readFileSync(join(process.cwd(), "lib/career/hibe-proof.ts"), "utf8");
    expect(bridge).toContain("ForbiddenError");
    expect(bridge).toContain("proof.userId !== userId");
  });
});

describe("Y9 / F2.6 — görüşme daveti kabul/ret", () => {
  it("status enum PENDING/ACCEPTED/DECLINED", () => {
    expect([...CAREER_INTERVIEW_STATUSES]).toEqual(["PENDING", "ACCEPTED", "DECLINED"]);
  });

  it("interview API + panel Kabul/Reddet aksiyonları taşır", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema/career.prisma"), "utf8");
    expect(schema).toContain("CareerContactRequestStatus");
    expect(schema).toContain("PENDING");
    expect(schema).toContain("ACCEPTED");
    expect(schema).toContain("DECLINED");
    const route = readFileSync(join(process.cwd(), "app/api/career/interview/route.ts"), "utf8");
    expect(route).toContain("respondToInterviewInvite");
    expect(route).toContain("ACCEPTED");
    expect(route).toContain("DECLINED");
    const panel = readFileSync(
      join(process.cwd(), "components/career/interview-invite-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("Kabul Et");
    expect(panel).toContain("Reddet");
    expect(panel).not.toContain("dangerouslySetInnerHTML");
  });

  it("yanıt gövdesi aday e-postası basmaz", () => {
    const route = readFileSync(join(process.cwd(), "app/api/career/interview/route.ts"), "utf8");
    expect(route).toContain("requesterName");
    expect(route).not.toMatch(/talentEmail|candidateEmail|user\.email/);
  });
});

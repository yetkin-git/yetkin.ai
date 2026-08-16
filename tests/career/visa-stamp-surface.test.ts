import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("kariyer vize mühürü — yazma yüzeyi", () => {
  it("Prisma store damga+portföyü $transaction içine alır; motor heal eder", () => {
    const engine = readSrc("lib/career/engine.ts");
    const store = readSrc("lib/career/prisma-store.ts");
    const types = readSrc("lib/career/types.ts");
    expect(store).toContain("prisma.$transaction");
    expect(store).toContain("bindCareerWrites(tx)");
    expect(types).toContain("runStampPortfolioAtomic");
    expect(engine).toContain("runStampPortfolioAtomic");
    expect(engine).toContain("withUniqueRetry");
    expect(engine).toContain("P2002");
    expect(engine).toContain("healed: true");
    expect(engine).toContain("setStampCertificateHash");
    expect(engine).toContain("certificateHash");
    expect(engine).not.toContain("Vize portföy satırı eksik");
  });

  it("sınav ve release tryIssue kullanır; kariyer load sync ile heal yolunu açar", () => {
    const exam = readSrc("app/api/academy/courses/[id]/exam/route.ts");
    const release = readSrc("app/api/freelancer/contracts/[id]/release/route.ts");
    const load = readSrc("lib/career/load.ts");
    const visas = readSrc("app/api/career/visas/route.ts");
    const portfolio = readSrc("app/api/career/portfolio/route.ts");
    expect(exam).toContain("tryIssueCareerVisaStamp");
    expect(exam).toContain("submitAcademyExam");
    expect(exam).not.toContain("syncCareerVisaStamps");
    expect(release).toContain("tryIssueCareerVisaStamp");
    const kurumsalRelease = readSrc("app/api/kurumsal/jobs/[id]/release/route.ts");
    expect(kurumsalRelease).toContain("tryIssueCareerVisaStamp");
    expect(kurumsalRelease).toContain("FREELANCER_RELEASE");
    expect(load).toContain("syncCareerVisaStamps");
    expect(load).not.toContain("tryIssueCareerVisaStamp");
    expect(visas).toContain("syncCareerVisaStamps");
    expect(portfolio).toContain("syncCareerVisaStamps");
    expect(load).toContain("findPassportStampsForUser");
  });

  it("satın alma + sınav + vize tek transaction değildir", () => {
    const examEngine = readSrc("lib/academy/exam-engine.ts");
    const academyEngine = readSrc("lib/academy/engine.ts");
    const careerEngine = readSrc("lib/career/engine.ts");
    expect(examEngine).not.toContain("issueCareerVisaStamp");
    expect(examEngine).not.toContain("$transaction");
    expect(academyEngine).not.toContain("issueCareerVisaStamp");
    expect(careerEngine).not.toContain("purchaseAcademyCourse");
    expect(careerEngine).not.toContain("submitAcademyExam");
  });
});

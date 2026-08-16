import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("freelancer kabul mühürü — yazma yüzeyi", () => {
  it("Prisma runtime debit+hold+sözleşmeyi $transaction içine alır; motor P2002 retry eder", () => {
    const engine = readSrc("lib/freelancer/engine.ts");
    const runtime = readSrc("lib/freelancer/runtime.ts");
    const types = readSrc("lib/freelancer/types.ts");
    const fsm = readSrc("lib/freelancer/fsm.ts");
    expect(runtime).toContain("prisma.$transaction");
    expect(runtime).toContain("bindLedgerStore(tx)");
    expect(runtime).toContain("bindEscrowStore(tx)");
    expect(runtime).toContain("bindFreelancerStore(tx)");
    expect(types).toContain("runAcceptAtomic");
    expect(engine).toContain("runAcceptAtomic");
    expect(engine).toContain("withUniqueRetry");
    expect(engine).toContain("P2002");
    expect(engine).toContain("healed: !holdApplied");
    expect(engine).toContain("createEscrowHold");
    expect(engine).toContain("freelancerJobEscrowReferenceKey");
    expect(fsm).toContain("freelancer.contract.job:");
    expect(engine).not.toContain("freelancerContractReferenceKey(contractId)");
  });

  it("kabul route sözleşmeyi döner; kariyer vizesini accept transaction'ına sokmaz", () => {
    const route = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    const engine = readSrc("lib/freelancer/engine.ts");
    const release = readSrc("app/api/freelancer/contracts/[id]/release/route.ts");
    expect(route).toContain("acceptFreelancerBid");
    expect(route).toContain("createPrismaFreelancerPorts");
    expect(route).not.toContain("tryIssueCareerVisaStamp");
    expect(route).not.toContain("issueCareerVisaStamp");
    expect(engine).not.toContain("tryIssueCareerVisaStamp");
    expect(engine).not.toContain("issueCareerVisaStamp");
    expect(release).toContain("tryIssueCareerVisaStamp");
  });

  it("cüzdan kilidi FOR UPDATE vaadini Prisma ledger store'da tutar", () => {
    const ledger = readSrc("lib/kernel/ledger/prisma-store.ts");
    expect(ledger).toContain("FOR UPDATE");
    expect(ledger).toContain("bindLedgerStore");
    expect(ledger).toContain("FROM wallets");
  });
});

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("prebuild güvenlik kapısı ve nightly grep kovası — yazma yüzeyi", () => {
  it("verify:prebuild yalnız güvenlik mühürlerini koşar; grep/marka/surface nightly'dedir", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const nightly = pkg.scripts["verify:nightly"] ?? "";
    const grepSeals = pkg.scripts["verify:grep-seals"] ?? "";
    const build = pkg.scripts.build;
    expect(build).toContain("verify:prebuild");
    expect(pkg.scripts["verify:atomic-seals"]).toBe("tsx scripts/verify-atomic-seals.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tsx scripts/verify-idor-seals.ts");
    expect(pkg.scripts["verify:academy-pedagogy-seals"]).toBe(
      "vitest run tests/academy/pedagogy-seals-retired.test.ts",
    );
    expect(pkg.scripts["verify:academy-pedagogy-seals"]).not.toContain("pedagogy-doctrine");
    expect(pkg.scripts["verify:academy-pedagogy-seals"]).not.toContain("proof-of-work.test.ts");
    expect(pkg.scripts["verify:sen-axis"]).toBe("tsx scripts/verify-sen-axis.ts");
    expect(pkg.scripts["verify:no-secrets"]).toBe("tsx scripts/verify-no-secrets.ts");
    expect(pkg.scripts["test:surface"]).toBe(
      "vitest run surface.test.ts constitution-surfaces.test.ts",
    );
    expect(prebuild).not.toContain("verify:atomic-seals");
    expect(grepSeals).toContain("verify:atomic-seals");
    expect(prebuild).toContain("verify:idor-seals");
    expect(prebuild).not.toContain("verify:academy-pedagogy-seals");
    expect(nightly).not.toContain("verify:academy-pedagogy-seals");
    expect(prebuild).toContain("verify:no-secrets");
    expect(prebuild).toContain("verify:amount-minor");
    expect(prebuild).toContain("verify:rls-status");
    expect(prebuild).not.toContain("verify:api-auth");
    expect(prebuild).not.toContain("verify:boundaries");
    expect(grepSeals).toContain("verify:api-auth");
    expect(grepSeals).toContain("verify:boundaries");
    expect(grepSeals).toContain("verify:sen-axis");
    expect(nightly).toContain("verify:grep-seals");
    expect(prebuild).toContain("verify:v1-contract-artifacts");
    expect(prebuild).not.toContain("verify:web-security-seals");
    expect(prebuild).not.toContain("verify:paytr-reconciliation-seals");
    expect(prebuild).not.toContain("test:surface");
    expect(prebuild).not.toContain("verify:ai-gateway");
    expect(prebuild).not.toContain("verify:sen-axis");
    expect(prebuild).not.toContain("typecheck");
    expect(prebuild).not.toContain("ops:migrate");
    expect(prebuild).not.toMatch(/(?:^|[\s&;])npm test(?:$|[\s&;])/);
    expect(pkg.scripts.test).toContain("--exclude");
    expect(pkg.scripts.test).toContain("surface.test.ts");
    expect(pkg.scripts.test).not.toContain("constitution-surfaces.test.ts");
    expect(pkg.scripts.test).not.toContain("four-room-smoke.test.ts");
    expect(pkg.scripts.test).not.toContain("money-uow-rollback.test.ts");
    expect(pkg.scripts.test).not.toContain("escrow-refund-hooks-vertical.test.ts");
    expect(nightly).toContain("verify:ai-gateway");
    expect(nightly).toContain("verify:web-security-seals");
    expect(nightly).toContain("verify:paytr-reconciliation-seals");
    expect(nightly).not.toContain("verify:junior-guardianship-seals");
    expect(nightly).toContain("test:surface");
    expect(pkg.scripts["test:frozen"]).toContain("vitest.frozen.config.ts");
  });

  it("statik betik kariyer heal, freelancer accept ve ledger FOR UPDATE tarar; Postgres istemez", () => {
    const script = readSrc("scripts/verify-atomic-seals.ts");
    expect(script).toContain("lib/career/engine.ts");
    expect(script).toContain("runStampPortfolioAtomic");
    expect(script).toContain("healed: true");
    expect(script).toContain("lib/career/prisma-store.ts");
    expect(script).toContain("lib/career/prisma-proofs.ts");
    expect(script).toContain("createPrismaProofReadPort");
    expect(script).toContain("lib/kernel/proof/prisma-read.ts");
    expect(script).toContain("corporateJobPosting");
    expect(script).toContain("4 oda donmuş Prisma delegate");
    expect(script).toContain("prisma.$transaction");
    expect(script).toContain("lib/freelancer/engine.ts");
    expect(script).toContain("runAcceptAtomic");
    expect(script).toContain("runReleaseAtomic");
    expect(script).toContain("freelancerJobEscrowReferenceKey");
    expect(script).toContain("lib/kernel/ledger/prisma-store.ts");
    expect(script).toContain("FOR UPDATE");
    expect(script).toContain("lockByReferenceKey");
    expect(script).toContain("reconcilePaytrPaymentOrder");
    expect(script).toContain("runPurchaseAtomic");
    expect(script).toContain("runSettleAtomic");
    expect(script).toContain("runMoneyAtomic");
    expect(script).toContain("archived/lib/pazaryeri/runtime.ts");
    expect(script).toContain("archived/lib/junior/runtime.ts");
    expect(script).toContain("archived/lib/arena/runtime.ts");
    expect(script).toContain("archived/lib/kurumsal/runtime.ts");
    expect(script).toContain("archived/lib/devlabs/runtime.ts");
    expect(script).toContain("lib/kernel/ledger/credit-purposes.ts");
    expect(script).toContain("assertLedgerCreditPurpose");
    expect(script).toContain("jsonOk");
    expect(script).toContain("PayTR v1 zarfına sarılmaz");
    expect(script).toContain("tests/kernel/money-uow-surface.test.ts");
    expect(script).toContain("tests/kernel/ledger-concurrency-surface.test.ts");
    expect(script).toContain("tests/kernel/idor-seals-surface.test.ts");
    expect(script).toContain("tests/freelancer/idor-job-board-surface.test.ts");
    expect(script).not.toContain("tests/arena/idor-tender-board-surface.test.ts");
    expect(script).toContain("tests/kernel/web-security-seals-surface.test.ts");
    expect(script).toContain("tests/kernel/paytr-reconciliation-seals-surface.test.ts");
    expect(script).toContain("tests/kernel/paytr-cas-surface.test.ts");
    expect(script).toContain("tests/kernel/circuit-breakers-surface.test.ts");
    expect(script).toContain("tests/kernel/ledger-immutability-surface.test.ts");
    expect(script).not.toContain("tests/studio/command-idempotency-surface.test.ts");
    expect(script).toContain("assertEidsPublicListingAllowed");
    expect(script).toContain("assertJuniorProductionOpen");
    expect(script).toContain("INSERT INTO ledger_entries");
    expect(script).toContain("app/api/_gone/[...path]/route.ts");
    expect(script).toContain("accept/route.ts");
    expect(script).toContain("readIdempotencyKey");
    expect(script).toContain("shouldFailClosedInngestServe");
    expect(script).toContain("tests/kernel/constitution-surfaces.test.ts");
    expect(script).toContain("tests/kernel/four-room-smoke.test.ts");
    expect(script).toContain("tests/kernel/money-uow-rollback.test.ts");
    expect(script).toContain("tests/kernel/escrow-refund-hooks-vertical.test.ts");
    expect(script).toContain("constitution-surfaces.test.ts süzgeci yok");
    expect(script).toContain("çekirdek kapıdan --exclude ile çıkarılmamalı");
    expect(script).toContain("tryIssueCareerVisaStamp");
    expect(script).toContain("Canlı Postgres yok");
    expect(script).not.toContain("getPrisma()");
    expect(script).not.toContain("scripts/ops-migrate.ts");
    expect(script).not.toContain("DATABASE_URL");
    expect(existsSync(join(ROOT, "scripts/verify-atomic-seals.ts"))).toBe(true);
  });

  it("prebuild güvenlik sırası: secrets → amount → rls → v1 → idor", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const secretsAt = prebuild.indexOf("verify:no-secrets");
    const amountAt = prebuild.indexOf("verify:amount-minor");
    const rlsAt = prebuild.indexOf("verify:rls-status");
    const v1ArtifactsAt = prebuild.indexOf("verify:v1-contract-artifacts");
    const idorAt = prebuild.indexOf("verify:idor-seals");
    expect(secretsAt).toBeGreaterThan(-1);
    expect(amountAt).toBeGreaterThan(secretsAt);
    expect(rlsAt).toBeGreaterThan(amountAt);
    expect(v1ArtifactsAt).toBeGreaterThan(rlsAt);
    expect(idorAt).toBeGreaterThan(v1ArtifactsAt);
    expect(prebuild).not.toContain("verify:atomic-seals");
    expect(prebuild).not.toContain("verify:api-auth");
    expect(prebuild).not.toContain("verify:boundaries");
    expect(prebuild).not.toContain("verify:academy-pedagogy-seals");
  });
});

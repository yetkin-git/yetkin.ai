import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("prebuild atomik mühür zinciri — yazma yüzeyi", () => {
  it("verify:prebuild atomik grep + surface vitest çalıştırır; canlı DB betiği sokmaz", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const build = pkg.scripts.build;
    expect(build).toContain("verify:prebuild");
    expect(pkg.scripts["verify:atomic-seals"]).toBe("tsx scripts/verify-atomic-seals.ts");
    expect(pkg.scripts["verify:sen-axis"]).toBe("tsx scripts/verify-sen-axis.ts");
    expect(pkg.scripts["verify:no-secrets"]).toBe("tsx scripts/verify-no-secrets.ts");
    expect(pkg.scripts["test:surface"]).toBe(
      "vitest run surface.test.ts constitution-surfaces.test.ts",
    );
    expect(prebuild).toContain("verify:atomic-seals");
    expect(prebuild).toContain("verify:no-secrets");
    expect(prebuild).toContain("test:surface");
    expect(prebuild).toContain("verify:amount-minor");
    expect(prebuild).toContain("verify:ai-gateway");
    expect(prebuild).toContain("verify:rls-status");
    expect(prebuild).toContain("verify:api-auth");
    expect(prebuild).toContain("verify:boundaries");
    expect(prebuild).toContain("verify:sen-axis");
    expect(prebuild).toContain("typecheck");
    expect(prebuild).not.toContain("ops:migrate");
    expect(prebuild).not.toMatch(/(?:^|[\s&;])npm test(?:$|[\s&;])/);
  });

  it("statik betik kariyer heal, freelancer accept ve ledger FOR UPDATE tarar; Postgres istemez", () => {
    const script = readSrc("scripts/verify-atomic-seals.ts");
    expect(script).toContain("lib/career/engine.ts");
    expect(script).toContain("runStampPortfolioAtomic");
    expect(script).toContain("healed: true");
    expect(script).toContain("lib/career/prisma-store.ts");
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
    expect(script).toContain("accept/route.ts");
    expect(script).toContain("readIdempotencyKey");
    expect(script).toContain("shouldFailClosedInngestServe");
    expect(script).toContain("tests/kernel/constitution-surfaces.test.ts");
    expect(script).toContain("constitution-surfaces.test.ts süzgeci yok");
    expect(script).toContain("tryIssueCareerVisaStamp");
    expect(script).toContain("Canlı Postgres yok");
    expect(script).not.toContain("getPrisma()");
    expect(script).not.toContain("scripts/ops-migrate.ts");
    expect(script).not.toContain("DATABASE_URL");
  });

  it("build typecheck'ten önce atomik mühürleri keser", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const secretsAt = prebuild.indexOf("verify:no-secrets");
    const amountAt = prebuild.indexOf("verify:amount-minor");
    const senAt = prebuild.indexOf("verify:sen-axis");
    const atomicAt = prebuild.indexOf("verify:atomic-seals");
    const surfaceAt = prebuild.indexOf("test:surface");
    const typecheckAt = prebuild.indexOf("typecheck");
    expect(secretsAt).toBeGreaterThan(-1);
    expect(amountAt).toBeGreaterThan(secretsAt);
    expect(senAt).toBeGreaterThan(-1);
    expect(atomicAt).toBeGreaterThan(senAt);
    expect(surfaceAt).toBeGreaterThan(atomicAt);
    expect(typecheckAt).toBeGreaterThan(surfaceAt);
  });
});

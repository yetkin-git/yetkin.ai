import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("IDOR mühür zinciri yüzeyi", () => {
  it("verify:idor-seals prebuild güvenlik kapısındadır; grep atomic nightly'dedir", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const grepSeals = pkg.scripts["verify:grep-seals"] ?? "";
    expect(pkg.scripts["verify:idor-seals"]).toContain("tsx scripts/verify-idor-seals.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/freelancer/idor-job-board.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/freelancer/idor-party-forbidden.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/freelancer/idor-direct-offers.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/academy/idor-exam-purchase.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/career/idor-portfolio.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).not.toContain("tests/arena/idor-tender-board.test.ts");
    expect(pkg.scripts["verify:idor-seals"]).toContain("tests/kernel/authorize.test.ts");
    expect(prebuild).toContain("verify:idor-seals");
    expect(prebuild).not.toContain("verify:atomic-seals");
    expect(grepSeals).toContain("verify:atomic-seals");
    expect(prebuild).not.toContain("test:surface");
    expect(prebuild).not.toContain("verify:web-security-seals");
  });

  it("çekirdek authorize ve oda projeksiyonları tek kapıyı paylaşır", () => {
    const authorize = readSrc("lib/kernel/security/authorize.ts");
    expect(authorize).toContain("export function authorize");
    expect(authorize).toContain("read.summary");
    expect(authorize).toContain("read.secrets");
    expect(authorize).toContain("read.own_entry");
    expect(authorize).toContain("third_party");
    expect(authorize).not.toContain("@/lib/freelancer");
    expect(authorize).not.toContain("@/lib/arena");
  });
});

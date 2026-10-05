import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Junior vekâlet mühür zinciri yüzeyi", () => {
  it("verify:junior-guardianship-seals çekirdek prebuild ve nightly'de yoktur; 410 / test:frozen", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    expect(pkg.scripts["verify:junior-guardianship-seals"]).toContain(
      "tsx scripts/verify-junior-guardianship-seals.ts",
    );
    expect(pkg.scripts["verify:junior-guardianship-seals"]).toContain(
      "tests/junior/guardianship.test.ts",
    );
    expect(pkg.scripts["verify:junior-guardianship-seals"]).toContain("vitest.frozen.config.ts");
    expect(prebuild).not.toContain("verify:junior-guardianship-seals");
    expect(pkg.scripts["verify:nightly"]).not.toContain("verify:junior-guardianship-seals");
    expect(pkg.scripts["test:frozen"]).toContain("vitest.frozen.config.ts");
    expect(prebuild).not.toContain("verify:paytr-reconciliation-seals");
  });

  it("profil şeması rastgele guardianUserId yazmaz; HTTP 410 stub'dur", () => {
    const schema = readSrc("archived/lib/junior/schemas.ts");
    expect(schema).toContain(".strict()");
    expect(schema).not.toContain("guardianUserId: z.string()");
    const route = readSrc("app/api/_gone/[...path]/route.ts");
    expect(route).toContain("frozenRoomGone");
    expect(readSrc("archived/lib/junior/engine.ts")).not.toContain("guardianUserId: command.guardianUserId");
    expect(readSrc("archived/lib/junior/engine.ts")).not.toContain("export async function consentJuniorProfile");
  });
});

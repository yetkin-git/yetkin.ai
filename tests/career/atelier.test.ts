import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("kariyer atölye vitrini sökülüdür", () => {
  it("radar / SWOT / koç dosyaları ve atelier projeksiyonu yoktur", () => {
    for (const file of [
      "lib/career/atelier.ts",
      "components/career/talent-radar.tsx",
      "components/career/swot-panel.tsx",
      "components/career/career-blueprint.tsx",
      "components/career/badge-vitrine.tsx",
      "components/career/career-coach.tsx",
      "components/career/interview-drill.tsx",
    ]) {
      expect(existsSync(join(ROOT, file)), file).toBe(false);
    }
    const page = readFileSync(join(ROOT, "app/career/page.tsx"), "utf8");
    expect(page).toContain("VisaLedger");
    expect(page).toContain("VisaScopeBoard");
    expect(page).not.toContain("projectCareerAtelier");
    expect(page).not.toContain("TalentRadar");
    expect(page).not.toContain("SwotPanel");
    expect(page).not.toContain("CareerCoach");
  });
});

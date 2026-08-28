import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("freelancer IDOR yüzeyi — teklif projeksiyonu", () => {
  it("RSC loader, API ve sayfa queryJobBoard + oturum aktörü kullanır; ham teklif listesi basılmaz", () => {
    const load = readSrc("lib/freelancer/load.ts");
    const route = readSrc("app/api/freelancer/jobs/[id]/route.ts");
    const page = readSrc("app/freelancer/jobs/[id]/page.tsx");
    const board = readSrc("lib/freelancer/job-board.ts");

    expect(board).toContain("authorize(input.actor");
    expect(board).toContain('authorize(input.actor, "read.secrets"');
    expect(board).toContain("queryJobBoard");
    expect(board).toContain("projectJobBoard");

    expect(load).toContain("queryJobBoard");
    expect(load).toContain("actorUserId");
    expect(load).not.toContain("listBidsForJob");

    expect(route).toContain("queryJobBoard");
    expect(route).toContain("requireSession");
    expect(route).not.toContain("listBidsForJob");

    expect(page).toContain("loadJobBoard");
    expect(page).toContain("getSession");
    expect(page).toContain("session?.id ?? null");
    expect(page).toContain("bidsHidden");
  });
});

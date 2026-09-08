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
    expect(route).toContain("export async function DELETE");
    expect(route).toContain("cancelFreelancerJob");
    expect(route).toContain("actorUserId: user.id");
    expect(route).not.toContain("listBidsForJob");
    expect(route).not.toContain("freelancerJob.delete");

    expect(page).toContain("loadJobBoard");
    expect(page).toContain("getSession");
    expect(page).toContain("session?.id ?? null");
    expect(page).toContain("bidsHidden");
    expect(page).toContain("CancelJobButton");
    expect(page).toContain('isClient && board.job.status === "OPEN"');

    const engine = readSrc("lib/freelancer/engine.ts");
    expect(engine).toContain("export async function cancelFreelancerJob");
    expect(engine).toContain("command.actorUserId !== job.clientId");
    expect(engine).toContain('status: "CANCELLED"');
    expect(engine).not.toContain("deleteJob");

    const card = readSrc("components/freelancer/job-card.tsx");
    expect(card).not.toContain("CancelJobButton");
    expect(card).not.toContain("İlanı Kapat");
  });
});

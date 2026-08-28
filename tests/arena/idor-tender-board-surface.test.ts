import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("arena IDOR yüzeyi — teslim projeksiyonu", () => {
  it("RSC/API 410 stub; board projeksiyonu lib'de IDOR korur", () => {
    const load = readSrc("archived/lib/arena/load.ts");
    const route = readSrc("app/api/_gone/[...path]/route.ts");
    const page = readSrc("archived/app/arena/[id]/page.tsx");
    const board = readSrc("archived/lib/arena/tender-board.ts");

    expect(board).toContain("authorize(input.actor");
    expect(board).toContain('authorize(input.actor, "read.secrets"');
    expect(board).toContain("queryTenderBoard");
    expect(board).toContain("projectTenderBoard");
    expect(board).toContain("escrowHoldId");

    expect(load).toContain("queryTenderBoard");
    expect(load).toContain("actorUserId");
    expect(load).not.toContain("listSubmissionsForTender");

    expect(route).toContain("frozenRoomGone");
    expect(route).not.toContain("listSubmissionsForTender");

    expect(page).toContain("FrozenRoomGonePage");
    expect(page).toContain('roomId="arena"');
  });
});

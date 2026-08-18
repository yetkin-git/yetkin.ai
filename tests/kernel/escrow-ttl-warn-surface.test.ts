import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("emanet TTL yaklaşım yüzeyi", () => {
  it("Inngest tarama aday seçer; tekil handler bildirir; dikey tablo yazmaz", () => {
    const source = readSrc("lib/kernel/jobs/inngest.ts");
    expect(source).toContain("selectEscrowTtlApproachingHolds");
    expect(source).toContain("applyEscrowTtlApproachingNotice");
    expect(source).toContain("escrow-ttl-warn:");
    expect(source).toContain("idempotency: \"event.data.holdId\"");
    expect(source).not.toContain("freelancerContract");
    expect(source).not.toContain("model Notification");
    const scan = readSrc("lib/kernel/jobs/escrow-ttl-warn.ts");
    expect(scan).toContain("listPendingExpiringSoon");
    expect(scan).toContain("ESCROW_TTL_WARN_WINDOW_MS");
    expect(scan).not.toContain("getPrisma");
  });
});

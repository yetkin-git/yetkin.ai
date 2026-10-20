import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CLOSED_BFF_SURFACES } from "@/lib/closed-bff-surface";

describe("hop dışı kapalı BFF yüzeyi", () => {
  it("akademi stüdyo artığı ve freelancer uydusu tek listede, ortak 410 handler'da durur", () => {
    const root = process.cwd();
    const paths = CLOSED_BFF_SURFACES.map((row) => row.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual([
      "/api/academy/generateSpeech",
      "/api/academy/discussion",
      "/api/academy/reviews",
      "/api/academy/courses/[id]/listen",
      "/api/academy/courses/[id]/pdf",
      "/api/admin/curriculum-revisions",
      "/api/freelancer/squad",
      "/api/freelancer/direct-offers",
      "/api/freelancer/direct-offers/[id]/accept",
      "/api/freelancer/direct-offers/[id]/decline",
    ]);

    const helper = readFileSync(join(root, "lib/kernel/http/closed-surface-route.ts"), "utf8");
    expect(helper).toContain("410");
    expect(helper).not.toContain("@prisma/client");
    expect(helper).not.toContain("@/lib/academy");
    expect(helper).not.toContain("@/lib/freelancer");

    for (const row of CLOSED_BFF_SURFACES) {
      expect(row.message.length).toBeGreaterThan(8);
      const source = readFileSync(join(root, row.file), "utf8");
      expect(source, row.file).toContain("closedSurfaceGone");
      expect(source, row.file).toContain('auth = "public"');
      expect(source, row.file).toContain("410");
      if (row.file.includes("/freelancer/")) {
        expect(source, row.file).toContain("FREELANCER_SATELLITE_GONE");
      } else {
        expect(source, row.file).toContain("ACADEMY_STUDIO_GONE");
      }
    }

    const gone = readFileSync(join(root, "app/api/_gone/[...path]/route.ts"), "utf8");
    expect(gone).toContain("frozenRoomGone");
    expect(gone).not.toContain("closedSurfaceGone");
  });
});

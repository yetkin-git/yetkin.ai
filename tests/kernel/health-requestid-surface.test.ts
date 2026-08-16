import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("health ve gözlem yüzeyi", () => {
  it("health rotası phase: 11 taşımaz; Prisma ping ve 503 basar", () => {
    const route = readSrc("app/api/(kernel)/health/route.ts");
    const probe = readSrc("lib/kernel/health/probe.ts");
    expect(route).not.toContain('phase: "11"');
    expect(route).not.toContain("phase");
    expect(probe).not.toContain('phase: "11"');
    expect(probe).toContain("SELECT 1");
    expect(probe).toContain("503");
    expect(probe).toContain("HEALTH_PROBE");
    expect(probe).toContain('"readiness"');
    expect(route).toContain("pingPrisma");
    expect(route).toContain("resolveRequestId");
  });

  it("nakit ve kritik mutasyon yolları requestId + logEvent taşır", () => {
    const files = [
      "app/api/(kernel)/wallet/top-up/route.ts",
      "app/api/(kernel)/payments/webhooks/paytr/route.ts",
      "app/api/studio/generate/route.ts",
      "app/api/studio/images/route.ts",
      "app/api/academy/courses/[id]/purchase/route.ts",
      "app/api/freelancer/jobs/[id]/accept/route.ts",
      "lib/kernel/jobs/inngest.ts",
    ];
    for (const file of files) {
      const source = readSrc(file);
      expect(source, file).toContain("logEvent");
      expect(source, file).toMatch(/requestId/);
    }
  });
});

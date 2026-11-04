import { readFileSync } from "node:fs";
import { RAIL_V1_HOPS_META } from "@yetkin/kernel/http/v1-hops-meta";
import { dronOnboardingCanonicalPath } from "@yetkin/kernel/http/dron-onboarding-hops";
import { describe, expect, it } from "vitest";
import { planDronScaffold } from "../../scripts/dron-new-lib";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function byPath(files: { path: string; contents: string }[], path: string): string {
  const file = files.find((item) => item.path === path);
  if (!file) {
    throw new Error(path);
  }
  return file.contents;
}

describe("dron:new planı", () => {
  const files = planDronScaffold({
    id: "ornek-kapali",
    kayitSource: read("lib/dronlar/kayit.ts"),
    onboardingSource: read("packages/kernel/src/http/dron-onboarding-hops.ts"),
    envExampleSource: read(".env.example"),
    runbookSource: read(".system_docs/OPS_RUNBOOK.md"),
    opsDronSource: read(".system_docs/ops/ops-dron.md"),
    hopCount: RAIL_V1_HOPS_META.length,
  });

  it("kayıt satırını kapalı ve vitrin hükmüyle ekler", () => {
    const kayit = byPath(files, "lib/dronlar/kayit.ts");
    expect(kayit).toContain('id: "ornek-kapali"');
    expect(kayit).toContain('hops: ["ornek-kapali-pulse"]');
    expect(kayit).toContain("kapali: true");
    expect(kayit).toContain("vitrin: true");
    expect(kayit).toContain('bayrakEnv: "DRON_ORNEK_KAPALI_OPEN"');
    expect(kayit).toContain("export const VERTICAL_ROOMS = DRON_KAYIT.filter");
    expect(kayit).not.toContain("ORNEK_VITRIN");
  });

  it("taslak şema, hop ve Expo kabuğunu SSOT üzerinden kurar", () => {
    const schema = byPath(files, "prisma/schema/ornek-kapali.prisma");
    expect(schema).toContain("model OrnekKapaliPulse");
    expect(schema).toContain('@@map("ornek_kapali_pulse")');
    expect(schema).not.toContain("@relation");
    expect(schema).toContain("Çekirdek");

    const hop = byPath(files, "packages/kernel/src/http/onboarding/ornek-kapali-hop.ts");
    expect(hop).toContain('v1PathTemplate: "/api/v1/ornek-kapali/pulse"');
    expect(hop).not.toContain("dronForbidden:");
    expect(dronOnboardingCanonicalPath("ornek-kapali-pulse")).toBe("/api/ornek-kapali/pulse");

    const roomSchema = byPath(files, "packages/kernel/src/http/onboarding/ornek-kapali-schema.ts");
    expect(roomSchema).toContain('z.literal("ornek-kapali")');

    const registry = byPath(files, "packages/kernel/src/http/dron-onboarding-hops.ts");
    expect(registry).toContain('from "./onboarding/ornek-kapali-hop"');
    expect(registry).toContain("ornekKapaliPulseHop,");

    const app = byPath(files, "apps/ornek-kapali/App.tsx");
    expect(app).toContain("EXPO_PUBLIC_DRON_ORNEK_KAPALI_OPEN");
    expect(app).toContain("Oda kapalı");
    expect(app).toContain("RAIL_V1_HOPS_META");
    expect(app).not.toContain("fetch(");

    const pkg = byPath(files, "apps/ornek-kapali/package.json");
    expect(pkg).toContain('"typecheck": "tsc --noEmit"');
    expect(pkg).toContain('"@yetkin/kernel"');

    const route = byPath(files, "app/api/ornek-kapali/pulse/route.ts");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("DronBayrakları.isKapali");

    expect(byPath(files, ".env.example")).toContain('DRON_ORNEK_KAPALI_OPEN="false"');
    const nextCount = `**${RAIL_V1_HOPS_META.length + 1} kayıt**`;
    expect(byPath(files, ".system_docs/OPS_RUNBOOK.md")).toContain(nextCount);
    expect(byPath(files, ".system_docs/ops/ops-dron.md")).toContain(nextCount);
  });

  it("kayıtlı ve donmuş id’yi reddeder", () => {
    const base = {
      kayitSource: read("lib/dronlar/kayit.ts"),
      onboardingSource: read("packages/kernel/src/http/dron-onboarding-hops.ts"),
      envExampleSource: read(".env.example"),
      runbookSource: read(".system_docs/OPS_RUNBOOK.md"),
      opsDronSource: read(".system_docs/ops/ops-dron.md"),
      hopCount: RAIL_V1_HOPS_META.length,
    };
    expect(() => planDronScaffold({ ...base, id: "academy" })).toThrow(/zaten kayıtlı/);
    expect(() => planDronScaffold({ ...base, id: "studio" })).toThrow(/donmuş/);
  });
});

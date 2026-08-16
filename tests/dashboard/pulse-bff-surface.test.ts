import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assembleDashboardPulse,
  DASHBOARD_PULSE_PATH,
  DASHBOARD_PULSE_ROOMS,
  EMPTY_DASHBOARD_PULSE,
  withLiveFlag,
} from "@/lib/dashboard/pulse";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const COCKPIT_WIDGETS = [
  "components/dashboard/wallet-balance-strip.tsx",
  "components/dashboard/freelancer-pulse-widget.tsx",
  "components/dashboard/academy-pulse-widget.tsx",
  "components/dashboard/career-pulse-widget.tsx",
  "components/dashboard/studio-pulse-widget.tsx",
  "components/dashboard/kurumsal-pulse-widget.tsx",
  "components/dashboard/arena-pulse-widget.tsx",
  "components/dashboard/devlabs-pulse-widget.tsx",
  "components/dashboard/pazaryeri-pulse-widget.tsx",
  "components/dashboard/hibe-pulse-widget.tsx",
  "components/dashboard/junior-pulse-widget.tsx",
  "components/dashboard/social-pulse-widget.tsx",
];

const ROOM_PULSE_PATHS = [
  "/api/dashboard/wallet-strip",
  "/api/dashboard/freelancer-pulse",
  "/api/academy/pulse",
  "/api/career/pulse",
  "/api/studio/pulse",
  "/api/kurumsal/pulse",
  "/api/arena/pulse",
  "/api/devlabs/pulse",
  "/api/pazaryeri/pulse",
  "/api/hibe/pulse",
  "/api/junior/pulse",
  "/api/social/pulse",
];

describe("Dashboard Pulse BFF yüzeyi", () => {
  it("boş nabız 12 dilimi live:false taşır; withLiveFlag live basar", () => {
    expect(DASHBOARD_PULSE_ROOMS).toHaveLength(12);
    expect(DASHBOARD_PULSE_PATH).toBe("/api/dashboard/pulse");
    for (const room of DASHBOARD_PULSE_ROOMS) {
      expect(EMPTY_DASHBOARD_PULSE[room].live).toBe(false);
    }
    const live = withLiveFlag({ visaCount: 1 });
    expect(live.live).toBe(true);
    expect(live.visaCount).toBe(1);
    const assembled = assembleDashboardPulse(EMPTY_DASHBOARD_PULSE);
    expect(assembled.career.lastVisaTitle).toBeNull();
    expect(assembled.wallet.amountMinor).toBe(0);
  });

  it("BFF rotası session kind, force-dynamic, no-store; composition API kökündedir", () => {
    const route = readSrc("app/api/dashboard/pulse/route.ts");
    const load = readSrc("app/api/dashboard/pulse/load.ts");
    const pulse = readSrc("lib/dashboard/pulse.ts");

    expect(route).toContain('export const auth = "session"');
    expect(route).toContain('export const dynamic = "force-dynamic"');
    expect(route).toContain("private, no-store");
    expect(route).toContain("loadDashboardPulse");
    expect(route).toContain("requireSession");
    expect(route).not.toContain("createPrismaFreelancerPorts");

    expect(load).toContain("createPrismaFreelancerPorts");
    expect(load).toContain("createPrismaCareerPorts");
    expect(load).toContain("Promise.all");
    expect(load).toContain("dashboard.pulse.room_failed");
    expect(load).toContain("Composition root");
    expect(load).not.toContain("@/lib/kernel/modules");

    expect(pulse).not.toContain("/runtime");
    expect(pulse).not.toContain("prisma-store");
    expect(pulse).not.toContain("/engine");
    expect(pulse).not.toContain("getPrisma");
    expect(pulse).toContain("Kernel bu yolu import etmez");
  });

  it("kokpit widget'ları oda pulse uçlarını çağırmaz; tek BFF provider okur", () => {
    const provider = readSrc("components/dashboard/dashboard-pulse-provider.tsx");
    const page = readSrc("app/dashboard/page.tsx");
    const header = readSrc("components/shell/header-wallet-chip.tsx");

    expect(provider).toContain("DASHBOARD_PULSE_PATH");
    expect(provider).toContain("fetch(");
    expect(page).toContain("DashboardPulseProvider");
    expect(header).toContain("/api/dashboard/wallet-strip");

    for (const file of COCKPIT_WIDGETS) {
      const source = readSrc(file);
      expect(source, file).toContain("useDashboardPulse");
      expect(source, file).not.toContain("fetch(");
      expect(source, file).not.toContain("useEffect");
      for (const path of ROOM_PULSE_PATHS) {
        expect(source, `${file} → ${path}`).not.toContain(path);
      }
    }
  });

  it("lib/kernel dashboard pulse import etmez; BFF yazma ucu değildir", () => {
    const route = readSrc("app/api/dashboard/pulse/route.ts");
    expect(route).not.toContain("export async function POST");
    expect(route).not.toContain("export async function PATCH");
    const kernelAuth = readSrc("lib/kernel/auth/session.ts");
    expect(kernelAuth).not.toContain("@/lib/dashboard");
    expect(kernelAuth).not.toContain("/api/dashboard/pulse");
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DASHBOARD_PULSE_LOAD_BUDGET_MS,
  DASHBOARD_PULSE_ROOM_CONCURRENCY,
  DASHBOARD_PULSE_ROOM_TIMEOUT_MS,
  dashboardPulseRoomConcurrency,
  dashboardPulseRoomTimeoutMs,
} from "@/app/api/dashboard/pulse/load";
import {
  assembleDashboardPulse,
  DASHBOARD_PULSE_PATH,
  DASHBOARD_PULSE_ROOMS,
  EMPTY_DASHBOARD_PULSE,
  WORKING_DASHBOARD_PULSE_ROOMS,
  withLiveFlag,
} from "@/lib/dashboard/pulse";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const COCKPIT_WIDGETS = [
  "components/dashboard/freelancer-pulse-widget.tsx",
  "components/dashboard/academy-pulse-widget.tsx",
  "components/dashboard/career-pulse-widget.tsx",
];

const ROOM_PULSE_PATHS = [
  "/api/dashboard/wallet-strip",
  "/api/academy/pulse",
  "/api/career/pulse",
];

describe("Dashboard Pulse BFF yüzeyi", () => {
  it("boş nabız 4 dilimi live:false taşır; withLiveFlag live basar", () => {
    expect(DASHBOARD_PULSE_ROOMS).toHaveLength(4);
    expect(WORKING_DASHBOARD_PULSE_ROOMS).toEqual(["wallet", "freelancer", "academy", "career"]);
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

  it("oda bütçesi uzun süreçte 8s, Vercel'de 2s; serverless eşzamanlılık 1", () => {
    expect(DASHBOARD_PULSE_ROOM_TIMEOUT_MS).toBe(2_000);
    expect(DASHBOARD_PULSE_ROOM_CONCURRENCY).toBe(4);
    expect(DASHBOARD_PULSE_LOAD_BUDGET_MS).toBe(12_000);
    expect(dashboardPulseRoomTimeoutMs({ NODE_ENV: "development" })).toBe(8_000);
    expect(dashboardPulseRoomTimeoutMs({ NODE_ENV: "production" })).toBe(8_000);
    expect(dashboardPulseRoomTimeoutMs({ VERCEL: "1", NODE_ENV: "production" })).toBe(2_000);
    expect(dashboardPulseRoomConcurrency({ NODE_ENV: "development" })).toBe(4);
    expect(dashboardPulseRoomConcurrency({ VERCEL: "1" })).toBe(1);
  });

  it("BFF rotası session kind, force-dynamic, no-store; composition API kökündedir", async () => {
    const route = readSrc("app/api/dashboard/pulse/route.ts");
    const load = readSrc("app/api/dashboard/pulse/load.ts");
    const pulse = readSrc("lib/dashboard/pulse.ts");

    expect(route).toContain('export const auth = "session"');
    expect(route).toContain('export const dynamic = "force-dynamic"');
    expect(route).toContain("private, no-store");
    expect(route).toContain("loadDashboardPulse");
    expect(route).toContain("requireSession");
    expect(route).toContain("isPrismaClientError");
    expect(route).toContain('error.name.startsWith("PrismaClient")');
    expect(route).toContain("emptyDashboardPulse");
    expect(route).not.toContain("createPrismaFreelancerPorts");

    expect(load).toContain("createPrismaFreelancerPorts");
    expect(load).toContain("loadCareerLivePulse");
    expect(load).toContain("createPrismaAcademyPorts");
    expect(load).toContain("Promise.allSettled");
    expect(load).not.toMatch(/await Promise\.all\(/);
    expect(load).toContain("DASHBOARD_PULSE_ROOM_TIMEOUT_MS");
    expect(load).toContain("DASHBOARD_PULSE_ROOM_CONCURRENCY");
    expect(load).toContain("DASHBOARD_PULSE_LOAD_BUDGET_MS");
    expect(load).toContain("dashboardPulseRoomTimeoutMs");
    expect(load).toContain("dashboardPulseRoomConcurrency");
    expect(load).toContain("kernelBackgroundReadTimeoutMs");
    expect(load).toContain("withFailEarlyDbRead");
    expect(load).toContain("dashboard.pulse.room_failed");
    expect(load).toContain("Composition root");
    expect(load).toContain("ensurePrismaQueryEngine");
    expect(load).toContain("await ensurePrismaQueryEngine()");
    expect(load).not.toContain("void ensurePrismaQueryEngine");
    expect(load).toContain("if (!engineReady)");
    expect(load).toContain("EMPTY_DASHBOARD_PULSE");
    expect(load).toContain("readWalletStripSnapshot");
    expect(load).not.toContain("ensureSettlementWallet");
    expect(load).toContain("prismaErrorLabel");
    expect(load).toContain("cache(");
    expect(load).toContain("pulseInflight");
    expect(route).toContain("maxDuration");
    const db = readSrc("lib/kernel/db.ts");
    expect(db).toContain("refreshPrismaConnection");
    expect(db).toContain("isPrismaEngineEnoent");
    expect(db).toContain("prisma.engine.warmup_failed");
    expect(db).toContain("prisma.engine.warmup_pending");
    expect(db).toContain("prisma.engine.warmup_recover");
    expect(db).toContain("PRISMA_WARMUP_CIRCUIT_MS");
    expect(db).toContain("Promise<boolean>");
    expect(db).toContain("ENOENT");
    expect(load).not.toContain("@/lib/kernel/modules");
    expect(load).not.toContain("createPrismaStudioPorts");
    expect(load).not.toContain("createPrismaKurumsalPorts");
    expect(load).not.toContain("createPrismaArenaPorts");
    expect(load).not.toContain("createPrismaDevLabsPorts");
    expect(load).not.toContain("createPrismaPazaryeriPorts");
    expect(load).not.toContain("createPrismaHibePorts");
    expect(load).not.toContain("createPrismaJuniorPorts");
    expect(load).not.toContain("createPrismaSocialPorts");

    expect(pulse).not.toContain("studio-pulse");
    expect(pulse).not.toContain("junior-pulse");
    expect(pulse).not.toContain("hibe-pulse");
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
    const shell = readSrc("components/shell/app-shell.tsx");
    const shellHub = readSrc("components/shell/app-shell-user-hub.tsx");
    const freelancerWidget = readSrc("components/dashboard/freelancer-pulse-widget.tsx");

    expect(provider).toContain("DASHBOARD_PULSE_PATH");
    expect(provider).toContain("fetch(");
    expect(provider).toContain("initialPulse");
    expect(provider).toContain("hydratedFromServer");
    expect(page).toContain("DashboardPulseProvider");
    expect(page).toContain("initialPulse");
    expect(page).toContain("loadDashboardPulse");
    expect(page).toContain("maxDuration");
    expect(page).not.toContain("FrozenRoomBanner");
    expect(page).not.toContain("studio-pulse");
    expect(shell).not.toContain("FrozenRoomBanner");
    expect(header).not.toContain("/api/dashboard/wallet-strip");
    expect(header).not.toContain("fetch(");
    expect(header).not.toContain("useEffect");
    expect(shellHub).toContain("readWalletStripSnapshot");
    expect(freelancerWidget).toContain('pulse.live ? pulse.openJobsPosted : "—"');
    expect(freelancerWidget).toContain('pulse.live');
    expect(freelancerWidget).toContain('"—"');

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

  it("wallet-strip oturum cüzdanını ham SELECT ile okur; Prisma SQL sızdırmaz", () => {
    const route = readSrc("app/api/dashboard/wallet-strip/route.ts");
    const loader = readSrc("lib/dashboard/load-wallet-strip.ts");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("readWalletStripSnapshot");
    expect(route).not.toContain("ensureSettlementWallet");
    expect(route).toContain("requireSession");
    expect(route).not.toContain("findUnique");
    expect(route).toContain("PrismaClient");
    expect(route).toContain("EMPTY_WALLET_STRIP");
    expect(route).toContain("jsonOk({ strip: EMPTY_WALLET_STRIP }");
    expect(route).toContain("AuthRequiredError");
    expect(route).not.toContain("jsonFail");
    expect(loader).toContain("readSettlementWallet");
    expect(loader).toContain("ensurePrismaQueryEngine");
    expect(loader).toContain("withDbReadTimeout");
    expect(loader).not.toContain("ensureSettlementWallet");
    expect(loader).not.toContain("findUnique");
    expect(loader).toContain("cache(");
  });
});

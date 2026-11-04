import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("CLEARED lisans alarmı yüzeyi", () => {
  it("on beş dakika Inngest'te, Hobby yedeği günde bir, dört valör girişi durur", () => {
    const scan = readSrc("app/api/(kernel)/jobs/license-gap-scan.ts");
    expect(scan).toContain('id: "license-gap-scan"');
    expect(scan).toContain("*/15 * * * *");
    expect(scan).toContain("runLicenseGapScan");
    const route = readSrc("app/api/(kernel)/jobs/inngest/route.ts");
    expect(route).toContain("licenseGapScan");
    const cron = readSrc("app/api/(kernel)/cron/license-gap/route.ts");
    expect(cron).toContain('export const auth = "cron"');
    expect(cron).toContain("runLicenseGapScan");
    expect(cron).toContain("15 3 * * *");
    expect(cron).not.toContain("*/15");
    const vercel = readSrc("vercel.json");
    expect(vercel).toContain('"/api/cron/license-gap"');
    expect(vercel).toContain('"15 3 * * *"');
    expect(vercel).not.toContain("*/15");
    expect(ROUTE_AUTH_MAP["/api/cron/license-gap"]).toBe("cron");
    const census = readSrc("lib/kernel/http/web-only-write-routes.ts");
    expect(census).toContain('"/api/cron/license-gap"');
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:audit-license-gap"]).toBe("tsx scripts/ops-audit-license-gap.ts");
    const cli = readSrc("scripts/ops-audit-license-gap.ts");
    expect(cli).toContain("evaluateClearedLicenseGaps");
    expect(cli).toContain("logLicenseGapScan");
    expect(cli).not.toContain("paymentAnomaly.create");
    expect(cli).not.toContain("appendLedgerEntry");
  });

  it("amaç dizgisi akademi ve junior köprüsüyle aynıdır; kernel odayı import etmez", () => {
    const gap = readSrc("lib/kernel/payments/license-gap.ts");
    expect(gap).toContain('ACADEMY_LICENSE_PURPOSE_PREFIX = "academy-license:"');
    expect(gap).toContain('JUNIOR_LICENSE_PURPOSE = "junior-license:yearly"');
    expect(gap).toContain('kind: "license_gap"');
    expect(gap).not.toContain("@/lib/academy");
    expect(gap).not.toContain("@/lib/junior");
    expect(readSrc("lib/academy/paytr-license-bridge.ts")).toContain('academy-license:"');
    expect(readSrc("lib/junior/paytr-license-bridge.ts")).toContain(
      'JUNIOR_LICENSE_ORDER_PURPOSE = "junior-license:yearly"',
    );
    expect(readSrc("lib/academy/license-gap-read.ts")).toContain("academyPurchase.findMany");
    expect(readSrc("lib/junior/license-gap-read.ts")).toContain("juniorSubscription.findMany");
    expect(readSrc("lib/kernel/payments/anomaly.ts")).toContain('"license_gap"');
  });

  it("doğrudan oturum havuz :6543 bırakmaz", () => {
    const holds = readSrc("scripts/ops-ghost-wallet-holds.ts");
    expect(holds).toContain("resolveHostedDirectSessionUrl");
    expect(holds).toContain("openDirectPgClient");
    expect(holds).not.toContain(":6543 / pooler) üzerinden çalışmaz");
    const migrate = readSrc("scripts/ops-migrate.ts");
    expect(migrate).toContain("toSupabaseDirectSessionUrl");
    expect(migrate).toContain(":6543 kullanılmadı");
    const direct = readSrc("scripts/ops-direct-session.ts");
    expect(direct).toContain("--apply");
    expect(direct).not.toContain("console.log(derived");
    expect(direct).not.toContain("console.log(raw");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:direct-session"]).toBe("tsx scripts/ops-direct-session.ts");
  });
});

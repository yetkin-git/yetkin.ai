import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  hasSiteMaintenanceBypass,
  isHealthProbePath,
  isLoopbackHostname,
  isSiteMaintenanceActive,
  isSiteMaintenanceApiPath,
  isSiteMaintenanceFlagOn,
  MAINTENANCE_BYPASS_COOKIE,
  MAINTENANCE_BYPASS_HEADER,
  renderSiteMaintenanceHtml,
  resolveRequestHostname,
  resolveSiteMaintenanceBypassSecret,
  shouldInterceptForSiteMaintenance,
  SITE_MAINTENANCE_API_ERROR,
  SITE_MAINTENANCE_COMPLIANCE_NOTE,
  SITE_MAINTENANCE_ENGLISH,
  SITE_MAINTENANCE_LEGAL_LINKS,
  SITE_MAINTENANCE_SUBTITLE,
  SITE_MAINTENANCE_TITLE,
  siteMaintenanceNextResponse,
} from "@/lib/kernel/http/site-maintenance";
import { LEGAL_ENTITY } from "@/lib/copy/legal-launch";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function request(path: string, origin = "http://localhost:3000", init?: { method?: string }) {
  return new NextRequest(new URL(path, origin), {
    method: init?.method,
  });
}

const PRODUCTION_ORIGIN = "https://yetkin.ai";

describe("canlı yayın bakım dondurması", () => {
  it("boolean kilit yoktur; anahtar env SITE_MAINTENANCE_FREEZE'dir", () => {
    const src = readSrc("lib/kernel/http/site-maintenance.ts");
    expect(src).not.toMatch(/export const SITE_MAINTENANCE_FREEZE\s*=/);
    expect(src).toContain("process.env.SITE_MAINTENANCE_FREEZE");
    expect(src).toContain("Müze `MAINTENANCE_MODE`");
  });

  it("bayrak yalnız true/1 ile açılır", () => {
    expect(isSiteMaintenanceFlagOn({})).toBe(false);
    expect(isSiteMaintenanceFlagOn({ SITE_MAINTENANCE_FREEZE: "" })).toBe(false);
    expect(isSiteMaintenanceFlagOn({ SITE_MAINTENANCE_FREEZE: "false" })).toBe(false);
    expect(isSiteMaintenanceFlagOn({ SITE_MAINTENANCE_FREEZE: "true" })).toBe(true);
    expect(isSiteMaintenanceFlagOn({ SITE_MAINTENANCE_FREEZE: "1" })).toBe(true);
    expect(isSiteMaintenanceFlagOn({ SITE_MAINTENANCE_FREEZE: " TRUE " })).toBe(true);
  });

  it("Vitest altında kenar mühür testleri donmayı görmez", () => {
    expect(
      isSiteMaintenanceActive(
        { VITEST: "true", SITE_MAINTENANCE_FREEZE: "true", NODE_ENV: "production" },
        "yetkin.ai",
      ),
    ).toBe(false);
  });

  it("development ve localhost env açık olsa da donmaz", () => {
    expect(
      isSiteMaintenanceActive(
        { SITE_MAINTENANCE_FREEZE: "true", NODE_ENV: "development", VITEST: "false" },
        "yetkin.ai",
      ),
    ).toBe(false);
    expect(
      isSiteMaintenanceActive(
        { SITE_MAINTENANCE_FREEZE: "true", NODE_ENV: "production", VITEST: "false" },
        "localhost",
      ),
    ).toBe(false);
    expect(
      isSiteMaintenanceActive(
        { SITE_MAINTENANCE_FREEZE: "1", NODE_ENV: "test", VITEST: "false" },
        "127.0.0.1",
      ),
    ).toBe(false);
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("[::1]")).toBe(true);
    expect(isLoopbackHostname("yetkin.ai")).toBe(false);
  });

  it("üretim hostunda env true iken donar", () => {
    expect(
      isSiteMaintenanceActive(
        { SITE_MAINTENANCE_FREEZE: "true", NODE_ENV: "production", VITEST: "false" },
        "yetkin.ai",
      ),
    ).toBe(true);
    expect(
      isSiteMaintenanceActive(
        { SITE_MAINTENANCE_FREEZE: undefined, NODE_ENV: "production", VITEST: "false" },
        "yetkin.ai",
      ),
    ).toBe(false);
  });

  it("yalnız health ve live probe geçer", () => {
    expect(isHealthProbePath("/api/health")).toBe(true);
    expect(isHealthProbePath("/api/health/")).toBe(true);
    expect(isHealthProbePath("/api/v1/health")).toBe(true);
    expect(isHealthProbePath("/api/health/live")).toBe(true);
    expect(isHealthProbePath("/api/v1/health/live")).toBe(true);
    expect(isHealthProbePath("/api/health/other")).toBe(false);
    expect(isHealthProbePath("/")).toBe(false);
    expect(isHealthProbePath("/login")).toBe(false);
    expect(isHealthProbePath("/api/dashboard/pulse")).toBe(false);
  });

  it("API yollarını JSON 503, sayfaları HTML 503 olarak ayırır", () => {
    expect(isSiteMaintenanceApiPath("/api/dashboard/pulse")).toBe(true);
    expect(isSiteMaintenanceApiPath("/api/v1/academy/courses")).toBe(true);
    expect(isSiteMaintenanceApiPath("/")).toBe(false);
    expect(isSiteMaintenanceApiPath("/academy")).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/", true)).toBe(true);
    expect(shouldInterceptForSiteMaintenance("/api/health", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/legal", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/legal/gizlilik", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/iletisim", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/robots.txt", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/sitemap.xml", true)).toBe(false);
    expect(shouldInterceptForSiteMaintenance("/login", false)).toBe(false);
  });

  it("bakım HTML'i sade başlık ve noindex taşır", () => {
    const html = renderSiteMaintenanceHtml();
    expect(html).toContain(SITE_MAINTENANCE_TITLE);
    expect(html).toContain(SITE_MAINTENANCE_SUBTITLE);
    expect(html).toContain(SITE_MAINTENANCE_ENGLISH);
    expect(html).toContain("yetkin.ai");
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).toContain("Canlı yayın duraklatıldı");
  });

  it("bakım HTML'i PayTR inceleme yüzeyini basar: yasal linkler + künye", () => {
    const html = renderSiteMaintenanceHtml();
    expect(html).toContain(SITE_MAINTENANCE_COMPLIANCE_NOTE);
    expect(SITE_MAINTENANCE_COMPLIANCE_NOTE).toBe(
      "PayTR ve Yasal İncelemeler İçin Alt Servisler Aktiftir",
    );
    // İnceleme linkleri — isPublicCompliancePath muafiyeti ile hizalı; çerez dahil.
    expect(SITE_MAINTENANCE_LEGAL_LINKS.map((link) => link.href)).toEqual([
      "/legal/gizlilik",
      "/legal/cerez",
      "/legal/kullanim",
      "/legal/mesafeli-satis",
      "/legal/iade",
      "/iletisim",
    ]);
    for (const link of SITE_MAINTENANCE_LEGAL_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
      expect(shouldInterceptForSiteMaintenance(link.href, true)).toBe(false);
    }
    // Şirket künyesi SSOT'tan basılır.
    expect(html).toContain(LEGAL_ENTITY.tradeName);
    expect(html).toContain(`VKN ${LEGAL_ENTITY.vkn}`);
    expect(html).toContain(`MERSİS ${LEGAL_ENTITY.mersis}`);
    expect(html).toContain(LEGAL_ENTITY.address);
  });

  it("proxy.ts health ve yasal yüzey hariç erken 503 basar", () => {
    const proxySrc = readSrc("proxy.ts");
    expect(proxySrc).toContain("isSiteMaintenanceActive");
    expect(proxySrc).toContain("shouldInterceptForSiteMaintenance");
    expect(proxySrc).toContain("siteMaintenanceNextResponse");
    expect(proxySrc).toContain("SITE_MAINTENANCE_FREEZE");
    expect(proxySrc).not.toContain("MAINTENANCE_MODE");
  });
});

describe("proxy bakım 503 (donma env açık, üretim host)", () => {
  beforeEach(() => {
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_MAINTENANCE_FREEZE", "true");
    vi.stubEnv("SUPABASE_JWT_SECRET", "rail-edge-jwt-test-secret-32bytes-min");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://edge-test.supabase.co");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("kamu sayfasına HTML 503 basar", async () => {
    const response = await proxy(request("/", PRODUCTION_ORIGIN));
    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("retry-after")).toBe("3600");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const html = await response.text();
    expect(html).toContain(SITE_MAINTENANCE_TITLE);
    expect(html).toContain(SITE_MAINTENANCE_SUBTITLE);
    expect(html).toContain(SITE_MAINTENANCE_ENGLISH);
  });

  it("API'ye v1 zarf 503 basar", async () => {
    const response = await proxy(request("/api/dashboard/pulse", PRODUCTION_ORIGIN));
    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok: boolean; error: string; data: null };
    expect(body).toMatchObject({
      ok: false,
      error: SITE_MAINTENANCE_API_ERROR,
      apiVersion: "1",
      data: null,
    });
  });

  it("GET /api/health ve /api/health/live donmayı geçer", async () => {
    const health = await proxy(request("/api/health", PRODUCTION_ORIGIN));
    expect(health.status).toBe(200);
    const live = await proxy(request("/api/health/live", PRODUCTION_ORIGIN));
    expect(live.status).toBe(200);
  });

  it("yasal sayfalar, iletişim, robots ve sitemap freeze açıkken 503 almaz", async () => {
    for (const path of ["/legal", "/legal/gizlilik", "/legal/iade", "/iletisim", "/robots.txt", "/sitemap.xml", "/api/payments/webhooks/paytr", "/api/paytr/callback"]) {
      const response = await proxy(request(path, PRODUCTION_ORIGIN));
      expect(response.status, path).not.toBe(503);
    }
  });

  it("header veya cookie ile bakım modu bypass edilir", async () => {
    vi.stubEnv("SITE_MAINTENANCE_BYPASS_TOKEN", "secret-ops-token");
    const bypassedReq = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { "x-yetkin-maintenance-bypass": "secret-ops-token" },
    });
    const response = await proxy(bypassedReq);
    expect(response.status).not.toBe(503);

    const cookieReq = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { cookie: "yetkin_maintenance_bypass=secret-ops-token" },
    });
    const cookieResp = await proxy(cookieReq);
    expect(cookieResp.status).not.toBe(503);
  });

  it("sır yokken header veya cookie bypass etmez (fail-closed)", async () => {
    vi.stubEnv("SITE_MAINTENANCE_BYPASS_TOKEN", "");
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", "");
    const headerReq = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { "x-yetkin-maintenance-bypass": "anything-nonzero" },
    });
    expect((await proxy(headerReq)).status).toBe(503);

    const cookieReq = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { cookie: "yetkin_maintenance_bypass=anything-nonzero" },
    });
    expect((await proxy(cookieReq)).status).toBe(503);
  });

  it("SUPER_ADMIN_USER_ID tek başına bypass sırrı değildir", async () => {
    vi.stubEnv("SITE_MAINTENANCE_BYPASS_TOKEN", "");
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", "");
    vi.stubEnv("SUPER_ADMIN_USER_ID", "11111111-1111-4111-8111-111111111111");
    const req = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { "x-yetkin-maintenance-bypass": "11111111-1111-4111-8111-111111111111" },
    });
    expect((await proxy(req)).status).toBe(503);
  });

  it("yanlış token ile bypass açılmaz", async () => {
    vi.stubEnv("SITE_MAINTENANCE_BYPASS_TOKEN", "secret-ops-token");
    const req = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { "x-yetkin-maintenance-bypass": "wrong-token" },
    });
    expect((await proxy(req)).status).toBe(503);
  });

  it("localhost ve /career donmayı görmez", async () => {
    const home = await proxy(request("/"));
    expect(home.status).not.toBe(503);
    const career = await proxy(request("/career"));
    expect(career.status).not.toBe(503);
  });
});

describe("hasSiteMaintenanceBypass fail-closed", () => {
  it("sır boşken dolu header/cookie false döner", () => {
    const req = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { [MAINTENANCE_BYPASS_HEADER]: "guess" },
    });
    expect(resolveSiteMaintenanceBypassSecret({})).toBe("");
    expect(hasSiteMaintenanceBypass(req, {})).toBe(false);
    expect(
      hasSiteMaintenanceBypass(req, { SUPER_ADMIN_USER_ID: "11111111-1111-4111-8111-111111111111" } as never),
    ).toBe(false);
  });

  it("yalnız tanımlı sır eşitliğinde true döner", () => {
    const env = { SITE_MAINTENANCE_BYPASS_TOKEN: "ops-secret" };
    const hit = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { [MAINTENANCE_BYPASS_HEADER]: "ops-secret" },
    });
    const miss = new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
      headers: { [MAINTENANCE_BYPASS_HEADER]: "nope" },
    });
    expect(hasSiteMaintenanceBypass(hit, env)).toBe(true);
    expect(hasSiteMaintenanceBypass(miss, env)).toBe(false);
    expect(
      hasSiteMaintenanceBypass(
        new NextRequest(new URL("/", PRODUCTION_ORIGIN), {
          headers: { cookie: `${MAINTENANCE_BYPASS_COOKIE}=ops-secret` },
        }),
        env,
      ),
    ).toBe(true);
  });

  it("kaynak SUPER_ADMIN_USER_ID okumaz", () => {
    const src = readSrc("lib/kernel/http/site-maintenance.ts");
    expect(src).not.toContain("env.SUPER_ADMIN_USER_ID");
    expect(src).toContain("fail-closed");
    expect(src).toContain("resolveSiteMaintenanceBypassSecret");
  });
});

describe("siteMaintenanceNextResponse", () => {
  it("sayfa HTML, API JSON üretir", async () => {
    const page = siteMaintenanceNextResponse(request("/career"), "/career");
    expect(page.status).toBe(503);
    expect(await page.text()).toContain(SITE_MAINTENANCE_TITLE);

    const api = siteMaintenanceNextResponse(request("/api/wallet/top-up"), "/api/wallet/top-up");
    expect(api.status).toBe(503);
    const body = (await api.json()) as { error: string };
    expect(body.error).toBe(SITE_MAINTENANCE_API_ERROR);
  });

  it("istek hostunu loopback olarak çözer", () => {
    expect(resolveRequestHostname(request("/career"))).toBe("localhost");
    expect(resolveRequestHostname(request("/career", PRODUCTION_ORIGIN))).toBe("yetkin.ai");
  });
});

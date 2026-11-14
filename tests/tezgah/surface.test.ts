import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PAGE_SEO, isRobotsDisallowedPath, sitemapRoutePolicy } from "@/lib/copy/seo";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { DronBayrakları } from "@/lib/dronlar/kayit";
import { isSafeAuthNextPath } from "@/lib/kernel/auth/redirects";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";
import { findPublishedHopId } from "@/lib/kernel/http/api-route-census";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { TEZGAH_TOOLS, tezgahQuotaLine } from "@/lib/tezgah/catalog";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("AI Tezgâh kamu yüzeyi", () => {
  it("oda açıktır, giriş istemez ve 410 yemez", () => {
    expect(DronBayrakları.isKapali("tezgah")).toBe(false);
    expect(DronBayrakları.kayit("tezgah")?.path).toBe("/tezgah");
    expect(DronBayrakları.kayit("tezgah")?.label).toBe("AI Tezgâh");
    expect(DronBayrakları.kayit("tezgah")?.vitrin).toBe(false);
    expect(isFrozenShellPagePath("/tezgah")).toBe(false);
    expect(isProtectedCitizenPath("/tezgah")).toBe(false);
    expect(isSafeAuthNextPath("/tezgah")).toBe(true);
  });

  it("sol menüde en üstte durur ve ana sayfa ikincil CTA verir", () => {
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    const tezgahSlot = nav.indexOf("...tezgahFirst.map");
    const verticalSlot = nav.indexOf("...VERTICAL_ROOMS.filter");
    expect(tezgahSlot).toBeGreaterThan(-1);
    expect(verticalSlot).toBeGreaterThan(tezgahSlot);
    const page = readSrc("app/(public)/page.tsx");
    expect(page).toContain('href="/tezgah"');
    expect(page).toContain("copy.tezgahCta");
    expect(SEN_VOICE.public.home.tezgahCta).toBe("AI Tezgâhını Dene");
    expect(SEN_VOICE.public.home.chain[0]).toMatchObject({ href: "/tezgah" });
  });

  it("site haritası ve meta tezgâhı indeksler", () => {
    expect(PAGE_SEO.tezgah.path).toBe("/tezgah");
    expect(PAGE_SEO.tezgah.description.length).toBeLessThanOrEqual(160);
    expect(isRobotsDisallowedPath("/tezgah")).toBe(false);
    expect(sitemapRoutePolicy("/tezgah")).toEqual({ changeFrequency: "weekly", priority: 0.9 });
    expect(readSrc("app/tezgah/page.tsx")).toContain("PAGE_SEO.tezgah");
  });

  it("üretim rotası public web-only'dir; v1 hop ve cüzdan yazımı yoktur", () => {
    expect(ROUTE_AUTH_MAP["/api/tezgah/generate"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/quota"]).toBe("public");
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/generate")).toBe(
      true,
    );
    expect(findPublishedHopId("POST", "/api/tezgah/generate")).toBeNull();
    expect(findPublishedHopId("GET", "/api/tezgah/quota")).toBeNull();
    const engine = readSrc("lib/tezgah/engine.ts");
    expect(engine).toContain("recordUsage: false");
    expect(engine).toContain("TEZGAH_MAX_OUTPUT_TOKENS");
    expect(engine).not.toContain("getPrisma");
    expect(engine).not.toContain("Wallet");
    expect(engine).not.toContain("amountMinor");
    expect(engine).not.toContain("yetkinhibe");
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("Çıktıyı Üret");
    expect(workbench).toContain("Tek Tıkla Kopyala");
    expect(workbench).toContain(".md İndir");
    expect(workbench).toContain(".txt İndir");
    expect(workbench).toContain("TEZGAH_GUEST_QUOTA_MESSAGE");
    expect(readSrc("lib/tezgah/catalog.ts")).toContain(
      "Günde 3 ücretsiz üretim hakkı için ücretsiz kayıt ol",
    );
    expect(tezgahQuotaLine(2, 3)).toBe("Bugünkü ücretsiz hakkınız: 2 / 3");
    expect(TEZGAH_TOOLS.map((tool) => tool.cta.href)).toEqual([
      "/academy/02_ecommerce_ai",
      "/academy/01_office_ai/seviye",
      "/academy",
    ]);
  });
});

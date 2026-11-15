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
import { isLlmMutationPath } from "@/lib/kernel/security/http-rate-limit";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { TEZGAH_TOOLS, tezgahQuotaLine } from "@/lib/tezgah/catalog";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";

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
    expect(ROUTE_AUTH_MAP["/api/tezgah/grant/generate"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/quota"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/tetkik/generate"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/dukkan/generate"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/reklam/generate"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/tezgah/pazaryeri/generate"]).toBe("public");
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/generate")).toBe(
      true,
    );
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/grant/generate"),
    ).toBe(true);
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/tetkik/generate"),
    ).toBe(true);
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/dukkan/generate"),
    ).toBe(true);
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/reklam/generate"),
    ).toBe(true);
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/pazaryeri/generate"),
    ).toBe(true);
    expect(findPublishedHopId("POST", "/api/tezgah/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/grant/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/tetkik/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/dukkan/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/reklam/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/pazaryeri/generate")).toBeNull();
    expect(findPublishedHopId("GET", "/api/tezgah/quota")).toBeNull();
    expect(isLlmMutationPath("/api/tezgah/grant/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/tetkik/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/dukkan/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/reklam/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/pazaryeri/generate")).toBe(true);
    const engine = readSrc("lib/tezgah/engine.ts");
    expect(engine).toContain("recordUsage: false");
    expect(engine).toContain("TEZGAH_MAX_OUTPUT_TOKENS");
    expect(engine).not.toContain("getPrisma");
    expect(engine).not.toContain("Wallet");
    expect(engine).not.toContain("amountMinor");
    expect(engine).not.toContain("yetkinhibe");
    const tetkikEngine = readSrc("lib/tezgah/tetkik/engine.ts");
    expect(tetkikEngine).toContain("recordUsage: false");
    expect(tetkikEngine).toContain("TETKIK_MAX_OUTPUT_TOKENS");
    expect(tetkikEngine).not.toContain("getPrisma");
    expect(tetkikEngine).not.toContain("amountMinor");
    const dukkanEngine = readSrc("lib/tezgah/dukkan/engine.ts");
    expect(dukkanEngine).not.toContain("invokeLlm");
    expect(dukkanEngine).not.toContain("getPrisma");
    expect(dukkanEngine).not.toContain("amountMinor");
    expect(dukkanEngine).toContain("refundTezgahQuota");
    const reklamEngine = readSrc("lib/tezgah/reklam/engine.ts");
    expect(reklamEngine).toContain("recordUsage: false");
    expect(reklamEngine).toContain("REKLAM_MAX_OUTPUT_TOKENS");
    expect(reklamEngine).toContain("refundTezgahQuota");
    expect(reklamEngine).not.toContain("getPrisma");
    expect(reklamEngine).not.toContain("amountMinor");
    const pazaryeriEngine = readSrc("lib/tezgah/pazaryeri/engine.ts");
    expect(pazaryeriEngine).toContain("recordUsage: false");
    expect(pazaryeriEngine).toContain("PAZARYERI_MAX_OUTPUT_TOKENS");
    expect(pazaryeriEngine).toContain("refundTezgahQuota");
    expect(pazaryeriEngine).not.toContain("getPrisma");
    expect(pazaryeriEngine).not.toContain("amountMinor");
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
    expect(TEZGAH_TOOLS.flatMap((tool) => (tool.cta ? [tool.cta.href] : []))).toEqual([
      "/academy/02_ecommerce_ai",
      "/academy/01_office_ai/seviye",
      "/academy",
    ]);
  });

  it("dördüncü sekme site tetkikidir; rapor yazdırılır, satın alma düğmesi yoktur", () => {
    expect(TEZGAH_TOOLS.map((tool) => tool.id)).toEqual([
      "ecommerce",
      "proposal",
      "grant",
      "tetkik",
      "dukkan",
      "reklam",
      "pazaryeri",
    ]);
    const tetkik = TEZGAH_TOOLS.find((tool) => tool.id === "tetkik");
    expect(tetkik?.label).toBe("Web Sitesi Tetkik");
    expect(tetkik?.cta).toBeNull();
    expect(tetkik?.fields.map((field) => field.name)).toEqual([
      "url",
      "businessName",
      "freelancerName",
      "agencyName",
    ]);
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('role="tablist"');
    expect(workbench).toContain("/api/tezgah/tetkik/generate");
    expect(workbench).toContain("Tetkiki Üret");
    expect(workbench).toContain("data-tezgah-quota");
    expect(workbench).toContain("print:hidden");
    const report = readSrc("components/tezgah/tetkik-report.tsx");
    expect(report).toContain("data-tetkik-report");
    expect(report).toContain("window.print()");
    expect(report).toContain("print:hidden");
    expect(report).not.toContain("/academy");
    expect(report).not.toContain("fiyat");
    const page = readSrc("app/tezgah/page.tsx");
    expect(page).toContain("freelancerName");
    expect(page).toContain("loadIdentityBoard");
    expect(readSrc("app/tezgah/layout.tsx")).toContain("data-tezgah-chrome");
  });

  it("üçüncü sekme hibe proje dosyasıdır; markdown yolundan çıkar ve yazdırılır", () => {
    const grant = TEZGAH_TOOLS.find((tool) => tool.id === "grant");
    expect(grant?.label).toBe("Hibe Proje Dosyası");
    expect(grant?.fileStem).toBe("proje-dosyasi");
    expect(grant?.fields.map((field) => field.name)).toEqual([
      "businessName",
      "freelancerName",
      "provinceCode",
      "audience",
      "naceGroup",
      "investmentFocus",
      "employeeCount",
      "companyAgeYears",
      "rdMaturityLevel",
      "exportActive",
      "patent",
      "project",
      "scheduleWindows",
      "investmentAmounts",
    ]);
    expect(grant?.fields.find((field) => field.name === "audience")?.options?.map((option) => option.label)).toEqual([
      "Yeni girişimci",
      "Mevcut KOBİ",
    ]);
    expect(grant?.fields.find((field) => field.name === "investmentFocus")?.options?.map((option) => option.value)).toEqual([
      "makine_techizat",
      "yazilim_dijital",
      "arge",
      "ihracat",
    ]);
    expect(grant?.fields.find((field) => field.name === "provinceCode")?.options).toHaveLength(81);
    expect(grant?.fields.find((field) => field.name === "scheduleWindows")?.optional).toBe(true);
    expect(DronBayrakları.kayit("yetkinhibe")?.kapali).toBe(true);
    expect(DronBayrakları.kayit("yetkinhibe")?.path).toBe("/yetkinhibe");
    expect(readSrc("lib/tezgah/schema.ts")).not.toContain('literal("grant")');
    expect(readSrc("lib/tezgah/prompts.ts")).not.toContain("hibe ön uygunluk");
    expect(readSrc("lib/tezgah/engine.ts")).not.toContain("yetkinhibe");
    const grantEngine = readSrc("lib/tezgah/grant/engine.ts");
    expect(grantEngine).toContain("recordUsage: false");
    expect(grantEngine).toContain("refundTezgahQuota");
    expect(grantEngine).toContain("GRANT_MAX_OUTPUT_TOKENS");
    expect(grantEngine).toContain("matchGrantProgramsForBrief");
    expect(grantEngine).not.toContain("calculateGrantBudget");
    expect(grantEngine).not.toContain("ProjectDraft");
    expect(grantEngine).not.toContain(".create(");
    expect(grantEngine).not.toContain("getPrisma");
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/grant/generate");
    expect(workbench).toContain("Dosyayı Üret");
    expect(workbench).toContain("GrantProjectReportView");
    expect(workbench).not.toContain("/api/yetkinhibe/");
    const report = readSrc("components/tezgah/grant-project-report.tsx");
    expect(report).toContain("data-grant-report");
    expect(report).toContain("window.print()");
    expect(report).toContain("print:hidden");
    expect(report).not.toContain("/academy");
    expect(report).not.toContain("fiyat");
    expect(readSrc("lib/yetkinhibe/grant-project-notes.ts")).toContain(
      "Bu dosya resmî başvuru veya uygunluk kararı değildir.",
    );
  });

  it("beşinci sekme sektörel dijital dükkandır; html iner, önizleme betik çalıştırmaz", () => {
    const dukkan = TEZGAH_TOOLS.find((tool) => tool.id === "dukkan");
    expect(dukkan?.label).toBe("Sektörel Dijital Dükkan");
    expect(dukkan?.cta).toBeNull();
    expect(dukkan?.fileStem).toBe("dijital-dukkan");
    expect(dukkan?.fields.map((field) => field.name)).toEqual([
      "businessName",
      "sector",
      "place",
      "whatsapp",
      "services",
      "tone",
    ]);
    expect(dukkan?.fields.find((field) => field.name === "sector")?.options?.map((option) => option.label)).toEqual([
      "Restoran/Kafe",
      "Kuaför/Güzellik",
      "Teknik Servis",
      "Diş/Sağlık Kliniği",
      "Emlak/Danışmanlık",
      "Yerel Mağaza",
    ]);
    expect(dukkan?.fields.find((field) => field.name === "tone")?.options?.map((option) => option.label)).toEqual([
      "Sıcak",
      "Sakin",
      "Net",
      "Gece",
      "Doğal",
    ]);
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/dukkan/generate");
    expect(workbench).toContain("Dükkanı Üret");
    const preview = readSrc("components/tezgah/dukkan-preview.tsx");
    expect(DUKKAN_FILENAME).toBe("dijital-dukkan.html");
    expect(preview).toContain("downloadHtml(DUKKAN_FILENAME, html)");
    expect(preview).toContain("anchor.download = filename");
    expect(preview).toContain("allow-popups allow-popups-to-escape-sandbox allow-forms");
    expect(preview).not.toContain("allow-scripts");
    expect(preview).toContain("srcDoc");
    expect(preview).toContain("data-dukkan-preview");
  });

  it("altıncı sekme reklam paketidir; markdown iner, amaç çağrısı katalogda kilitlidir", () => {
    const reklam = TEZGAH_TOOLS.find((tool) => tool.id === "reklam");
    expect(reklam?.label).toBe("Otonom Reklam Paketi");
    expect(reklam?.cta).toBeNull();
    expect(reklam?.fileStem).toBe("reklam-paketi");
    expect(reklam?.fields.map((field) => field.name)).toEqual([
      "businessName",
      "sector",
      "place",
      "aim",
      "offer",
    ]);
    expect(reklam?.fields.find((field) => field.name === "aim")?.options?.map((option) => option.label)).toEqual([
      "WhatsApp mesajı",
      "Telefon araması",
      "Mağaza ziyareti",
    ]);
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/reklam/generate");
    expect(workbench).toContain("Reklamı Üret");
    expect(workbench).toContain(".md İndir");
    expect(workbench).toContain(".txt İndir");
  });

  it("yedinci sekme pazaryeri kataloğudur; tablo önizlenir ve csv iner", () => {
    const pazaryeri = TEZGAH_TOOLS.find((tool) => tool.id === "pazaryeri");
    expect(pazaryeri?.label).toBe("Pazaryeri Katalog Fabrikası");
    expect(pazaryeri?.cta).toBeNull();
    expect(pazaryeri?.fileStem).toBe("pazaryeri-katalog");
    expect(pazaryeri?.fields.map((field) => field.name)).toEqual(["market", "products"]);
    expect(pazaryeri?.fields.find((field) => field.name === "market")?.options?.map((option) => option.label)).toEqual([
      "Trendyol",
      "Hepsiburada",
      "Amazon",
    ]);
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/pazaryeri/generate");
    expect(workbench).toContain("Kataloğu Üret");
    expect(workbench).toContain("pazaryeri-katalog.csv");
    const preview = readSrc("components/tezgah/pazaryeri-preview.tsx");
    expect(preview).toContain("data-pazaryeri-preview");
    expect(preview).toContain("<table");
    expect(preview).toContain("downloadCsv(PAZARYERI_FILENAME, csv)");
    expect(preview).toContain("anchor.download = filename");
  });

  it("araç sorgusu ve kota dönüşümü workbench kaynağında durur", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    const page = readSrc("app/tezgah/page.tsx");
    expect(workbench).toContain("useSearchParams");
    expect(workbench).toContain("GoogleContinueButton");
    expect(workbench).toContain("tezgahToolAnchorPath");
    expect(workbench).toContain('router.replace(tezgahToolHref(id) as Route, { scroll: false })');
    expect(workbench).not.toContain("academyCheckoutHref");
    expect(workbench).not.toContain("Stüdyo Kotası Yükselt");
    expect(workbench).toContain("Kurs satın almak bugünkü üretim sayacını yükseltmez.");
    expect(workbench).toContain('href="/academy"');
    expect(workbench).toContain("Akademiye dön");
    expect(workbench).toContain("TEZGAH_MEMBER_QUOTA_MESSAGE");
    expect(workbench).toContain("Ücretsiz kayıt ol");
    expect(workbench.indexOf("data-tezgah-guest-convert")).toBeLessThan(
      workbench.indexOf("data-tezgah-member-convert"),
    );
    expect(workbench).toContain("showGuestCard ? (");
    expect(page).toContain("<Suspense");
    expect(page).toContain("<TezgahWorkbench");
    expect(page.indexOf("<PageHeader")).toBeLessThan(page.indexOf("<Suspense"));
    expect(page).toContain('title="Dakikalar içinde kullanıma hazır çıktı"');
    expect(page).not.toContain("müşterine");
    expect(workbench).toContain(
      "Formu doldurup çıktıyı üret. Hazırlanan çıktı burada kart olarak görünür; doğrudan kopyalayabilir veya indirebilirsin.",
    );
    expect(workbench).not.toContain("müşterine");
    expect(TEZGAH_TOOLS.find((tool) => tool.id === "tetkik")?.blurb).toBe(
      "Ana sayfanın ilk HTML’inden 100 puanlık dijital sağlık skoru ve yazdırılabilir rapor.",
    );
    expect(SEN_VOICE.public.home.bench.find((item) => item.id === "tetkik")?.body).toBe(
      "Ana sayfadan dijital sağlık skoru ve yazdırılabilir rapor çıkarırsın.",
    );
  });
});

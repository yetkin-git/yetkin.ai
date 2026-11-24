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
import { ECOMMERCE_CATEGORY_CHIPS, TEZGAH_TOOLS, tezgahQuotaLine } from "@/lib/tezgah/catalog";
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
    const dashboardSlot = nav.indexOf('openRoom("dashboard")');
    const hibeSlot = nav.indexOf('openRoom("yetkinhibe")');
    const tezgahSlot = nav.indexOf('openRoom("tezgah")');
    expect(dashboardSlot).toBeGreaterThan(-1);
    expect(hibeSlot).toBeGreaterThan(dashboardSlot);
    expect(tezgahSlot).toBeGreaterThan(hibeSlot);
    const page = readSrc("app/(public)/page.tsx");
    expect(page).toContain('href="/tezgah"');
    expect(page).toContain("copy.tezgahCta");
    expect(SEN_VOICE.public.home.tezgahCta).toBe("Tezgâhı Aç");
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
    expect(ROUTE_AUTH_MAP["/api/tezgah/studio-photo"]).toBe("session");
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
    expect(
      WEB_ONLY_WRITE_ROUTES.some((row) => row.method === "POST" && row.path === "/api/tezgah/studio-photo"),
    ).toBe(true);
    expect(findPublishedHopId("POST", "/api/tezgah/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/grant/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/tetkik/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/dukkan/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/reklam/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/pazaryeri/generate")).toBeNull();
    expect(findPublishedHopId("POST", "/api/tezgah/studio-photo")).toBeNull();
    expect(findPublishedHopId("GET", "/api/tezgah/quota")).toBeNull();
    expect(isLlmMutationPath("/api/tezgah/grant/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/tetkik/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/dukkan/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/reklam/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/pazaryeri/generate")).toBe(true);
    expect(isLlmMutationPath("/api/tezgah/studio-photo")).toBe(true);
    const engine = readSrc("lib/tezgah/engine.ts");
    expect(engine).toContain("recordUsage: true");
    expect(engine).toContain("TEZGAH_MAX_OUTPUT_TOKENS");
    expect(engine).not.toContain("getPrisma");
    expect(engine).not.toContain("Wallet");
    expect(engine).not.toContain("amountMinor");
    expect(engine).not.toContain("yetkinhibe");
    const tetkikEngine = readSrc("lib/tezgah/tetkik/engine.ts");
    expect(tetkikEngine).toContain("recordUsage: true");
    expect(tetkikEngine).toContain("TETKIK_MAX_OUTPUT_TOKENS");
    expect(tetkikEngine).not.toContain("getPrisma");
    expect(tetkikEngine).not.toContain("amountMinor");
    const dukkanEngine = readSrc("lib/tezgah/dukkan/engine.ts");
    expect(dukkanEngine).not.toContain("invokeLlm");
    expect(dukkanEngine).not.toContain("getPrisma");
    expect(dukkanEngine).not.toContain("amountMinor");
    expect(dukkanEngine).not.toContain("consumeTezgahQuota");
    expect(dukkanEngine).not.toContain("refundTezgahQuota");
    expect(dukkanEngine).toContain("AI maliyeti yoktur");
    const reklamEngine = readSrc("lib/tezgah/reklam/engine.ts");
    expect(reklamEngine).toContain("recordUsage: true");
    expect(reklamEngine).toContain("REKLAM_MAX_OUTPUT_TOKENS");
    expect(reklamEngine).toContain("refundTezgahQuota");
    expect(reklamEngine).not.toContain("getPrisma");
    expect(reklamEngine).not.toContain("amountMinor");
    const pazaryeriEngine = readSrc("lib/tezgah/pazaryeri/engine.ts");
    expect(pazaryeriEngine).toContain("recordUsage: true");
    expect(pazaryeriEngine).toContain("PAZARYERI_MAX_OUTPUT_TOKENS");
    expect(pazaryeriEngine).toContain("refundTezgahQuota");
    expect(pazaryeriEngine).not.toContain("getPrisma");
    expect(pazaryeriEngine).not.toContain("amountMinor");
    const studioEngine = readSrc("lib/tezgah/pro/studio-photo-engine.ts");
    expect(studioEngine).toContain("generateImage");
    expect(studioEngine).toContain("refundTezgahQuota");
    expect(studioEngine).toContain("recordUsage: true");
    expect(studioEngine).not.toContain("getPrisma");
    expect(studioEngine).not.toContain("amountMinor");
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("Çıktıyı Üret");
    expect(workbench).toContain("Tek Tıkla Kopyala");
    expect(workbench).toContain(".md İndir");
    expect(workbench).toContain(".txt İndir");
    expect(workbench).toContain("TEZGAH_GUEST_QUOTA_MESSAGE");
    expect(readSrc("lib/tezgah/catalog.ts")).toContain(
      "Bugünkü 3 ücretsiz hakkın doldu. Yarın (İstanbul gece yarısı) yenilenir.",
    );
    expect(tezgahQuotaLine(27, 30)).toBe("Kalan kredi: 27 / 30");
    expect(readSrc("lib/tezgah/catalog.ts")).toContain("TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE");
    expect(readSrc("lib/tezgah/tetkik/engine.ts")).toContain("claimTetkikDomain");
    expect(readSrc("lib/tezgah/tetkik/engine.ts")).toContain("isTetkikDomainClaimed");
    expect(readSrc("components/tezgah/workbench.tsx")).toContain("tezgahToolQuotaLine");
    expect(readSrc("app/api/tezgah/quota/route.ts")).toContain('searchParams.get("tool")');
    expect(readSrc("app/api/tezgah/quota/route.ts")).toContain("tezgahToolQuotaLine");
    expect(readSrc("components/tezgah/workbench.tsx")).not.toContain("data-tezgah-quota-early");
    expect(TEZGAH_TOOLS.flatMap((tool) => (tool.cta ? [tool.cta.href] : []))).toEqual([
      "/panel/e-ticaret",
      "/panel/hibe",
      "/panel/e-ticaret",
    ]);
  });

  it("dördüncü sekme web site analizidir; rapor yazdırılır, satın alma düğmesi yoktur", () => {
    expect(TEZGAH_TOOLS.map((tool) => tool.id)).toEqual([
      "ecommerce",
      "proposal",
      "grant",
      "tetkik",
      "dukkan",
      "reklam",
      "pazaryeri",
      "studio-photo",
      "technical-drawing",
      "saas-builder",
    ]);
    const tetkik = TEZGAH_TOOLS.find((tool) => tool.id === "tetkik");
    expect(tetkik?.label).toBe("Web Site Analizi");
    expect(tetkik?.cta).toBeNull();
    expect(tetkik?.fields.map((field) => field.name)).toEqual(["url"]);
    expect(tetkik?.fields.map((field) => field.label)).toEqual(["Site adresi"]);
    expect(tetkik?.fields.map((field) => field.placeholder)).toEqual(["https://ornek-dukkan.com"]);
    expect(tetkik?.fields.some((field) => field.name === "businessName")).toBe(false);
    expect(tetkik?.fields.some((field) => field.name === "freelancerName" || field.name === "agencyName")).toBe(
      false,
    );
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('role="tablist"');
    expect(workbench).toContain("/api/tezgah/tetkik/generate");
    expect(workbench).toContain("Analizi Başlat");
    expect(workbench).toContain("data-tezgah-quota");
    expect(workbench).toContain("print:hidden");
    const report = readSrc("components/tezgah/tetkik-report.tsx");
    expect(report).toContain("data-tetkik-report");
    expect(report).toContain("data-tetkik-analysis-card");
    expect(report).toContain("window.print()");
    expect(report).toContain("print:hidden");
    expect(report).toContain("Raporu Eyleme Dönüştürün (Kendi Başınıza Hemen Uygulayın)");
    expect(report).toContain("Hazır Düzeltme & SEO Uygulama Paketi");
    expect(report).toContain("Hazır Düzeltme Paketini Üret");
    expect(report).toContain("Sıfırdan Satış Odaklı Yeni Vitrin Kur");
    expect(report).toContain("Yeni Vitrinimi Otomatik Kur");
    expect(report).toContain("data-tetkik-revision");
    expect(report).toContain("data-tetkik-rebuild");
    expect(report).toContain("data-tetkik-codepack");
    expect(report).toContain("Sitenize Özel Hesaplayıcı veya Form Ekle");
    expect(report).toContain("Özel Aracı Oluştur");
    expect(workbench).toContain("data-tetkik-handoff");
    expect(workbench).toContain("data-tetkik-codepack-handoff");
    expect(workbench).toContain("Web Site Analizi bulgularınız otomatik aktarıldı; şimdi hazır çözümünüzü üretebilirsiniz.");
    expect(workbench).not.toContain("Analizden taşındı");
    expect(workbench).toContain('selectTool("dukkan"');
    expect(workbench).toContain('selectTool("saas-builder"');
    expect(workbench).toContain("normalizeTetkikSiteAddress");
    expect(report).not.toContain("/academy");
    expect(report).not.toContain("fiyat");
    const page = readSrc("app/tezgah/page.tsx");
    expect(page).toContain("freelancerName");
    expect(page).toContain("loadIdentityBoard");
    expect(readSrc("app/tezgah/layout.tsx")).toContain("data-tezgah-chrome");
  });

  it("hibe proje dosyası kendi işletim sistemindedir; tezgâh sekmesinde ölü dal yoktur", () => {
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
    expect(DronBayrakları.kayit("yetkinhibe")?.kapali).toBe(false);
    expect(DronBayrakları.kayit("yetkinhibe")?.path).toBe("/panel/hibe");
    expect(readSrc("lib/tezgah/schema.ts")).not.toContain('literal("grant")');
    expect(readSrc("lib/tezgah/prompts.ts")).not.toContain("hibe ön uygunluk");
    expect(readSrc("lib/tezgah/engine.ts")).not.toContain("yetkinhibe");
    const grantEngine = readSrc("lib/tezgah/grant/engine.ts");
    expect(grantEngine).toContain("recordUsage: true");
    expect(grantEngine).toContain("refundTezgahQuota");
    expect(grantEngine).toContain("GRANT_MAX_OUTPUT_TOKENS");
    expect(grantEngine).toContain("matchGrantProgramsForBrief");
    expect(grantEngine).toContain("readGrantDossierPlan");
    expect(grantEngine).toContain("GRANT_DOSSIER_MAX_OUTPUT_TOKENS");
    expect(grantEngine).not.toContain("calculateGrantBudget");
    expect(grantEngine).not.toContain("ProjectDraft");
    expect(grantEngine).not.toContain(".create(");
    expect(grantEngine).not.toContain("getPrisma");
    const workbench = readSrc("components/tezgah/workbench.tsx");
    // Y4 — `grant` masası `/panel/hibe` işletim sistemine taşındı. Workbench'te
    // ne rota ne de ölü rapor bileşeni kalır; hibe UI'si kendi odasında yaşar.
    expect(workbench).not.toContain("/api/tezgah/grant/generate");
    expect(workbench).not.toContain("Dosyayı Üret");
    expect(workbench).not.toContain("GrantProjectReportView");
    expect(workbench).not.toContain("GrantDetailWizard");
    expect(workbench).not.toContain("/api/yetkinhibe/");
    // Hibe raporu bileşeni hâlâ vardır; sahibi `components/hibe/project-desk.tsx`.
    expect(readSrc("components/hibe/project-desk.tsx")).toContain("GrantProjectReportView");
    const wizard = readSrc("components/tezgah/grant-detail-wizard.tsx");
    expect(wizard).toContain("Başvuru Dosyasını Derinleştir (Kuruma Özel Ek Bilgiler)");
    expect(wizard).toContain("Tam Proje Dosyasını Oluştur");
    expect(wizard).toContain("data-grant-detail-wizard");
    expect(wizard).not.toContain("/api/");
    const report = readSrc("components/tezgah/grant-project-report.tsx");
    expect(report).toContain("data-grant-report");
    expect(report).toContain("data-grant-dossier");
    expect(report).toContain("Tam Proje Başvuru Dosyası");
    expect(report).toContain("İş Paketleri Takvimi");
    expect(report).toContain("Bütçe Gerekçelendirme Tablosu");
    expect(report).toContain("Ekip Yetkinlik Matrisi");
    expect(report).toContain("Ticarileşme Planı");
    expect(report).toContain("Word (.docx) İndir");
    expect(report).toContain("PDF İndir");
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
    expect(dukkan?.cta).toEqual({ href: "/panel/e-ticaret", label: "E-Ticaret Mağazası Aç" });
    expect(dukkan?.fileStem).toBe("dijital-dukkan");
    expect(dukkan?.fields.map((field) => field.name)).toEqual([
      "businessName",
      "sector",
      "place",
      "whatsapp",
      "services",
      "packages",
      "hours",
      "faq",
      "tone",
    ]);
    expect(dukkan?.fields.find((field) => field.name === "sector")?.options?.map((option) => option.label)).toEqual([
      "E-Ticaret / Butik",
      "Klinik / Sağlık",
      "Kafe / Restoran",
      "Mali Müşavir / Hukuk",
      "İnşaat / Mimarlık",
      "Eğitim / Akademi",
      "Güzellik / Bakım",
      "Oto Servis",
      "Emlak",
      "Teknik Servis",
      "Lojistik / Nakliye",
      "Yazılım / Ajans",
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
    expect(preview).toContain("data-dukkan-reklam-handoff");
    expect(preview).not.toContain("Öz-skor");
    expect(preview).not.toContain("100 / 100");
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
      "budgetTl",
    ]);
    expect(reklam?.fields.find((field) => field.name === "aim")?.options?.map((option) => option.label)).toEqual([
      "WhatsApp mesajı",
      "Telefon araması",
      "Mağaza ziyareti",
    ]);
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("/api/tezgah/reklam/generate");
    expect(workbench).toContain("Reklamı Üret");
    expect(workbench).toContain("ReklamPreview");
    const preview = readSrc("components/tezgah/reklam-preview.tsx");
    expect(preview).toContain("Google Ads CSV İndir");
    expect(preview).toContain("Meta Ads CSV İndir");
    expect(preview).toContain(".md İndir");
    expect(preview).toContain(".txt İndir");
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
    expect(workbench).toContain("PAZARYERI_FILENAME");
    expect(workbench).toContain("en çok 25");
    const preview = readSrc("components/tezgah/pazaryeri-preview.tsx");
    expect(preview).toContain("data-pazaryeri-preview");
    expect(preview).toContain("<table");
    expect(preview).toContain("downloadCsv(PAZARYERI_FILENAME, csv)");
    expect(preview).toContain("Word (.docx) İndir");
    expect(preview).toContain("PDF İndir");
    expect(preview).toContain("anchor.download = filename");
  });

  it("araç sorgusu ve kota dönüşümü workbench kaynağında durur", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    const page = readSrc("app/tezgah/page.tsx");
    expect(workbench).toContain("useSearchParams");
    expect(workbench).toContain("GoogleContinueButton");
    expect(workbench).toContain("tezgahToolAnchorPath");
    expect(workbench).toContain('router.replace(tezgahDeskHref(id, deskTaskId) as Route, { scroll: false })');
    expect(workbench).not.toContain("academyCheckoutHref");
    expect(workbench).not.toContain("Stüdyo Kotası Yükselt");
    expect(workbench).toContain("Kurs satın almak aylık kredi havuzunu yükseltmez.");
    expect(workbench).toContain('href="/panel/hibe"');
    expect(workbench).toContain("YetkinHibe’yi aç");
    expect(workbench).toContain("TEZGAH_MEMBER_QUOTA_MESSAGE");
    expect(workbench).toContain("Ücretsiz kayıt ol");
    expect(workbench.indexOf("data-tezgah-guest-convert")).toBeLessThan(
      workbench.indexOf("data-tezgah-member-convert"),
    );
    expect(workbench).toContain("showGuestCard ? (");
    expect(page).toContain("<Suspense");
    expect(page).toContain("<TezgahWorkbench");
    expect(page).toContain("tezgahRelocatedOsHref");
    expect(page).toContain("redirect(");
    expect(workbench).toContain("isTezgahDeskTool");
    expect(workbench).toContain("resolveTezgahDeskTool");
    expect(page.indexOf("<PageHeader")).toBeLessThan(page.indexOf("<Suspense"));
    // B-03: başlık `ilk=1` işaretine göre değişir; sabit dize dondurulmaz.
    expect(page).toContain("Dakikalar içinde kullanıma hazır çıktı");
    expect(page).toContain("SIGNUP_FIRST_VALUE_PARAM");
    expect(page).toContain("data-tezgah-first-visit");
    expect(page).not.toContain("müşterine");
    const ecommerce = TEZGAH_TOOLS.find((tool) => tool.id === "ecommerce");
    const category = ecommerce?.fields.find((field) => field.name === "category");
    expect(category?.label).toBe("Kategori (Ana kategori veya ürün türü)");
    expect(category?.placeholder).toBe("Kategoriyi yaz (veya boş bırak)...");
    expect(category?.optional).toBe(true);
    // Y4 — e-ticaret kartı UI'si workbench'ten çıktı; gerçek yeri
    // `components/commerce/product-card-studio.tsx`. Kategori çipleri orada yaşar.
    const studio = readSrc("components/commerce/product-card-studio.tsx");
    expect(workbench).not.toContain("data-ecommerce-category-chips");
    expect(workbench).not.toContain("ECOMMERCE_CATEGORY_CHIPS");
    expect(studio).toContain("ECOMMERCE_CATEGORY_CHIPS");
    expect([...ECOMMERCE_CATEGORY_CHIPS]).toEqual([
      "Anne & Bebek",
      "Ev & Yaşam",
      "Giyim",
      "Elektronik",
      "Kozmetik",
      "Gıda",
      "Aksesuar",
    ]);
    expect(workbench).toContain(
      "Formu doldurup çıktıyı üret. Hazırlanan çıktı burada kart olarak görünür; doğrudan kopyalayabilir veya indirebilirsin.",
    );
    expect(workbench).not.toContain("müşterine");
    expect(TEZGAH_TOOLS.find((tool) => tool.id === "tetkik")?.blurb).toBe(
      "Sitenizin SEO uyumunu, ikna gücünü ve satışa dönüşüm performansını derinlemesine analiz eder; eksiklerinizi hazır çözümlerle sunar.",
    );
    expect(SEN_VOICE.public.home.bench.find((item) => item.id === "tetkik")?.body).toBe(
      "Sitenizin SEO, ikna ve dönüşüm performansını analiz eder; hazır çözümler sunar.",
    );
  });
});

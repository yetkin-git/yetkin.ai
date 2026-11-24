import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { grantDossierHref, grantDossierHrefForStore } from "@/lib/commerce/os-growth";
import {
  readPlatformGrantCalls,
  registerHibeCatalogReadPort,
  type HibeCatalogReadPort,
} from "@/lib/kernel/market-demand/platform-demand-port";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Ş3 — ödeme komutu dosya üretimine taşınır", () => {
  it("proje masası ödeme anahtarını `Idempotency-Key` olarak kullanır", () => {
    const desk = readSrc("components/hibe/project-desk.tsx");
    expect(desk).toContain("paymentCommandKey");
    expect(desk).toContain("paymentCommandKey ?? crypto.randomUUID()");
    // Ücretsiz taslak kendi anahtarını korur.
    expect(desk).toContain(": generateKey");
  });

  it("kokpit ve sayfa ödeme anahtarını zincirler", () => {
    const page = readSrc("app/(kernel)/panel/hibe/page.tsx");
    expect(page).toContain('one("odeme")');
    expect(page).toContain("paymentCommandKey");
    const cockpit = readSrc("components/hibe/os-cockpit.tsx");
    expect(cockpit).toContain("paymentCommandKey={paymentCommandKey}");
  });

  it("cüzdan dönüşü hibe masasına ödeme anahtarını taşır", () => {
    const signal = readSrc("components/kernel/cuzdan-return-signal.tsx");
    expect(signal).toContain("odeme=");
    expect(signal).toContain("purchase.merchantOid");
  });

  it("üretilmemiş dosya iadeye açık, üretilmiş dosya kapalı", async () => {
    const { isCardRefundBlockedForOrder, isGrantProductPurpose } = await import(
      "@/lib/kernel/payments/order-purpose"
    );
    expect(isGrantProductPurpose("GRANT_DOSSIER")).toBe(true);
    expect(isGrantProductPurpose("HIBE_AGENCY")).toBe(true);
    expect(isGrantProductPurpose("WALLET_TOPUP")).toBe(false);
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: false })).toBe(false);
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: true })).toBe(true);
    // Bilinmeyen teslim durumu parayı geri vermez (fail-closed).
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: undefined })).toBe(true);
  });

  it("iade ayırıcısı hibe satırını teslimata göre eler", async () => {
    const { allocateUnusedBalanceRefund } = await import("@/lib/kernel/payments/wallet-card-refund");
    const slices = allocateUnusedBalanceRefund(
      620_000,
      [
        { merchantOid: "oid-agency", amountMinor: 499_000, purpose: "HIBE_AGENCY", grantProduced: false },
        { merchantOid: "oid-dossier", amountMinor: 149_000, purpose: "GRANT_DOSSIER", grantProduced: true },
        { merchantOid: "oid-topup", amountMinor: 200_000, purpose: "wallet-top-up" },
      ],
      {},
    );
    // Dosya teslim edildi → iade dışı. Ajans üretilmedi → iadeye açık, kalan cüzdan yüklemesine.
    expect(slices.map((row) => row.merchantOid)).toEqual(["oid-agency", "oid-topup"]);
    expect(slices.reduce((sum, row) => sum + row.amountMinor, 0)).toBe(620_000);
    expect(slices[1]?.amountMinor).toBe(121_000);
  });

  it("paid-lane dosya bedelini ortak fiyat kaynağından doğrular", () => {
    const lane = readSrc("lib/tezgah/paid-lane.ts");
    expect(lane).toContain('readTezgahCatalogAmount("hibe/dossier")');
    expect(lane).toContain('readTezgahCatalogAmount("hibe/agency")');
    expect(lane).toContain("hibeAgencyPackage");
  });
});

describe("Ş10 — haftalık radar kitlesi hibe profilini kapsar", () => {
  it("alıcı listesi `hibeCompanyProfile` sahiplerini içerir", () => {
    const radar = readSrc("lib/jobs/weekly-radar.ts");
    expect(radar).toContain("hibeCompanyProfile");
    expect(radar).toContain("{ hibeCompanyProfile: { isNot: null } }");
    // Eski üç ürün koşulu korunur.
    expect(radar).toContain("tezgahOutputs");
    expect(radar).toContain("academyCertificates");
    expect(radar).toContain("commerceStores");
  });
});

describe("Ş12 — platform talep portu temiz arayüz", () => {
  it("kernel doğrudan `yetkinhibeGrantCall` tablosunu okumaz", () => {
    const port = readSrc("lib/kernel/market-demand/platform-demand-port.ts");
    expect(port).not.toContain("yetkinhibeGrantCall");
    expect(port).not.toContain("yetkinhibe_grant_calls");
    expect(port).toContain("HibeCatalogReadPort");
    expect(port).toContain("registerHibeCatalogReadPort");
    // Dikey adaptörü kataloğu tek okuma yolundan alır.
    expect(readSrc("lib/yetkinhibe/platform-grant-port.ts")).toContain("loadYetkinhibeGrantCatalog");
    expect(readSrc("app/api/(kernel)/jobs/inngest/route.ts")).toContain("registerHibePlatformPort");
  });

  it("port kayıtlı değilse sinyal uydurulmaz", async () => {
    registerHibeCatalogReadPort(null);
    const rows = await readPlatformGrantCalls(new Date("2026-11-23T12:00:00.000Z"));
    expect(rows).toEqual([]);
  });

  it("kayıtlı port satırını okur ve destek oranı olmayanı eler", async () => {
    const port: HibeCatalogReadPort = {
      readOpenCalls: async () =>
        [
          { id: "g1", title: "KOSGEB", summary: "", tags: ["kobi"], minSupportMinor: 0, maxSupportMinor: 100_000, supportRatioBps: 5000 },
          { id: "g0", title: "Sıfır oran", summary: "", tags: [], minSupportMinor: 0, maxSupportMinor: 0, supportRatioBps: 0 },
        ] as const,
    };
    registerHibeCatalogReadPort(port);
    const rows = await readPlatformGrantCalls(new Date("2026-11-23T12:00:00.000Z"));
    expect(rows.map((row) => row.id)).toEqual(["g1"]);
    registerHibeCatalogReadPort(null);
    vi.restoreAllMocks();
  });

  it("hibe yazan rotalar sicil durumu gerçek davranışa uyar", () => {
    const routes = readSrc("lib/kernel/http/web-only-write-routes.ts");
    // Katalog okuması artık `closed-room` değil: oda açık.
    const catalogBlock = routes.slice(
      routes.indexOf('"read-yetkinhibe-grant-catalog"'),
      routes.indexOf('"closed-yetkinhibe-grant-match"'),
    );
    expect(catalogBlock).toContain('"web-read"');
    expect(catalogBlock).not.toContain("closed-room");
    expect(catalogBlock).toContain("YETKINHIBE_CATALOG_NOTE");
    // Eşleştirme veri yazmadığı için product-write değil, kayıtlı ve açık.
    const matchBlock = routes.slice(
      routes.indexOf('"closed-yetkinhibe-grant-match"'),
      routes.indexOf("admin-grant-calls"),
    );
    expect(matchBlock).not.toContain("closed-room");
  });

  it("boş `app/(kernel)/hibe` dizini kaldırıldı", () => {
    expect(() => readFileSync(join(ROOT, "app", "(kernel)", "hibe", "page.tsx"), "utf8")).toThrow();
  });
});

describe("Ş12 / F2.8 — e-ticaret köprüsü mağaza durumuna uyar", () => {
  it("`hesap=1` taşır ve sabit ihracat odağı yazmaz", () => {
    const plain = grantDossierHref("Mağaza", "store-1");
    expect(plain).toContain("hesap=1");
    expect(plain).not.toContain("yatirim=ihracat");
    expect(plain).toContain("sekme=analiz");
    expect(plain).toContain("store=store-1");
  });

  it("odak mağaza durumundan gelir", () => {
    expect(grantDossierHrefForStore({ storeName: "M", exportActive: true })).toContain("yatirim=ihracat");
    expect(grantDossierHrefForStore({ storeName: "M", hasProducts: true })).toContain(
      "yatirim=yazilim_dijital",
    );
    expect(grantDossierHrefForStore({ storeName: "M" })).toContain("yatirim=makine_techizat");
  });

  it("kokpit köprüsü mağaza durumunu geçirir", () => {
    const cockpit = readSrc("components/commerce/os-cockpit.tsx");
    expect(cockpit).toContain("grantDossierHrefForStore");
    expect(cockpit).toContain("exportActive: support.lines.length > 0");
    expect(cockpit).toContain("hasProducts: products.length > 0");
  });
});

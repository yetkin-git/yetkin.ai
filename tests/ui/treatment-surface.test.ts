import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { productsJsonLd } from "@/lib/copy/json-ld";
import { PAGE_SEO, sitemapRoutePolicy } from "@/lib/copy/seo";
import { TEZGAH_FREE_MONTHLY_CREDITS, TEZGAH_GUEST_DAILY_LIMIT, TEZGAH_PRO_MONTHLY_CREDITS } from "@/lib/tezgah/catalog";
import { tezgahProPoolLimit } from "@/lib/tezgah/quota";
import { TRIAL_COPY } from "@/lib/pricing/trial-copy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Tedavi (TEDAVI_RAPORU) — ticari huni, SEO ve marka dili mühürleri.
 *
 * Bu dosya bulgu kimlikleriyle hizalıdır; her `describe` bir bulgunun
 * geri dönüş yapmadığını doğrular. Dizge dondurmak yerine **sözleşme** doğrular:
 * sabit kaynağı, yüzeyin bağı, şemanın tutumluluğu.
 */

describe("B-02 / S-01 — Tezgâh Pro kredisi gerçek ve tek kaynaklı", () => {
  it("Pro aylık kredi havuzu ücretsiz havuzun üzerindedir", () => {
    expect(TEZGAH_PRO_MONTHLY_CREDITS).toBe(500);
    expect(TEZGAH_FREE_MONTHLY_CREDITS).toBe(30);
    expect(TEZGAH_PRO_MONTHLY_CREDITS).toBeGreaterThan(TEZGAH_FREE_MONTHLY_CREDITS);
    // Havuz tavanı Pro'da ücretsiz sayaca düşmez.
    expect(tezgahProPoolLimit("lite")).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
    // Tetkik ömür boyu 1 sözleşmesi Pro'da da korunur.
    expect(tezgahProPoolLimit("tetkik")).toBe(1);
    // Misafir günlük tavanı aylık havuza bağlanmaz (IP kovası paylaşılır).
    expect(TEZGAH_GUEST_DAILY_LIMIT).toBe(3);
  });

  it("Pro kullanıcı 'ücretsiz hak' cümlesi görmez; sayaç kendi dilini basar", () => {
    const catalog = readSrc("lib/tezgah/catalog.ts");
    expect(catalog).toContain("tezgahProQuotaLine");
    expect(catalog).toContain("tezgahToolQuotaLineForLane");
    expect(catalog).toContain("TEZGAH_PRO_QUOTA_MESSAGE");
    // Ücretsiz satır hâlâ ücretsiz kullanıcı için durur (regresyon değil, ayrım).
    expect(catalog).toContain("Kalan kredi");

    const route = readSrc("app/api/tezgah/quota/route.ts");
    expect(route).toContain("tezgahToolQuotaLineForLane");
    expect(route).toContain("tezgahPoolQuotaLineForLane");

    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("tezgahToolQuotaLineForLane");
  });

  it("fiyat sayfası Pro kredisini sabitten okur, elle yazmaz", () => {
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("TEZGAH_PRO_MONTHLY_CREDITS");
    // Eski elle yazılmış vaat kalmadı.
    expect(page).not.toContain('"Yüksek kota"');
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    expect(vitrine).toContain("TEZGAH_PRO_MONTHLY_CREDITS");
  });
});

describe("B-05 — deneme metni tek doğruluk kaynağından", () => {
  it("SSOT paketi tüm yüzeyleri besler", () => {
    expect(TRIAL_COPY.periodDays).toBe(30);
    expect(TRIAL_COPY.headline).toContain("ücretsiz");
    expect(TRIAL_COPY.cancelLine).toContain("Dönem sonu iptali");
    expect(TRIAL_COPY.honestyLine).toContain("iade taahhüdü değildir");

    for (const file of [
      "lib/pricing/public-vitrine.ts",
      "components/commerce/license-checkout.tsx",
      "lib/rehber/workflows.ts",
    ]) {
      expect(readSrc(file), file).toContain("lib/pricing/trial-copy");
    }
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("TRIAL_HONESTY_NOTE");
  });
});

describe("B-01 / §4.3 — YetkinCV ücretsiz sınav + ücretli yayın", () => {
  it("katalog birimi geri açıldı **çünkü** ödeme rotası var (sıra korunur)", () => {
    const catalogWrite = readSrc("lib/kernel/admin/catalog-write.ts");
    // Birim artık açılabilir: ödeme rotası onu tüketiyor.
    expect(catalogWrite).toContain('unitKey: "yetkincv-exam"');
    // Diğer açılabilir birimler durur (regresyon değil).
    expect(catalogWrite).toContain('unitKey: "job-screening-pack"');
    expect(catalogWrite).toContain('unitKey: "monthly"');

    // Sıra: ödeme rotası → CLEARED kancası → katalog satırı.
    expect(existsSync(join(ROOT, "app/api/career/yetkincv/purchase/route.ts"))).toBe(true);
    const purchase = readSrc("app/api/career/yetkincv/purchase/route.ts");
    expect(purchase).toContain("placeSingleCatalogPurchase");
    expect(purchase).toContain("YETKINCV_PUBLICATION_UNIT");
    expect(purchase).toContain("YETKINCV_PUBLICATION_ORDER_PURPOSE");
    expect(purchase).toContain('auth = "session"');

    const publication = readSrc("lib/career/yetkincv-publication.ts");
    expect(publication).toContain("sealedPublication");
    expect(publication).toContain("fulfillYetkinCvPublication");

    const hook = readSrc("lib/career/register-paytr-license-hook.ts");
    expect(hook).toContain("registerCareerLicenseHook");
    expect(hook).toContain("fulfillYetkinCvPublication");

    // Vitrin dürüstlüğü: sınav ücretsiz, yayın tek seferlik; puan satın alınmaz.
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    expect(vitrine).toContain('id: "career:yetkincv-exam"');
    expect(vitrine).toContain("Puan satın almadan değil test sonucundan oluşur");
    expect(vitrine).toContain("Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir");
  });

  it("sınav, puan, SWOT ve 30/60/90 planı ücretsiz kalır (ödeme rotası bunlara dokunmaz)", () => {
    // `/api/career/yetkincv` yalnız start/submit işler; ücret kontrolü yoktur.
    const route = readSrc("app/api/career/yetkincv/route.ts");
    expect(route).toContain("startYetkinCvSitting");
    expect(route).toContain("sealYetkinCvSitting");
    expect(route).not.toContain("placeSingleCatalogPurchase");
    expect(route).not.toContain("paymentOrder");
    // Mühür üretimi ücretsizdir: `sealedPublication` varsayılanı false.
    const schema = readSrc("prisma/schema/career.prisma");
    expect(schema).toContain("sealedPublication             Boolean   @default(false)");
  });
});

describe("B-03 — kayıt sonrası ilk değer anı", () => {
  it("yeni kullanıcı Tezgâh'a iner; giriş yapan kokpite döner", () => {
    const redirects = readSrc("lib/kernel/auth/redirects.ts");
    expect(redirects).toContain("AUTH_SIGNUP_FIRST_VALUE_NEXT");
    expect(redirects).toContain("markSignupFirstValueLanding");
    expect(redirects).toContain("SIGNUP_FIRST_VALUE_PARAM");
    // Genel dönüş varsayılanı kokpit kalır.
    expect(redirects).toContain('AUTH_CALLBACK_DEFAULT_NEXT = "/dashboard"');

    const page = readSrc("app/tezgah/page.tsx");
    expect(page).toContain("SIGNUP_FIRST_VALUE_PARAM");
    expect(page).toContain("data-tezgah-first-visit");
  });

  it("yeni kullanıcının sıradaki eylemi kilitli hibe odası değildir", () => {
    const nba = readSrc("lib/dashboard/next-best-action.ts");
    expect(nba).toContain("tezgah_first");
    expect(nba).toContain("isFreshUser");
    const card = readSrc("components/dashboard/next-best-action-card.tsx");
    expect(card).toContain("tezgah_first");
  });
});

describe("4.4 — dönüşüm hunisi olayları bağlı", () => {
  it("dört yeni olay tanımlı ve tetikleme noktalarına bağlı", () => {
    const conversion = readSrc("lib/kernel/sem/conversion.ts");
    for (const event of [
      "tezgah_first_output",
      "tezgah_quota_wall",
      "pricing_view",
      "checkout_start",
    ]) {
      expect(conversion, event).toContain(event);
    }
    // Aktivasyon: sunucu bayrağı → istemci olayı.
    expect(readSrc("lib/tezgah/engine.ts")).toContain("firstOutput");
    expect(readSrc("components/tezgah/workbench.tsx")).toContain('emitSemConversion("tezgahFirstOutput"');
    expect(readSrc("components/tezgah/workbench.tsx")).toContain('emitSemConversion("tezgahQuotaWall"');
    expect(readSrc("components/pricing/pricing-checkout-tracker.tsx")).toContain('emitSemConversion("checkoutStart"');
    expect(readSrc("components/pricing/pricing-checkout-tracker.tsx")).toContain('emitSemConversion("pricingView"');
  });
});

describe("SEO — Product/Offer, llms.txt, sitemap önceliği", () => {
  it("Product şeması tutarı çağırandan alır; tutar yoksa şemaya girmez", () => {
    const nodes = productsJsonLd({
      name: "test",
      path: "/fiyatlandirma",
      items: [
        {
          id: "tezgah:pro",
          name: "AI Tezgâh Pro",
          description: "test",
          priceMajor: "590.00",
          path: "/fiyatlandirma",
          monthly: true,
        },
        {
          id: "career:yetkincv-exam",
          name: "YetkinCV",
          description: "test",
          priceMajor: null,
          path: "/fiyatlandirma",
        },
      ],
    });
    // ItemList + yalnız tutarı olan ürün.
    expect(nodes).toHaveLength(2);
    const list = nodes[0]!;
    expect(list["@type"]).toBe("ItemList");
    expect(list.numberOfItems).toBe(1);
    const product = nodes[1]!;
    expect(product["@type"]).toBe("Product");
    const offer = product.offers as Record<string, unknown>;
    expect(offer.price).toBe("590.00");
    expect(offer.priceCurrency).toBe("TRY");
    expect(offer.availability).toBe("https://schema.org/InStock");
  });

  it("tutarı olmayan tek ürün boş grafik döndürür (uydurma Offer yok)", () => {
    expect(
      productsJsonLd({
        name: "test",
        path: "/fiyatlandirma",
        items: [
          { id: "x", name: "X", description: "x", priceMajor: null, path: "/fiyatlandirma" },
        ],
      }),
    ).toEqual([]);
  });

  it("fiyat sayfası JSON-LD ve huni izleyicisini bağlar", () => {
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("productsJsonLd");
    expect(page).toContain("JsonLd");
    expect(page).toContain("PricingCheckoutTracker");
    expect(page).toContain("data-pricing-cta");
  });

  it("llms.txt ucu canlı katalogdan fiyat okur ve ücretsiz içerik üretir", () => {
    const route = readSrc("app/llms.txt/route.ts");
    expect(route).toContain("loadPublicPricingVitrine");
    expect(route).toContain("force-dynamic");
    expect(route).toContain("text/plain; charset=utf-8");
    expect(route).toContain("TEZGAH_PRO_MONTHLY_CREDITS");
    expect(route).toContain("CANONICAL_SITE_ORIGIN");
  });

  it("sitemap önceliği: satış sayfası 0.9, yasal 0.3", () => {
    expect(sitemapRoutePolicy(PAGE_SEO.pricing.path).priority).toBe(0.9);
    expect(sitemapRoutePolicy("/legal").priority).toBe(0.3);
    expect(sitemapRoutePolicy("/legal/gizlilik").priority).toBe(0.3);
    // Yasal bant iletisim/hakkimizda'yı yutmaz.
    expect(sitemapRoutePolicy("/iletisim").priority).toBe(0.5);
    expect(sitemapRoutePolicy("/hakkimizda").priority).toBe(0.5);
  });
});

describe("M-03 — kamu üst menüsü ortak bileşende", () => {
  it("public layout top bar basar; ana sayfa çift header üretmez", () => {
    expect(readSrc("app/(public)/layout.tsx")).toContain("PublicTopBar");
    const page = readSrc("app/(public)/page.tsx");
    expect(page).not.toContain("<header");
    const topBar = readSrc("components/public/public-top-bar.tsx");
    expect(topBar).toContain("PUBLIC_TOP_BAR_PATHS");
    expect(topBar).toContain("HomeAccountNav");
    expect(topBar).toContain("BrandIcon");
    for (const href of ["/tezgah", "/fiyatlandirma", "/kurumsal", "/rehber"]) {
      expect(topBar, href).toContain(`"${href}"`);
    }
  });
});

describe("S-03 / S-04 — yatay taşma, viewport ve manifest", () => {
  it("ana sayfa w-screen + negatif margin kullanmaz", () => {
    const page = readSrc("app/(public)/page.tsx");
    expect(page).not.toContain("w-screen");
    expect(page).not.toContain("margin-inline:calc");
  });

  it("kök layout viewport/themeColor taşır; manifest dosyası vardır", () => {
    const layout = readSrc("app/layout.tsx");
    expect(layout).toContain("export const viewport");
    expect(layout).toContain("themeColor");
    expect(layout).toContain("viewportFit");
    const manifest = readSrc("app/manifest.ts");
    expect(manifest).toContain("MetadataRoute.Manifest");
    expect(manifest).toContain("/icon.svg");
    expect(manifest).toContain("/apple-icon.png");
    expect(manifest).toContain("theme_color");
  });
});

describe("M-04 / P-01 — env doğrulaması ve iz temizliği", () => {
  it("instrumentation env şemasını çağırır ama build'i kırmaz", () => {
    const instrumentation = readSrc("instrumentation.ts");
    expect(instrumentation).toContain("getEnv");
    expect(instrumentation).toContain("ops.env.invalid");
    expect(instrumentation).toContain("ops.env.payments_unconfigured");
    // Fail-closed değil: süreç düşürülmez.
    expect(instrumentation).not.toContain("process.exit");
    // DB importu yasak kuralı korunur (TTFB).
    expect(instrumentation).not.toContain("@/lib/kernel/db");
  });

  it("kullanılmayan font izden çıkarıldı", () => {
    const config = readSrc("next.config.ts");
    expect(config).not.toContain("NotoSans-Regular.woff");
    // Çalışma zamanı modül çözümü korunur.
    expect(config).toContain('"@digabi/noto-sans"');
  });
});

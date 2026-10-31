import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEdgeCsp } from "@/lib/kernel/security/edge-guard";
import { ga4ConnectSrcExtra, ga4ImgSrcExtra, ga4ScriptSrcExtra } from "@/lib/kernel/telemetry/csp";
import { publicPageQuery, trackPageView, trackPurchase, trackViewItem } from "@/lib/kernel/telemetry/funnel";
import { JUNIOR_YEARLY_GA_ITEM_ID } from "@/lib/kernel/telemetry/junior-item";
import { pollJuniorPlanActive } from "@/lib/kernel/telemetry/junior-plan-poll";
import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";
import { emitSemConversion } from "@/lib/kernel/sem/conversion";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GA4 ölçüm kimliği", () => {
  it("boş, bozuk ve GTM kabını reddeder; G- kimliğini bırakır", () => {
    expect(readGaMeasurementId("")).toBeNull();
    expect(readGaMeasurementId("   ")).toBeNull();
    expect(readGaMeasurementId("GTM-ABC123")).toBeNull();
    expect(readGaMeasurementId("UA-123456-1")).toBeNull();
    expect(readGaMeasurementId("G-AB")).toBeNull();
    expect(readGaMeasurementId("G-ABCDE123")).toBe("G-ABCDE123");
    expect(readGaMeasurementId(" G-ABCDE123 ")).toBe("G-ABCDE123");
    expect(readGaMeasurementId("G-ABCDE123';alert(1)//")).toBeNull();
  });
});

describe("GA4 kenar CSP", () => {
  it("kimlik yokken köken eklemez; geçerli kimlikte collect ve etiket kökenini ekler", () => {
    expect(ga4ScriptSrcExtra({})).toBe("");
    expect(ga4ConnectSrcExtra({})).toBe("");
    expect(ga4ScriptSrcExtra({ NEXT_PUBLIC_GA_ID: "" })).toBe("");
    expect(ga4ConnectSrcExtra({ NEXT_PUBLIC_GA_ID: "GTM-ABC123" })).toBe("");
    const script = ga4ScriptSrcExtra({ NEXT_PUBLIC_GA_ID: "G-ABCDE123" });
    const connect = ga4ConnectSrcExtra({ NEXT_PUBLIC_GA_ID: "G-ABCDE123" });
    const image = ga4ImgSrcExtra({ NEXT_PUBLIC_GA_ID: "G-ABCDE123" });
    expect(script).toContain("https://www.googletagmanager.com");
    expect(connect).toContain("https://www.google-analytics.com");
    expect(connect).toContain("https://*.google-analytics.com");
    expect(image).toContain("https://www.google-analytics.com");
    expect(image).toContain("https://www.googletagmanager.com");
    expect(ga4ImgSrcExtra({ NEXT_PUBLIC_GA_ID: "" })).toBe("");

    const closed = buildEdgeCsp("nonce", { NODE_ENV: "test" });
    expect(closed).not.toContain("google-analytics");
    expect(closed).not.toContain("googletagmanager");
    const open = buildEdgeCsp("nonce", { NODE_ENV: "test", NEXT_PUBLIC_GA_ID: "G-ABCDE123" });
    expect(open).toContain("https://www.google-analytics.com");
    expect(open).toContain("https://www.googletagmanager.com");
    expect(open).toMatch(/script-src[^;]*googletagmanager\.com/);
    expect(open).toMatch(/connect-src[^;]*google-analytics\.com/);
    expect(open).toMatch(/img-src[^;]*google-analytics\.com/);
    expect(open).toContain(`script-src 'self' 'nonce-nonce'`);
  });

  it("kenar ve huni sayfaları etiket adresini kaynakta taşımaz", () => {
    const files = [
      "app/layout.tsx",
      "app/academy/[slug]/page.tsx",
      "app/academy/[slug]/oyna/page.tsx",
      "lib/kernel/security/edge-guard.ts",
      "lib/kernel/sem/conversion.ts",
    ];
    for (const relative of files) {
      const source = readSrc(relative);
      expect(source, relative).not.toContain("gtag.js");
      expect(source, relative).not.toContain("googletagmanager");
      expect(source, relative).not.toContain("google-analytics");
    }
    expect(readSrc("app/layout.tsx")).toContain("Ga4Bootstrap");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("AcademyViewItem");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("trackBeginCheckout");
    expect(readSrc("components/academy/curriculum-player.tsx")).toContain("trackPlayFreePreview");
    expect(readSrc("components/kernel/paytr-checkout-iframe.tsx")).toContain("trackPaytrIframeLoaded");
    expect(readSrc("components/kernel/kasa-return-panel.tsx")).toContain("trackPurchase");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("trackPurchase");
    expect(readSrc("lib/kernel/sem/conversion.ts")).toContain("emitSemConversion");
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("dataLayer.push");
    expect(readSrc("components/kernel/ga4-bootstrap.tsx")).toContain("send_page_view");
    expect(readSrc("components/kernel/ga4-route-page-view.tsx")).toContain("usePathname");
    expect(readSrc("components/kernel/ga4-route-page-view.tsx")).toContain("useSearchParams");
    expect(readSrc("components/kernel/ga4-route-page-view.tsx")).toContain("trackPageView");
    expect(readSrc("app/junior/page.tsx")).toContain("JuniorPackageViewItem");
    expect(readSrc("app/junior/checkout/page.tsx")).toContain("JuniorCheckoutBeacon");
    expect(readSrc("components/junior/checkout-form.tsx")).toContain("trackPurchase");
    expect(readSrc("lib/junior/price.ts")).toContain(`JUNIOR_YEARLY_CATALOG_ID = "${JUNIOR_YEARLY_GA_ITEM_ID}"`);
  });
});

describe("GA4 huni olayı", () => {
  it("kimlik yokken pencere yoksa fırlatmaz", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    expect(() => trackViewItem({ itemId: "01_office_ai", valueMinor: 89000, currency: "TRY" })).not.toThrow();
  });

  it("geçerli kimlikte view_item bir kez kuyruğa yazılır", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-ABCDE123");
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/academy/01_office_ai" },
      dataLayer: [],
      gtag,
    });
    trackViewItem({
      itemId: "01_office_ai",
      itemName: "İş Hayatında Yapay Zekâ",
      valueMinor: 89000,
      currency: "TRY",
    });
    trackViewItem({
      itemId: "01_office_ai",
      itemName: "İş Hayatında Yapay Zekâ",
      valueMinor: 89000,
      currency: "TRY",
    });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0]?.[0]).toBe("event");
    expect(gtag.mock.calls[0]?.[1]).toBe("view_item");
    const params = gtag.mock.calls[0]?.[2] as {
      item_id?: string;
      value_minor?: number;
      value?: number;
      page_path?: string;
      items?: Array<{ item_id?: string; price?: number }>;
    };
    expect(params.item_id).toBe("01_office_ai");
    expect(params.value_minor).toBe(89000);
    expect(params.value).toBe(890);
    expect(params.page_path).toBe("/academy/01_office_ai");
    expect(params.page_path).not.toContain("?");
    expect(params.items?.[0]?.price).toBe(890);
  });

  it("sayfa geçişi page_view basar; pasaport sorgusu düşer, kampanya kalır", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-ABCDE123");
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/academy", origin: "https://yetkin.ai" },
      dataLayer: [],
      gtag,
    });
    expect(publicPageQuery("p=secret-passport&utm_source=ads")).toBe("?utm_source=ads");
    trackPageView("/kasa", "p=secret-passport&utm_source=ads");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0]?.[0]).toBe("event");
    expect(gtag.mock.calls[0]?.[1]).toBe("page_view");
    const params = gtag.mock.calls[0]?.[2] as { page_path?: string; page_location?: string };
    expect(params.page_path).toBe("/kasa?utm_source=ads");
    expect(params.page_location).toBe("https://yetkin.ai/kasa?utm_source=ads");
    expect(params.page_path).not.toContain("secret");
  });

  it("cüzdan kapanışı ve PayTR dönüşü aynı purchase gtag çağrısıdır", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-ABCDE123");
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/academy/01_office_ai" },
      dataLayer: [],
      gtag,
      dispatchEvent: () => true,
    });
    emitSemConversion("purchase", {
      courseId: "01_office_ai",
      valueMinor: 89000,
      currency: "TRY",
      transactionId: "ckwalletpurchase01",
    });
    trackPurchase({
      itemId: "01_office_ai",
      valueMinor: 89000,
      currency: "TRY",
      transactionId: "ckpaytrreturn01",
    });
    expect(gtag).toHaveBeenCalledTimes(2);
    const wallet = gtag.mock.calls[0]?.[2] as { value?: number; currency?: string; transaction_id?: string; items?: unknown };
    const paytr = gtag.mock.calls[1]?.[2] as { value?: number; currency?: string; transaction_id?: string; items?: unknown };
    expect(gtag.mock.calls[0]?.[1]).toBe("purchase");
    expect(gtag.mock.calls[1]?.[1]).toBe("purchase");
    expect(wallet.value).toBe(paytr.value);
    expect(wallet.currency).toBe(paytr.currency);
    expect(wallet.items).toEqual(paytr.items);
    expect(wallet.transaction_id).toBe("ckwalletpurchase01");
    expect(paytr.transaction_id).toBe("ckpaytrreturn01");
    expect(gtag.mock.calls.every((call) => call[0] === "event")).toBe(true);
  });

  it("kayıt sign_up olayını gtag ile basar; dataLayer nesnesi itilmez", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-ABCDE123");
    const gtag = vi.fn();
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      location: { pathname: "/register" },
      dataLayer,
      gtag,
      dispatchEvent: () => true,
    });
    emitSemConversion("register");
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "sign_up",
      expect.objectContaining({ method: "email", page_path: "/register" }),
    );
    expect(dataLayer).toEqual([]);
  });

  it("Junior paket yoklaması açık plan yoksa purchase üretmez", async () => {
    const waits: number[] = [];
    const active = await pollJuniorPlanActive({
      readActive: async () => false,
      gapsMs: [5, 5],
      wait: async (ms) => {
        waits.push(ms);
      },
    });
    expect(active).toBe(false);
    expect(waits).toEqual([5, 5]);
    const opened = await pollJuniorPlanActive({
      readActive: async () => true,
      gapsMs: [50],
      wait: async () => {
        throw new Error("açık planda beklenmez");
      },
    });
    expect(opened).toBe(true);
  });
});

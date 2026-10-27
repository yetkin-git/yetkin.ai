import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEdgeCsp } from "@/lib/kernel/security/edge-guard";
import { ga4ConnectSrcExtra, ga4ScriptSrcExtra } from "@/lib/kernel/telemetry/csp";
import { trackViewItem } from "@/lib/kernel/telemetry/funnel";
import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

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
    expect(script).toContain("https://www.googletagmanager.com");
    expect(connect).toContain("https://www.google-analytics.com");
    expect(connect).toContain("https://*.google-analytics.com");

    const closed = buildEdgeCsp("nonce", { NODE_ENV: "test" });
    expect(closed).not.toContain("google-analytics");
    expect(closed).not.toContain("googletagmanager");
    const open = buildEdgeCsp("nonce", { NODE_ENV: "test", NEXT_PUBLIC_GA_ID: "G-ABCDE123" });
    expect(open).toContain("https://www.google-analytics.com");
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
    expect(readSrc("lib/kernel/sem/conversion.ts")).toContain('emitSemConversion');
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
});

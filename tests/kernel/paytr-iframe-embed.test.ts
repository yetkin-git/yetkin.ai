import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isPaytrIframeUrl,
  getPaytrIframeUrl,
  readPaytrIframeSrcFromCheckout,
  PAYTR_IFRAME_ALLOW,
  PAYTR_IFRAME_BASE_URL,
  PAYTR_IFRAME_ORIGIN,
  PAYTR_IFRAME_RESIZER_SRC,
} from "@/lib/kernel/payments/paytr/iframe-embed";
import { EDGE_PERMISSIONS_POLICY_VALUE } from "@/lib/kernel/security/edge-security-headers";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR iFrame gömme", () => {
  it("yalnız PayTR https /odeme/guvenli adresini kabul eder", () => {
    expect(isPaytrIframeUrl(`${PAYTR_IFRAME_BASE_URL}/token-abc`)).toBe(true);
    expect(isPaytrIframeUrl("https://www.paytr.com/odeme/guvenli/e2e")).toBe(true);
    expect(isPaytrIframeUrl("http://www.paytr.com/odeme/guvenli/x")).toBe(false);
    expect(isPaytrIframeUrl("https://evil.example/odeme/guvenli/x")).toBe(false);
    expect(isPaytrIframeUrl("https://www.paytr.com/js/iframeResizer.min.js")).toBe(false);
    expect(isPaytrIframeUrl("/odeme/guvenli/x")).toBe(false);
    expect(isPaytrIframeUrl("https://www.paytr.com/odeme/guvenli/")).toBe(false);
    expect(isPaytrIframeUrl("https://www.paytr.com/odeme/guvenli/tok#hash")).toBe(true);
  });

  it("getPaytrIframeUrl ham token'ı https://www.paytr.com/odeme/guvenli/{token} yapar", () => {
    expect(getPaytrIframeUrl("iframe-token")).toBe(
      "https://www.paytr.com/odeme/guvenli/iframe-token",
    );
    expect(getPaytrIframeUrl("abc+def=")).toBe("https://www.paytr.com/odeme/guvenli/abc+def=");
    expect(getPaytrIframeUrl("https://www.paytr.com/odeme/guvenli/tok#iFrameResize")).toBe(
      "https://www.paytr.com/odeme/guvenli/tok",
    );
    expect(
      readPaytrIframeSrcFromCheckout({
        token: "only-token",
      }),
    ).toBe("https://www.paytr.com/odeme/guvenli/only-token");
    expect(
      readPaytrIframeSrcFromCheckout({
        iframeUrl: "https://www.paytr.com/odeme/guvenli/from-api#x",
        token: "ignored",
      }),
    ).toBe("https://www.paytr.com/odeme/guvenli/from-api");
  });

  it("Payment Request allow ve resmi V2 resizer taşır", () => {
    expect(PAYTR_IFRAME_ORIGIN).toBe("https://www.paytr.com");
    expect(PAYTR_IFRAME_ALLOW).toContain("payment");
    expect(PAYTR_IFRAME_RESIZER_SRC).toBe(
      "https://www.paytr.com/js/iframeResizer.min.js?v2",
    );
    expect(EDGE_PERMISSIONS_POLICY_VALUE).toContain(
      'payment=(self "https://www.paytr.com" "https://*.paytr.com")',
    );
    expect(EDGE_PERMISSIONS_POLICY_VALUE).not.toContain("payment=()");
  });

  it("cüzdan ve modal PaytrCheckoutIframe bağlar; ham iframe + form içi gömme yok", () => {
    const iframe = readSrc("components/kernel/paytr-checkout-iframe.tsx");
    const wallet = readSrc("components/kernel/wallet-top-up-form.tsx");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    const headers = readSrc("lib/kernel/security/edge-security-headers.ts");
    const csp = readSrc("lib/kernel/security/edge-guard.ts");

    expect(iframe).toContain("allow={PAYTR_IFRAME_ALLOW}");
    expect(iframe).toContain("data-paytr-iframe");
    expect(iframe).toContain("PAYTR_IFRAME_RESIZER_SRC");
    expect(iframe).toContain("getPaytrIframeUrl");
    expect(iframe).toContain('id="paytriframe"');
    expect(iframe).not.toContain("sandbox");
    expect(wallet).toContain("PaytrCheckoutIframe");
    expect(wallet).toContain("readPaytrIframeSrcFromCheckout");
    expect(wallet).not.toContain("<iframe");
    expect(modal).toContain("PaytrCheckoutIframe");
    expect(modal).toContain("readPaytrIframeSrcFromCheckout");
    expect(modal).not.toContain("<iframe");
    expect(headers).toContain("EDGE_PERMISSIONS_POLICY_VALUE");
    expect(EDGE_PERMISSIONS_POLICY_VALUE).not.toContain("payment=()");
    expect(csp).toContain("frame-src https://www.paytr.com https://*.paytr.com");
    expect(csp).toContain("EDGE_CSP_PAYTR_SCRIPT_SRC");
    expect(csp).toContain("https://www.paytr.com https://*.paytr.com");
  });
});

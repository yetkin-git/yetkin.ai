import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WALLET_CHECKOUT_PASSPORT_INVALID,
  WALLET_CHECKOUT_PASSPORT_PATH,
  WALLET_CHECKOUT_PASSPORT_QUERY,
  WALLET_CHECKOUT_PASSPORT_RETURN_PATH,
  buildPaytrDronCheckoutReturnUrl,
  buildWalletCheckoutPassportUrl,
  mintWalletCheckoutPassport,
  verifyWalletCheckoutPassport,
} from "@/lib/kernel/payments/wallet-checkout-passport";
import { kasaReturnCourseHref } from "@/components/kernel/kasa-return-panel";
import { decideEdgeAction } from "@/lib/kernel/security/edge-guard";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Dron cüzdan HMAC kasa pasaportu", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("imza yuvarlak gezer; bozulmuş MAC ve süre dolumu reddedilir", () => {
    vi.stubEnv("ACADEMY_EXAM_SITTING_SECRET", "passport-lab-secret-16");
    const token = mintWalletCheckoutPassport({
      userId: "user_lab_1",
      merchantOid: "oid_lab_1",
      token: "paytr-iframe-token",
    });
    const payload = verifyWalletCheckoutPassport(token);
    expect(payload?.sub).toBe("user_lab_1");
    expect(payload?.oid).toBe("oid_lab_1");
    expect(payload?.tok).toBe("paytr-iframe-token");

    const tampered = `${token.slice(0, -2)}aa`;
    expect(verifyWalletCheckoutPassport(tampered)).toBeNull();
    expect(verifyWalletCheckoutPassport("")).toBeNull();
    expect(verifyWalletCheckoutPassport("no-dot")).toBeNull();

    const shortLived = mintWalletCheckoutPassport({
      userId: "user_lab_1",
      merchantOid: "oid_lab_1",
      token: "paytr-iframe-token",
      now: 1_000,
      ttlMs: 10,
    });
    expect(verifyWalletCheckoutPassport(shortLived, 1_020)).toBeNull();
  });

  it("/kasa oturumsuz kamuya açıktır; /cuzdan sığınağı durur", () => {
    expect(WALLET_CHECKOUT_PASSPORT_PATH).toBe("/kasa");
    expect(WALLET_CHECKOUT_PASSPORT_RETURN_PATH).toBe("/kasa/donus");
    expect(decideEdgeAction("/kasa", false).kind).toBe("next");
    expect(decideEdgeAction("/kasa/donus", false).kind).toBe("next");
    expect(decideEdgeAction("/cuzdan", false).kind).toBe("auth-307");
    expect(
      buildWalletCheckoutPassportUrl("https://yetkin.ai", "abc.def").includes(
        `${WALLET_CHECKOUT_PASSPORT_PATH}?${WALLET_CHECKOUT_PASSPORT_QUERY}=`,
      ),
    ).toBe(true);
    expect(buildPaytrDronCheckoutReturnUrl("https://yetkin.ai", "ok")).toBe(
      "https://yetkin.ai/kasa/donus?sonuc=ok",
    );
    expect(buildPaytrDronCheckoutReturnUrl("https://yetkin.ai", "ok", "01_office_ai_ileri")).toBe(
      "https://yetkin.ai/kasa/donus?sonuc=ok&kurs=01_office_ai_ileri",
    );
    expect(buildPaytrDronCheckoutReturnUrl("https://yetkin.ai", "fail", "01_office_ai_ileri")).toBe(
      "https://yetkin.ai/kasa/donus?sonuc=fail",
    );
    expect(kasaReturnCourseHref("01_office_ai_ileri")).toBe("/academy/01_office_ai_ileri");
    expect(kasaReturnCourseHref("01_office_ai")).toBe("/academy/01_office_ai");
    expect(kasaReturnCourseHref("not-a-course")).toBe("/academy/01_office_ai");
    expect(existsSync(join(ROOT, "app/(public)/kasa/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/(public)/kasa/donus/page.tsx"))).toBe(true);
    expect(readSrc("app/(public)/kasa/page.tsx")).toContain("verifyWalletCheckoutPassport");
    expect(readSrc("app/(public)/kasa/page.tsx")).toContain("PaytrCheckoutIframe");
    expect(readSrc("app/(public)/kasa/donus/page.tsx")).not.toContain("settlePaytrWebhookSuccess");
    expect(WALLET_CHECKOUT_PASSPORT_INVALID).toMatch(/geçersiz/);
  });

  it("top-up hop Idempotency-Key kalkanını ve HMAC pasaportunu basar", () => {
    const route = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    expect(route).toContain("requireRailV1IdempotencyKey");
    expect(route).toContain("mintWalletCheckoutPassport");
    expect(route).toContain("buildWalletCheckoutPassportUrl");
    expect(route).toContain("buildPaytrDronCheckoutReturnUrl");
    expect(route).toContain("isV1JsonRequest");
    expect(route).not.toMatch(/readIdempotencyKey\(/);
  });
});

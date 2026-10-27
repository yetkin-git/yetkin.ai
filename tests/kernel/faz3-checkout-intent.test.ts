import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  checkoutIntentKey,
  funnelDayKey,
  isFunnelIntentSurface,
  recordCheckoutIntentStep,
  resetCheckoutIntentMemory,
} from "@/lib/kernel/admin/funnel-checkout-intent";
import {
  FUNNEL_CHECKOUT_INTENT_STEP,
  FUNNEL_COUNTER_STEP_IDS,
} from "@/lib/kernel/admin/funnel-constants";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * `checkout_intent` — huninin üçüncü adımı (Faz 3, Adım 2).
 * Rapor §3.3: son 7 günde 57 vitrin ziyareti, 3 ücretsiz ders, **0 ödeme niyeti**.
 * Bu test o boşluğun kapandığını ve niyetin dürüst yazıldığını doğrular.
 */
describe("checkout_intent — kasa ekranı açılmadan yazılan niyet", () => {
  beforeEach(() => {
    resetCheckoutIntentMemory();
  });

  it("adım kimliği huni sicilinde ve sayaç adımları arasındadır", () => {
    expect(FUNNEL_CHECKOUT_INTENT_STEP).toBe("checkout_intent");
    expect(FUNNEL_COUNTER_STEP_IDS).toContain(FUNNEL_CHECKOUT_INTENT_STEP);
  });

  it("gün anahtarı İstanbul takvim günüdür (sayaç ekseni ile aynı)", () => {
    // 2026-10-26T21:30Z → İstanbul 27 Ekim 00:30 (UTC+3).
    expect(funnelDayKey(new Date("2026-10-26T21:30:00.000Z"))).toBe("2026-10-27");
    // 2026-10-26T20:59Z → İstanbul 26 Ekim 23:59.
    expect(funnelDayKey(new Date("2026-10-26T20:59:00.000Z"))).toBe("2026-10-26");
  });

  it("niyet anahtarı gün + yüzey + hedef taşır; kişi kimliği taşımaz", () => {
    const key = checkoutIntentKey({
      surface: "academy-license",
      targetSlug: "01_office_ai",
      day: "2026-10-27",
    });
    expect(key).toBe("checkout_intent:2026-10-27:academy-license:01_office_ai");
    expect(key).not.toMatch(/@|\d{11}|user|email/i);
  });

  it("yüzey listesi kapalıdır; bilinmeyen yüzey kabul edilmez", () => {
    expect(isFunnelIntentSurface("academy-license")).toBe(true);
    expect(isFunnelIntentSurface("junior-yearly")).toBe(true);
    expect(isFunnelIntentSurface("wallet-top-up")).toBe(true);
    expect(isFunnelIntentSurface("freeform")).toBe(false);
  });

  it("aynı niyet aynı gün içinde iki kez sayılmaz (sayaç şişmez)", async () => {
    const now = new Date("2026-10-26T09:00:00.000Z");
    const first = await recordCheckoutIntentStep(
      { surface: "academy-license", targetSlug: "01_office_ai" },
      now,
    );
    // Veritabanı yoksa hiçbir şey sayılmaz; tekilleştirme yuvası da tüketilmez.
    if (first === "unavailable") {
      const retry = await recordCheckoutIntentStep(
        { surface: "academy-license", targetSlug: "01_office_ai" },
        new Date("2026-10-26T09:05:00.000Z"),
      );
      expect(retry).toBe("unavailable");
      return;
    }
    expect(first).toBe("counted");
    const second = await recordCheckoutIntentStep(
      { surface: "academy-license", targetSlug: "01_office_ai" },
      new Date("2026-10-26T09:05:00.000Z"),
    );
    expect(second).toBe("deduped");
  });

  it("farklı hedef ayrı niyettir", async () => {
    const now = new Date("2026-10-26T09:00:00.000Z");
    const a = await recordCheckoutIntentStep(
      { surface: "academy-license", targetSlug: "01_office_ai" },
      now,
    );
    const b = await recordCheckoutIntentStep(
      { surface: "academy-license", targetSlug: "02_ecommerce_ai" },
      now,
    );
    if (a === "unavailable") {
      expect(b).toBe("unavailable");
    } else {
      // İkisi farklı anahtar; ikincisi tekilleştirmeye takılmaz.
      expect(b).not.toBe("deduped");
    }
  });

  it("kasa rotası niyeti iFrame/pasaport üretildikten SONRA, logEvent'ten ÖNCE yazar", () => {
    const route = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    expect(route).toContain("recordCheckoutIntentStep");
    expect(route).toContain("iframeUrl || checkoutPassportUrl");
    const mark = route.indexOf("recordCheckoutIntentStep({");
    expect(mark).toBeGreaterThan(-1);
    const guard = route.indexOf("if (iframeUrl || checkoutPassportUrl)");
    const pending = route.indexOf('event: "wallet.top_up.pending"');
    // Niyet, gerçek bir ekran üretildikten sonra ve PENDING log'undan önce yazılır.
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(mark);
    expect(mark).toBeLessThan(pending);
    // Mock kasa ve fail-closed yollar bu noktadan önce döner: sahte niyet sayılmaz.
    const mockAt = route.indexOf("shouldFailCloseMockTopUp(checkout.mockCheckout)");
    expect(mockAt).toBeGreaterThan(-1);
    expect(mockAt).toBeLessThan(guard);
  });

  it("ikinci INSERT yazılmaz; sayaç tek evden (recordFunnelDailyStep) geçer", () => {
    const intent = readSrc("lib/kernel/admin/funnel-checkout-intent.ts");
    expect(intent).toContain("recordFunnelDailyStep");
    expect(intent).not.toContain("INSERT INTO funnel_daily_counters");
    expect(intent).toContain('import "server-only"');
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commerceLicenseActive, addCommerceLicenseMonth } from "@/lib/commerce/subscription";
import { buildPaytrStoredCardToken } from "@/lib/commerce/paytr-stored-card";
import {
  classifyTrialReservation,
  COMMERCE_TRIAL_RESERVATION_TTL_MS,
  trialMerchantKey,
} from "@/lib/commerce/trial-reservation";
import { commerceRenewalBase } from "@/lib/commerce/paytr-license-bridge";
import {
  applyCommerceRenewalResult,
  commerceMerchantTrialKey,
  commerceTrialWindow,
  COMMERCE_DUNNING_INTERVAL_MS,
  COMMERCE_TRIAL_OPTIMIZATION_LIMIT,
  COMMERCE_TRIAL_PERIOD_MS,
  COMMERCE_TRIAL_QUESTION_LIMIT,
  COMMERCE_TRIAL_VERIFY_MINOR,
  decideCommerceRenewal,
  trialQuotaAllows,
} from "@/lib/commerce/subscription-lifecycle";
import { createMemoryCommerceSubscriptionStore } from "@/lib/commerce/subscription-memory";
import { fulfillCommerceLicenseFromClearedOrder, readCommerceMonthlyAmount } from "@/lib/commerce/paytr-license-bridge";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";

const NOW = new Date("2026-11-21T00:00:00.000Z");
const ROOT = process.cwd();
const OWNER = "11111111-1111-4111-8111-111111111111";
const PRICE = 149_000;

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function catalog(amount: number | null): PriceCatalogStore {
  return {
    async findActiveEntry(moduleKey, unitKey) {
      if (amount == null || moduleKey !== "commerce" || unitKey !== "monthly") {
        return null;
      }
      return {
        id: "pce_commerce_monthly",
        moduleKey: "commerce",
        unitKey: "monthly",
        unitType: "MINOR",
        amountMinor: toAmountMinor(amount),
        currencyCode: "TRY",
        isActive: true,
        minMinor: toAmountMinor(1),
        maxMinor: toAmountMinor(50_000_000),
      };
    },
    async listActiveEntries() {
      return [];
    },
  };
}

function order(merchantOid: string, amountMinor: number): PaymentOrderSnapshot {
  return {
    id: `po_${merchantOid}`,
    userId: OWNER,
    merchantOid,
    amountMinor,
    currencyCode: "TRY",
    status: "CLEARED",
    createdAt: NOW,
    purpose: "commerce-license:monthly",
    consentVersion: "v1",
    distanceContractAccepted: true,
    digitalImmediatePerformanceAccepted: true,
  };
}

describe("e-ticaret abonelik yaşam döngüsü", () => {
  it("vergi kimliği bir kez deneme anahtarı olur ve 30 gün 1 TL ile açılır", () => {
    expect(commerceMerchantTrialKey({ invoiceType: "corporate", vkn: "1234567890" })).toBe("1234567890");
    expect(commerceMerchantTrialKey({ invoiceType: "individual", tckn: "10000000146" })).toBe("10000000146");
    expect(commerceMerchantTrialKey({ invoiceType: "corporate", vkn: "123" })).toBeNull();
    expect(COMMERCE_TRIAL_VERIFY_MINOR).toBe(100);
    const window = commerceTrialWindow(NOW);
    expect(window.trialEndsAt.getTime() - NOW.getTime()).toBe(COMMERCE_TRIAL_PERIOD_MS);
    expect(window.currentPeriodEnd).toEqual(window.trialEndsAt);
    expect(COMMERCE_TRIAL_QUESTION_LIMIT).toBe(250);
    expect(COMMERCE_TRIAL_OPTIMIZATION_LIMIT).toBe(100);
    expect(trialQuotaAllows(249, 250)).toBe(true);
    expect(trialQuotaAllows(250, 250)).toBe(false);
  });

  it("bireysel faturada TCKN boşsa deneme anahtarı yoktur (tam fiyat sessizce çekilmez)", () => {
    expect(trialMerchantKey({ invoiceType: "individual", fullName: "A", tckn: null, phone: "05551112233", address: "x" })).toBeNull();
    expect(trialMerchantKey({ invoiceType: "individual", fullName: "A", tckn: "10000000146", phone: "05551112233", address: "x" })).toBe("10000000146");
    expect(
      trialMerchantKey({
        invoiceType: "corporate",
        companyTitle: "A Ltd",
        taxOffice: "Kadıköy",
        vkn: "1234567890",
        phone: "05551112233",
        address: "x",
      }),
    ).toBe("1234567890");
    // Sunucu mesajı fatura künyesini adıyla ister.
    const trial = readSrc("lib/commerce/trial-reservation.ts");
    expect(trial).toContain("VKN (kurumsal, 10 hane) veya TCKN (bireysel, 11 hane)");
  });

  it("deneme rezervasyonu TTL'lidir: terk edilen ödeme penceresi hakkı yakmaz", () => {
    // Hiç satır yok → deneme açık.
    expect(
      classifyTrialReservation({ reservation: null, trialSealed: false, now: NOW }),
    ).toBe("free");
    // Taze kilit → eşzamanlı pencere var.
    expect(
      classifyTrialReservation({
        reservation: { consumedAt: new Date(NOW.getTime() - 60_000), sealedAt: null },
        trialSealed: false,
        now: NOW,
      }),
    ).toBe("held");
    // TTL dolmuş kilit → bayat, sahiplenilebilir (hak yanmadı).
    expect(
      classifyTrialReservation({
        reservation: {
          consumedAt: new Date(NOW.getTime() - COMMERCE_TRIAL_RESERVATION_TTL_MS - 1),
          sealedAt: null,
        },
        trialSealed: false,
        now: NOW,
      }),
    ).toBe("stale");
    // CLEARED mührü → hak gerçekten tüketildi, bir daha açılmaz.
    expect(
      classifyTrialReservation({
        reservation: { consumedAt: NOW, sealedAt: NOW },
        trialSealed: false,
        now: NOW,
      }),
    ).toBe("consumed");
    // Abonelik deneme izi (trialEndsAt) tek başına da tüketim kanıtıdır.
    expect(
      classifyTrialReservation({ reservation: null, trialSealed: true, now: NOW }),
    ).toBe("consumed");
    // İleri tarihli satır (saat kayması) kilit sayılır; hak yanmaz.
    expect(
      classifyTrialReservation({
        reservation: { consumedAt: new Date(NOW.getTime() + 3_600_000), sealedAt: null },
        trialSealed: false,
        now: NOW,
      }),
    ).toBe("held");
    expect(COMMERCE_TRIAL_RESERVATION_TTL_MS).toBe(60 * 60 * 1000);
  });

  it("ödeme yolu rezervasyonu hata hâlinde serbest bırakır (kaynak kapısı)", () => {
    const checkout = readSrc("lib/commerce/subscription-checkout.ts");
    // Insert artık hata yolunda geri alınıyor.
    expect(checkout).toContain("releaseCommerceTrialReservation");
    expect(checkout).toContain('"iframe_not_opened"');
    expect(checkout).toContain('"iframe_url_missing"');
    expect(checkout).toContain('"checkout_threw"');
    expect(checkout).toContain('"order_create_failed"');
    // TCKN/VKN yoksa sessizce tam fiyat yok: 422 açık hata.
    expect(checkout).toContain("COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE");
    expect(checkout).toContain("status: 422, error: COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE");
    // Rezervasyon, sipariş yazılmadan önce ve PayTR iframe'inden önce alınır.
    const reserveAt = checkout.indexOf("reserveCommerceTrial(");
    const checkoutAt = checkout.indexOf("beginCheckout(");
    expect(reserveAt).toBeGreaterThan(-1);
    expect(checkoutAt).toBeGreaterThan(reserveAt);
  });

  it("deneme ve esneklik süresi lisansı açık tutar", () => {
    const end = new Date(NOW.getTime() + 60_000);
    expect(commerceLicenseActive({ status: "TRIALING", expiresAt: end, trialEndsAt: end }, NOW)).toBe(true);
    expect(commerceLicenseActive({ status: "ACTIVE", expiresAt: end }, NOW)).toBe(true);
    const overdue = new Date(NOW.getTime() - 60_000);
    expect(commerceLicenseActive({ status: "PAST_DUE", expiresAt: overdue, currentPeriodEnd: overdue }, NOW)).toBe(
      true,
    );
    expect(commerceLicenseActive({ status: "CANCELED", expiresAt: end }, NOW)).toBe(false);
    expect(commerceLicenseActive({ status: "PENDING", expiresAt: null }, NOW)).toBe(false);
  });

  it("TRIALING kullanıcı erken uzatırsa kalan deneme günleri yanmaz", () => {
    const trialEnd = new Date(NOW.getTime() + 20 * 24 * 60 * 60 * 1000);
    // Denemede bitmemiş deneme süresi yeni dönemin tabanıdır.
    expect(
      commerceRenewalBase({ status: "TRIALING", expiresAt: trialEnd, trialEndsAt: trialEnd, currentPeriodEnd: trialEnd }, NOW)?.toISOString(),
    ).toBe(trialEnd.toISOString());
    // Aktif lisansta bitmemiş süre korunur.
    expect(
      commerceRenewalBase({ status: "ACTIVE", expiresAt: trialEnd }, NOW)?.toISOString(),
    ).toBe(trialEnd.toISOString());
    // Geçmiş tarih taban olmaz; yenileme bugünden başlar.
    const past = new Date(NOW.getTime() - 86_400_000);
    expect(commerceRenewalBase({ status: "ACTIVE", expiresAt: past }, NOW)).toBeNull();
    expect(commerceRenewalBase(null, NOW)).toBeNull();

    // Köprü bu tabanı bir takvim ayı ileri taşır.
    const bridge = readSrc("lib/commerce/paytr-license-bridge.ts");
    expect(bridge).toContain("commerceRenewalBase");
    expect(bridge).toContain("addCommerceLicenseMonth(");
    // CLEARED mühürü de aynı dosyada.
    expect(bridge).toContain("sealCommerceTrialConsumptionForStore");
    expect(addCommerceLicenseMonth(trialEnd).getUTCMonth()).not.toBe(trialEnd.getUTCMonth());
  });

  it("TRIALING köprüsü: sipariş mağazayı geri okumazsa süre yazılmaz", async () => {
    const repo = createMemoryCommerceRepository();
    const subscriptions = createMemoryCommerceSubscriptionStore();
    const ledger = createMemoryLedgerStore([{ userId: OWNER, amountMinor: PRICE }]);
    // Merchant oid mağazayı geri çözemiyorsa lisans yazılmaz (`store`).
    const orphan = await fulfillCommerceLicenseFromClearedOrder(
      repo,
      subscriptions,
      catalog(PRICE),
      order(`CM${"a".repeat(32)}${"B".repeat(12)}`, COMMERCE_TRIAL_VERIFY_MINOR),
      ledger,
      NOW,
    );
    expect(orphan.reason).toBe("store");
    expect(orphan.applied).toBe(false);
    expect(await readCommerceMonthlyAmount(catalog(null))).toBeNull();
  });

  it("iptal dönem sonuna kadar çekmez, başarısız çekim PAST_DUE olur", () => {
    const ended = new Date(NOW.getTime() - 1_000);
    expect(
      decideCommerceRenewal(
        {
          status: "ACTIVE",
          listPriceMinor: 9_900,
          expiresAt: ended,
          currentPeriodEnd: ended,
          cancelAtPeriodEnd: true,
        },
        NOW,
      ),
    ).toEqual({ kind: "cancel" });
    const due = decideCommerceRenewal(
      {
        status: "TRIALING",
        listPriceMinor: 9_900,
        expiresAt: ended,
        currentPeriodEnd: ended,
        paytrUtoken: "u",
        paytrCtoken: "c",
      },
      NOW,
    );
    expect(due).toEqual({ kind: "charge", amountMinor: 9_900 });
    const failed = applyCommerceRenewalResult(
      {
        status: "TRIALING",
        listPriceMinor: 9_900,
        expiresAt: ended,
        currentPeriodEnd: ended,
        dunningAttempts: 0,
      },
      { kind: "past_due" },
      false,
      NOW,
    );
    expect(failed?.status).toBe("PAST_DUE");
    expect(failed?.dunningAttempts).toBe(1);
    expect(
      decideCommerceRenewal(
        {
          status: "PAST_DUE",
          listPriceMinor: 9_900,
          expiresAt: ended,
          currentPeriodEnd: ended,
          paytrUtoken: "u",
          paytrCtoken: "c",
          dunningAttempts: 1,
          lastDunningAt: new Date(NOW.getTime() - 60_000),
        },
        NOW,
      ),
    ).toEqual({ kind: "skip" });
    expect(COMMERCE_DUNNING_INTERVAL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("üçüncü başarısız denemede yenileme kapanır", () => {
    const ended = new Date(NOW.getTime() - 1_000);
    const closed = applyCommerceRenewalResult(
      {
        status: "PAST_DUE",
        listPriceMinor: 9_900,
        expiresAt: ended,
        currentPeriodEnd: ended,
        dunningAttempts: 2,
      },
      { kind: "charge", amountMinor: 9_900 },
      false,
      NOW,
    );
    expect(closed?.status).toBe("CANCELED");
    expect(closed?.dunningAttempts).toBe(3);
  });

  it("kayıtlı kart hash'i iFrame sırasından ayrıdır", () => {
    const token = buildPaytrStoredCardToken({
      merchantId: "1",
      userIp: "203.0.113.8",
      merchantOid: "RN1",
      email: "a@yetkin.test",
      paymentAmount: "9900",
      testMode: "0",
      merchantKey: "key",
      merchantSalt: "salt",
    });
    expect(token.length).toBeGreaterThan(10);
  });
});

describe("e-ticaret deneme ürün yüzeyi", () => {
  /**
   * B-05 (Tedavi): aynı teklifin dört yüzeyde dört farklı tonu vardı. Artık tek
   * doğruluk kaynağı var: `lib/pricing/trial-copy.ts`. Test bu yüzden **dizgi
   * dondurmaz**, SSOT bağını doğrular: yüzeyler metni kendileri yazmaz, okur.
   */
  it("vitrin kartı ve lisans ekranı deneme metnini tek SSOT'tan okur", () => {
    const trial = readSrc("lib/pricing/trial-copy.ts");
    // SSOT sözleşmesi: süre, doğrulama etiketi, yenileme, iptal, dürüstlük.
    expect(trial).toContain("TRIAL_PERIOD_DAYS = 30");
    expect(trial).toContain("TRIAL_HEADLINE");
    expect(trial).toContain("TRIAL_VERIFY_LINE");
    expect(trial).toContain("trialRenewalLine");
    expect(trial).toContain("TRIAL_CANCEL_LINE");
    expect(trial).toContain("TRIAL_HONESTY_LINE");
    expect(trial).toContain("otomatik yenilenir");
    expect(trial).toContain("Dönem sonu iptali tek tıkla");

    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    // Vitrin metni kendi yazmaz; SSOT'tan okur.
    expect(vitrine).toContain("TRIAL_HEADLINE");
    expect(vitrine).toContain("TRIAL_VERIFY_LINE");
    expect(vitrine).toContain("TRIAL_CANCEL_LINE");
    expect(vitrine).toContain("trialRenewalLine");
    // Satır ücreti katalogdan okunur, sabit yazılmaz.
    expect(vitrine).toContain("commerceEntry");

    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("data-vitrine-trial-headline");
    expect(page).toContain("TRIAL_HONESTY_NOTE");
    expect(page).toContain("buildCitizenRegisterHref");
    expect(page).toContain("isProtectedCitizenPath");
    expect(page).toContain("vitrineHref");

    // Rehber de aynı SSOT'tan beslenir.
    const workflows = readSrc("lib/rehber/workflows.ts");
    expect(workflows).toContain("lib/pricing/trial-copy");
    expect(workflows).toContain("TRIAL_HONESTY_LINE");
  });

  it("lisans ekranı çekilecek gerçek tutarı ve dürüst buton metnini gösterir", () => {
    const ui = readSrc("components/commerce/license-checkout.tsx");
    expect(ui).toContain("data-license-trial-offer");
    expect(ui).toContain("data-license-trial-amount");
    expect(ui).toContain("COMMERCE_TRIAL_VERIFY_MINOR");
    // B-05: deneme metni SSOT'tan gelir; ekran kendi cümlesini yazmaz.
    expect(ui).toContain("from \"@/lib/pricing/trial-copy\"");
    expect(ui).toContain("TRIAL_VERIFY_LINE");
    expect(ui).toContain("TRIAL_HONESTY_LINE");
    expect(ui).toContain("copy.trialCta");
    expect(ui).toContain("copy.trialRenewalLabel");
    // TRIALING: "Lisans açık" değil kalan gün.
    expect(ui).toContain("data-license-trial-state");
    expect(ui).toContain("copy.trialRemaining");
    expect(ui).toContain("copy.trialKeepNote");
    // Deneme kapalıysa gerekçe görünür (sessiz tam fiyat yok).
    expect(ui).toContain("data-license-trial-blocked");
    // Kopya sözlüğünde dürüst buton metni.
    const copy = readSrc("lib/copy/sen-voice/magazam.ts");
    expect(copy).toContain("30 Gün Ücretsiz Başlat (1 TL Doğrulama)");
    expect(copy).toContain("Ücretsiz Deneme Aktif — Kalan ${days} Gün");
    expect(copy).toContain("sembolik kart doğrulama bedeli");
  });

  it("kokpit şeridi TRIALING durumunda kalan günü basar, 'Lisans açık' demez", () => {
    const cockpit = readSrc("components/commerce/os-cockpit.tsx");
    expect(cockpit).toContain("data-license-band-trial");
    expect(cockpit).toContain("Kalan ${trialDays} Gün");
    expect(cockpit).toContain("30 Gün Ücretsiz Başlat →");
    const band = readSrc("lib/commerce/os-license-band.ts");
    expect(band).toContain("trial:");
    expect(band).toContain("trialDaysLeft");
  });

  it("mağaza özet ve lisans sayfası TRIALING'i 'Lisans açık' basmaz", () => {
    for (const page of [
      "app/(kernel)/magazam/[storeId]/page.tsx",
      "app/(kernel)/magazam/[storeId]/lisans/page.tsx",
    ]) {
      const source = readSrc(page);
      expect(source, page).toContain('license.value.status === "TRIALING"');
      expect(source, page).toContain("copy.trialRemaining");
    }
  });

  it("hukuk metni 'iade edilir' vaadi vermez; 1 TL'nin akıbetini açıklar", () => {
    const legal = readSrc("lib/copy/legal-launch.ts");
    expect(legal).toContain("1,00 TL sembolik kart doğrulama bedeli tahsil edilir");
    expect(legal).toContain("bu bedel bakiyeye yazılmaz");
    expect(legal).toContain("iadesi taahhüt edilmez");
    expect(legal).not.toContain("1 TL kart doğrulama ile");
    // Erken dönüş kuralı da hukuk metninde.
    expect(legal).toContain("kalan deneme günleri yanmaz");
  });
});

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import {
  buildPaytrTokenHash,
  PAYTR_IFRAME_MAX_INSTALLMENT,
  PAYTR_IFRAME_NO_INSTALLMENT,
} from "@/lib/kernel/payments/paytr/checkout";
import { juniorLessonAccessForPlan } from "@/lib/junior/catalog";
import {
  completeJuniorCheckout,
  JUNIOR_CHECKOUT_NOT_CONFIGURED,
  saveJuniorElectives,
} from "@/lib/junior/checkout";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_PILOT_SHELF_LINE,
  JUNIOR_YEARLY_LIST_PRICE_MINOR,
} from "@/lib/junior/limits";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import {
  buildJuniorPaytrSeal,
  JUNIOR_PAYTR_BASKET_NAME,
  JUNIOR_PAYTR_TEST_CREDENTIALS,
  juniorPaytrCredentialsAllowSale,
} from "@/lib/junior/paytr";
import {
  chargeJuniorTestPos,
  juniorElectiveCardLabel,
  juniorElectiveCardState,
  juniorPlanExpiry,
  JUNIOR_PLAN_CODE,
  JUNIOR_POS_PROVIDER,
  normalizeElectiveSelection,
} from "@/lib/junior/plan";
import {
  createJuniorProfile,
  readJuniorHome,
  readJuniorLesson,
  submitJuniorTell,
  switchJuniorGrade,
} from "@/lib/junior/service";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

const NOW = new Date("2026-10-05T12:00:00+03:00");
const PARENT = "parent-plan";

const INVOICE = {
  fullName: "Ayse Yilmaz",
  tckn: "10000000146",
  phone: "5551112233",
  address: "Ataturk Mahallesi Deneme Sokak No 1",
  pan: "4355084355084358",
  expireMonth: "12",
  expireYear: "30",
  cvc: "123",
  holder: "Ayse Yilmaz",
  ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
};

function told(): LlmGatewayResult {
  return {
    text: JSON.stringify({
      onTopic: true,
      praised: "Payın üstte olduğunu söyledin.",
      missing: "Paydanın bütünü böldüğünü de ekle.",
      advice: "Pay üstte, payda altta. Bunu bir kez daha anlat.",
      score: 80,
    }),
    model: "gemini-3.8-live",
    provider: "gemini",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  };
}

async function seedActivePlan(store: ReturnType<typeof createMemoryJuniorStore>) {
  await store.saveActiveSubscription({
    userId: PARENT,
    status: "ACTIVE",
    planCode: JUNIOR_PLAN_CODE,
    listPriceMinor: JUNIOR_YEARLY_LIST_PRICE_MINOR,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: "JRSEEDED01",
    cardLast4: "0000",
    invoiceName: "Ayse Yilmaz",
    invoiceTckn: "10000000146",
    invoicePhone: "5551112233",
    invoiceAddress: "Ataturk Mahallesi Deneme Sokak No 1",
    electiveQuota: JUNIOR_ELECTIVE_QUOTA,
    gradeSwitchRights: 1,
    activatedAt: NOW,
    expiresAt: juniorPlanExpiry(NOW),
  });
}

async function openProfile(store: ReturnType<typeof createMemoryJuniorStore>) {
  const created = await createJuniorProfile(
    store,
    PARENT,
    { nickname: "Ege", grade: 6, birthYear: 2015, consent: true },
    NOW,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

describe("Junior seçmeli ders kotası", () => {
  it("en fazla üç katalog dersi seçilir; dördüncü kart kota dolu der", () => {
    expect(JUNIOR_ELECTIVE_QUOTA).toBe(3);
    expect(JUNIOR_YEARLY_LIST_PRICE_MINOR).toBe(549_900);
    const three = normalizeElectiveSelection(["jr_06_ing", "jr_06_alm", "jr_06_fra"]);
    expect(three.ok).toBe(true);
    expect(normalizeElectiveSelection(["jr_06_ing", "jr_06_ing"]).ok).toBe(false);
    expect(normalizeElectiveSelection(["jr_06_mat"]).ok).toBe(false);
    expect(normalizeElectiveSelection(["jr_06_ing", "jr_06_alm", "jr_06_fra", "jr_06_kod"]).ok).toBe(false);
    expect(juniorElectiveCardState("jr_06_ing", ["jr_06_ing", "jr_06_alm", "jr_06_fra"])).toBe("chosen");
    expect(juniorElectiveCardState("jr_06_kod", ["jr_06_ing", "jr_06_alm", "jr_06_fra"])).toBe("full");
    expect(juniorElectiveCardLabel("full")).toBe("Paket Kotası Doldu / Düzenle");
    expect(juniorElectiveCardState("jr_06_kod", ["jr_06_ing"])).toBe("open");
  });

  it("profil seçimini üçe kilitler", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const saved = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_ing", "jr_06_siyer", "jr_06_kod"],
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }
    expect(saved.data.profile.selectedElectives).toEqual(["jr_06_ing", "jr_06_siyer", "jr_06_kod"]);
    const overflow = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_ing", "jr_06_alm", "jr_06_fra", "jr_06_kod"],
    });
    expect(overflow.ok).toBe(false);
    const stranger = await saveJuniorElectives(store, "baska", {
      profileId: profile.id,
      slugs: ["jr_06_ing"],
    });
    expect(stranger.ok).toBe(false);
  });
});

describe("Junior yıllık paket kasası", () => {
  it("mağaza hattı bağlanana kadar checkout not_configured döner; kart abonelik yazmaz", async () => {
    const store = createMemoryJuniorStore();
    await openProfile(store);
    const paid = await completeJuniorCheckout(store, PARENT, INVOICE, NOW);
    expect(paid).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_NOT_CONFIGURED });
    expect(await store.getSubscription(PARENT)).toBeNull();
  });

  it("açık paket çekirdek dersleri ve seçilen üç seçmeli dersi açar", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const picked = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_ing", "jr_06_alm", "jr_06_fra"],
    });
    expect(picked.ok).toBe(true);
    expect(readJuniorLesson("jr_06_mat-2").access).toBe("locked");
    expect(juniorLessonAccessForPlan("jr_06_mat-2", { active: false, selectedElectives: [] })).toBe("locked");

    await seedActivePlan(store);
    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.selectedElectives).toEqual(["jr_06_ing", "jr_06_alm", "jr_06_fra"]);
    expect(home.courses.filter((course) => course.track === "elective").map((course) => course.slug)).toEqual([
      "jr_06_ing",
      "jr_06_alm",
      "jr_06_fra",
    ]);
    const math = home.courses.find((course) => course.slug === "jr_06_mat");
    expect(math?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    const english = home.courses.find((course) => course.slug === "jr_06_ing");
    expect(english?.lessons.every((lesson) => lesson.access === "free")).toBe(true);

    const plan = { active: true, selectedElectives: ["jr_06_ing", "jr_06_alm", "jr_06_fra"] };
    expect(readJuniorLesson("jr_06_mat-2", plan).access).toBe("free");
    expect(readJuniorLesson("jr_06_ing-2", plan).access).toBe("free");
    expect(readJuniorLesson("jr_06_kod-2", plan).access).toBe("locked");

    const opened = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: "jr_06_mat-2",
        mode: "write",
        text: "Kesir bir bütünün eşit parçasıdır. Pay üstte, payda altta durur.",
        now: NOW,
      },
      { invoke: async () => told() },
    );
    expect(opened.ok).toBe(true);

    const outside = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: "jr_06_kod-2",
        mode: "write",
        text: "Komutlar yukarıdan aşağı okunur. Sıra değişirse sonuç değişir.",
        now: NOW,
      },
      { invoke: async () => told() },
    );
    expect(outside.ok).toBe(false);
  });

  it("süresi geçmiş kart ve geçmiş paket kilidi açmaz", () => {
    const expiredCard = chargeJuniorTestPos({
      pan: "4355 0843 5508 4358",
      expireMonth: "01",
      expireYear: "26",
      cvc: "000",
      holder: "Ayse Yilmaz",
      now: NOW,
    });
    expect(expiredCard.ok).toBe(false);
    const fresh = chargeJuniorTestPos({
      pan: "5406675406675403",
      expireMonth: "12",
      expireYear: "30",
      cvc: "000",
      holder: "Ayse Yilmaz",
      now: NOW,
    });
    expect(fresh.ok).toBe(true);
    if (fresh.ok) {
      expect(fresh.last4).toBe("5403");
    }
  });
});

describe("Junior PayTR mühür", () => {
  it("fatura ve sepet PayTR iFrame ve Direct hash sırasına girer", () => {
    const seal = buildJuniorPaytrSeal({
      now: NOW,
      last4: "4358",
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      userName: INVOICE.fullName,
      userPhone: "5551112233",
      userAddress: INVOICE.address,
    });
    const basket = JSON.parse(Buffer.from(seal.userBasket, "base64").toString("utf8")) as unknown;
    expect(basket).toEqual([[JUNIOR_PAYTR_BASKET_NAME, "5499.00", 1]]);
    expect(seal.paymentAmount).toBe(String(JUNIOR_YEARLY_LIST_PRICE_MINOR));
    expect(seal.directAmount).toBe("5499.00");
    expect(seal.userName).toBe(INVOICE.fullName);
    expect(seal.userPhone).toBe("5551112233");
    expect(seal.iframeToken).toBe(
      buildPaytrTokenHash({
        credentials: JUNIOR_PAYTR_TEST_CREDENTIALS,
        userIp: "127.0.0.1",
        merchantOid: seal.merchantOid,
        email: "veli@yetkin.ai",
        paymentAmount: seal.paymentAmount,
        userBasket: seal.userBasket,
        noInstallment: PAYTR_IFRAME_NO_INSTALLMENT,
        maxInstallment: PAYTR_IFRAME_MAX_INSTALLMENT,
        currency: "TL",
        testMode: "1",
      }),
    );
    const directHashStr =
      `${JUNIOR_PAYTR_TEST_CREDENTIALS.merchantId}127.0.0.1${seal.merchantOid}veli@yetkin.ai` +
      `${seal.directAmount}card0TL10`;
    const directToken = createHmac("sha256", JUNIOR_PAYTR_TEST_CREDENTIALS.merchantKey)
      .update(directHashStr + JUNIOR_PAYTR_TEST_CREDENTIALS.merchantSalt)
      .digest("base64");
    expect(seal.directToken).toBe(directToken);
    expect(seal.iframeUrl.startsWith("https://www.paytr.com/odeme/guvenli/")).toBe(true);
    expect(seal.iframeUrl.includes("/")).toBe(true);
    expect(seal.merchantOid).toMatch(/^JR[A-Z0-9]+4358$/);
  });
});

describe("Junior sınıf seçici", () => {
  it("başka sınıf seçilmez; raf 6. sınıf metninde kalır", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const blocked = await switchJuniorGrade(store, PARENT, { profileId: profile.id, grade: 7 }, NOW);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toBe(JUNIOR_PILOT_SHELF_LINE);
    }

    await seedActivePlan(store);
    const homeBefore = await readJuniorHome(store, PARENT, NOW);
    expect(homeBefore.courses.find((course) => course.slug === "jr_06_mat")?.title).toBe("6. Sınıf Matematik");

    const switched = await switchJuniorGrade(store, PARENT, { profileId: profile.id, grade: 7 }, NOW);
    expect(switched.ok).toBe(false);
    if (!switched.ok) {
      expect(switched.error).toBe(JUNIOR_PILOT_SHELF_LINE);
    }
    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.courses.every((course) => course.grade === 6)).toBe(true);
    expect(home.courses.find((course) => course.slug === "jr_06_mat")?.title).toBe("6. Sınıf Matematik");
    expect(home.courses.find((course) => course.slug === "jr_06_ing")?.title).not.toContain("7. Sınıf");
    expect((await store.getProfile(PARENT, profile.id))?.grade).toBe(6);
  });

  it("deneme mağaza anahtarı satışı açmaz", () => {
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: JUNIOR_PAYTR_TEST_CREDENTIALS,
        productionLocked: false,
        runtimeMode: "live",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: {
          merchantId: "000000",
          merchantKey: "live-looking-key",
          merchantSalt: "live-looking-salt",
          testMode: false,
        },
        productionLocked: false,
        runtimeMode: "live",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: {
          merchantId: "111111",
          merchantKey: "live-looking-key",
          merchantSalt: "live-looking-salt",
          testMode: false,
        },
        productionLocked: true,
        runtimeMode: "live",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: {
          merchantId: "111111",
          merchantKey: "live-looking-key",
          merchantSalt: "live-looking-salt",
          testMode: true,
        },
        productionLocked: false,
        runtimeMode: "live",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: null,
        productionLocked: false,
        runtimeMode: "unconfigured",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: {
          merchantId: "111111",
          merchantKey: "live-looking-key",
          merchantSalt: "live-looking-salt",
          testMode: false,
        },
        productionLocked: false,
        runtimeMode: "live",
      }),
    ).toBe(true);
  });
});

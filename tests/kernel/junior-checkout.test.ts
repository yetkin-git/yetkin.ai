import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import {
  buildPaytrTokenHash,
  PAYTR_IFRAME_MAX_INSTALLMENT,
  PAYTR_IFRAME_NO_INSTALLMENT,
} from "@/lib/kernel/payments/paytr/checkout";
import { JUNIOR_ELECTIVE_COURSES } from "@/lib/junior/elective-catalog";
import {
  juniorCourseSealed,
  juniorCourseShelves,
  juniorElectivePicks,
  juniorLessonAccessForPlan,
  juniorPaidElectives,
  stampJuniorPlanAccess,
} from "@/lib/junior/catalog";
import { juniorPlanCoversLesson } from "@/lib/junior/enter";
import { isJuniorCheckoutLocked } from "@/lib/kernel/security/junior-gate";
import {
  completeJuniorCheckout,
  JUNIOR_CHECKOUT_AUDIT_MESSAGE,
  JUNIOR_CHECKOUT_CLOSED_MESSAGE,
  JUNIOR_CHECKOUT_GUARDIAN_REQUIRED,
  JUNIOR_CHECKOUT_REFUSED_MESSAGE,
  saveJuniorElectives,
  type JuniorCheckoutOrderDraft,
} from "@/lib/junior/checkout";
import { JUNIOR_GUARDIAN_NOTICE } from "@/lib/junior/guardian-notice";
import { fulfillJuniorLicenseFromClearedOrder, JUNIOR_LICENSE_ORDER_PURPOSE } from "@/lib/junior/paytr-license-bridge";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import {
  JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
  JUNIOR_ELECTIVE_PRICE_EXCLUDED,
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_ELECTIVE_SLUGS,
  JUNIOR_PILOT_SHELF_LINE,
} from "@/lib/junior/limits";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import {
  buildJuniorPaytrSeal,
  JUNIOR_PAYTR_BASKET_NAME,
  juniorPaytrCredentialsAllowSale,
  juniorPaytrSaleGate,
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
  openJuniorLessonPlay,
  readJuniorHome,
  readJuniorLesson,
  submitJuniorTell,
  switchJuniorGrade,
} from "@/lib/junior/service";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

/** Abonelik satırı stand-in. Ürün kodu bu sayıyı taşımaz; katalog tohumu SQL'dedir. */
const JUNIOR_FIXTURE_PRICE_MINOR = 549_900;
const JUNIOR_MAT_CORE_KEYS = Array.from({ length: 26 }, (_, index) => `jr_06_mat-${index + 1}`);
/** Raf hafta sırası. Kesir şeridi uzunluk dersinden önce gelir. */
const JUNIOR_MAT_SHELF_KEYS = [
  "jr_06_mat-1",
  "jr_06_mat-2",
  "jr_06_mat-3",
  "jr_06_mat-4",
  "jr_06_mat-5",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-10",
  "jr_06_mat-6",
  ...Array.from({ length: 16 }, (_, index) => `jr_06_mat-${index + 11}`),
];
/** Çekirdek raf sırası. 13. hafta bağında takvim `28` sonra `18` yazar; raf dosya indeksine düşer. */
const JUNIOR_FEN_CORE_KEYS = [
  "jr_06_fen-1",
  "jr_06_fen-2",
  "jr_06_fen-9",
  "jr_06_fen-21",
  "jr_06_fen-10",
  "jr_06_fen-22",
  "jr_06_fen-23",
  "jr_06_fen-24",
  "jr_06_fen-25",
  "jr_06_fen-26",
  "jr_06_fen-16",
  "jr_06_fen-27",
  "jr_06_fen-18",
  "jr_06_fen-28",
  "jr_06_fen-29",
  "jr_06_fen-30",
  "jr_06_fen-31",
  "jr_06_fen-32",
  "jr_06_fen-33",
  "jr_06_fen-34",
  "jr_06_fen-12",
  "jr_06_fen-35",
  "jr_06_fen-19",
  "jr_06_fen-36",
  "jr_06_fen-20",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;
const JUNIOR_FEN_GAP_KEYS = [
  "jr_06_fen-3",
  "jr_06_fen-4",
  "jr_06_fen-5",
  "jr_06_fen-6",
  "jr_06_fen-7",
  "jr_06_fen-8",
  "jr_06_fen-11",
  "jr_06_fen-13",
  "jr_06_fen-14",
  "jr_06_fen-15",
  "jr_06_fen-17",
] as const;
/** Çekirdek raf sırası. Hafta sırasıdır. Aynı aralıkta bölüm eki kartı düşürmez; `13` tema 1'in içinde durur. */
const JUNIOR_TURKCE_CORE_KEYS = [
  "jr_06_turkce-1",
  "jr_06_turkce-2",
  "jr_06_turkce-3",
  "jr_06_turkce-4",
  "jr_06_turkce-13",
  "jr_06_turkce-8",
  "jr_06_turkce-9",
  "jr_06_turkce-10",
  "jr_06_turkce-12",
  "jr_06_turkce-5",
  "jr_06_turkce-7",
  "jr_06_turkce-11",
  "jr_06_turkce-6",
  "jr_06_turkce-14",
  "jr_06_turkce-15",
  "jr_06_turkce-16",
  "jr_06_turkce-17",
  "jr_06_turkce-18",
  "jr_06_turkce-19",
  "jr_06_turkce-20",
] as const;
const JUNIOR_TURKCE_SHELL_KEYS = [
  "jr_06_turkce-21",
  "jr_06_turkce-22",
  "jr_06_turkce-23",
  "jr_06_turkce-24",
  "jr_06_turkce-25",
  "jr_06_turkce-26",
] as const;
/**
 * Çekirdek raf sırası. Hafta sırasıdır. Aynı başlangıç ve bitiş haftası yoktur.
 * Haftası 0 olan dört park ders saatli kartların sonuna düşer ve hafta başlığı taşımaz.
 */
const JUNIOR_SOSYAL_CORE_KEYS = [
  "jr_06_sosyal-1",
  "jr_06_sosyal-21",
  "jr_06_sosyal-9",
  "jr_06_sosyal-10",
  "jr_06_sosyal-11",
  "jr_06_sosyal-22",
  "jr_06_sosyal-5",
  "jr_06_sosyal-23",
  "jr_06_sosyal-7",
  "jr_06_sosyal-16",
  "jr_06_sosyal-18",
  "jr_06_sosyal-4",
  "jr_06_sosyal-17",
  "jr_06_sosyal-24",
  "jr_06_sosyal-12",
  "jr_06_sosyal-15",
  "jr_06_sosyal-25",
  "jr_06_sosyal-8",
  "jr_06_sosyal-20",
  "jr_06_sosyal-26",
  "jr_06_sosyal-2",
  "jr_06_sosyal-3",
  "jr_06_sosyal-6",
  "jr_06_sosyal-13",
] as const;
const JUNIOR_SOSYAL_PARK_KEYS = [
  "jr_06_sosyal-2",
  "jr_06_sosyal-3",
  "jr_06_sosyal-6",
  "jr_06_sosyal-13",
] as const;
const JUNIOR_SOSYAL_GAP_KEYS = ["jr_06_sosyal-14", "jr_06_sosyal-19"] as const;
/**
 * Çekirdek raf sırası. Hafta sırasıdır. Aynı başlangıç ve bitiş haftası yoktur.
 * Ücretsiz kapı dosya sırasındaki `-1` değil, 1–5. haftadaki `jr_06_ing_main-20` dir.
 */
const JUNIOR_ING_CORE_KEYS = [
  "jr_06_ing_main-20",
  "jr_06_ing_main-2",
  "jr_06_ing_main-4",
  "jr_06_ing_main-7",
  "jr_06_ing_main-17",
  "jr_06_ing_main-5",
  "jr_06_ing_main-16",
  "jr_06_ing_main-6",
  "jr_06_ing_main-9",
  "jr_06_ing_main-10",
  "jr_06_ing_main-11",
  "jr_06_ing_main-1",
  "jr_06_ing_main-3",
  "jr_06_ing_main-8",
] as const;
const JUNIOR_ING_WEEK_HEADINGS = [
  "1–5. Hafta: Hak, sorumluluk ve sınıf kuralı",
  "6–8. Hafta: Family Life: ailem ve have got",
  "9–11. Hafta: Family Life: evde rutin işler",
  "12–14. Hafta: Sunny, rainy ve cold",
  "15–16. Hafta: Çevreyi korumak ve recycling",
  "17–18. Hafta: Şehirde şu an ne oluyor",
  "22–24. Hafta: In, on, under, behind ve next to",
  "25–28. Hafta: Universe: gökyüzü ve there is",
  "29–31. Hafta: Universe: gelecekte will",
  "32–33. Hafta: World and Culture: ülke ve milliyet",
  "34. Hafta: World and Culture: kutlama ve yemek",
  "35–36. Hafta: Daily routines ve saati söylemek",
  "37–38. Hafta: Yiyecek, içecek ve likes, dislikes",
  "40. Hafta: Happy, anxious ve scared",
] as const;
const JUNIOR_ING_SHELL_KEYS = [
  "jr_06_ing_main-21",
  "jr_06_ing_main-22",
  "jr_06_ing_main-23",
  "jr_06_ing_main-24",
  "jr_06_ing_main-25",
  "jr_06_ing_main-26",
  "jr_06_ing_main-27",
] as const;
const JUNIOR_ING_GAP_KEYS = [
  "jr_06_ing_main-12",
  "jr_06_ing_main-13",
  "jr_06_ing_main-14",
  "jr_06_ing_main-15",
  "jr_06_ing_main-18",
  "jr_06_ing_main-19",
] as const;
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
    listPriceMinor: JUNIOR_FIXTURE_PRICE_MINOR,
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
    {
      nickname: "Ege",
      grade: 6,
      birthYear: 2015,
      consent: true,
      consentVersion: JUNIOR_GUARDIAN_NOTICE.version,
      guardianBirthYear: 1990,
    },
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
    const limits = readFileSync(join(process.cwd(), "lib/junior/limits.ts"), "utf8");
    expect(limits).not.toContain("549_900");
    expect(limits).not.toContain("5.499 TL");
    const three = normalizeElectiveSelection(["jr_06_alm", "jr_06_fra", "jr_06_siyer"]);
    expect(three.ok).toBe(true);
    expect(normalizeElectiveSelection(["jr_06_alm", "jr_06_alm"]).ok).toBe(false);
    expect(normalizeElectiveSelection(["jr_06_mat"]).ok).toBe(false);
    expect(normalizeElectiveSelection(["jr_06_ing"])).toEqual({
      ok: false,
      error: JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
    });
    expect(juniorElectivePicks().map((pick) => pick.slug)).not.toContain("jr_06_ing");
    expect(juniorElectivePicks()).toHaveLength(5);
    expect(normalizeElectiveSelection(["jr_06_alm", "jr_06_fra", "jr_06_siyer", "jr_06_kod"]).ok).toBe(false);
    expect(juniorElectiveCardState("jr_06_alm", ["jr_06_alm", "jr_06_fra", "jr_06_siyer"])).toBe("chosen");
    expect(juniorElectiveCardState("jr_06_kod", ["jr_06_alm", "jr_06_fra", "jr_06_siyer"])).toBe("full");
    expect(juniorElectiveCardLabel("full")).toBe("Paket Kotası Doldu / Düzenle");
    expect(juniorElectiveCardState("jr_06_kod", ["jr_06_alm"])).toBe("open");
  });

  it("profil seçimini üçe kilitler; mühürsüz seçmeli pakete eklenmez", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const ready = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm", "jr_06_siyer", "jr_06_kod"],
    });
    expect(ready.ok).toBe(true);
    expect((await store.getProfile(PARENT, profile.id))?.selectedElectives).toEqual([
      "jr_06_alm",
      "jr_06_siyer",
      "jr_06_kod",
    ]);
    const overflow = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm", "jr_06_fra", "jr_06_siyer", "jr_06_kod"],
    });
    expect(overflow.ok).toBe(false);
    const draft = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_ing"],
    });
    expect(draft.ok).toBe(false);
    const stranger = await saveJuniorElectives(store, "baska", {
      profileId: profile.id,
      slugs: ["jr_06_alm"],
    });
    expect(stranger.ok).toBe(false);
  });

  it("111 çekirdek junior-yearly ile açılır; mühürlü seçmeli seçilince açılır, jr_06_ing fiyat dışıdır", { timeout: 30_000 }, async () => {
    const shelves = juniorCourseShelves(NOW);
    const coreKeys = shelves
      .filter((course) => course.track === "core")
      .flatMap((course) => course.lessons.map((lesson) => lesson.key));
    expect(coreKeys).toHaveLength(111);
    const yearly = { active: true, selectedElectives: [] as const };
    for (const key of coreKeys) {
      expect(juniorLessonAccessForPlan(key, yearly), key).toBe("free");
      expect(readJuniorLesson(key, yearly).access, key).toBe("free");
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
    }

    const electiveLessons = JUNIOR_ELECTIVE_COURSES.flatMap((course) =>
      course.lessons.map((lesson) => ({ course, key: lesson.key })),
    );
    expect(electiveLessons).toHaveLength(12);
    for (const row of electiveLessons) {
      const priced = !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(row.course.slug);
      // Her kartın 1. konusu ücretsiz açılıştır; paket kapısı onu kilitlemez.
      const opener = row.key.endsWith("-1");
      const expected = priced || opener ? "free" : "locked";
      expect(juniorCourseSealed(row.course), row.key).toBe(true);
      expect(
        juniorLessonAccessForPlan(row.key, { active: true, selectedElectives: [row.course.slug] }),
        row.key,
      ).toBe(expected);
      expect(readJuniorLesson(row.key, { active: true, selectedElectives: [row.course.slug] }).access, row.key).toBe(
        expected,
      );
      expect(juniorPlanCoversLesson(row.key, true, [row.course.slug]), row.key).toBe(priced);
    }

    const stamped = stampJuniorPlanAccess(shelves, {
      active: true,
      selectedElectives: [...JUNIOR_ELECTIVE_SLUGS],
    });
    for (const course of stamped.filter((row) => row.track === "elective")) {
      const priced = !(JUNIOR_ELECTIVE_PRICE_EXCLUDED as readonly string[]).includes(course.slug);
      expect(
        course.lessons.every((lesson, index) => lesson.access === (priced || index === 0 ? "free" : "locked")),
        course.slug,
      ).toBe(true);
    }

    expect([...JUNIOR_ELECTIVE_PRICE_EXCLUDED]).toEqual(["jr_06_ing"]);
    expect(juniorElectivePicks().map((pick) => pick.slug)).not.toContain("jr_06_ing");
    const ingCore = shelves.find((course) => course.slug === "jr_06_ing_main");
    expect(ingCore?.track).toBe("core");
    expect(ingCore?.lessons).toHaveLength(14);
    expect(ingCore?.lessons.every((lesson) => lesson.key.startsWith("jr_06_ing_main-"))).toBe(true);
    expect(normalizeElectiveSelection(["jr_06_ing"])).toEqual({
      ok: false,
      error: JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
    });

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    for (const slug of JUNIOR_ELECTIVE_SLUGS) {
      const saved = await saveJuniorElectives(store, PARENT, { profileId: profile.id, slugs: [slug] });
      expect(saved.ok, slug).toBe(slug !== "jr_06_ing");
    }
    expect((await store.getProfile(PARENT, profile.id))?.selectedElectives).toEqual(["jr_06_arp"]);
    await seedActivePlan(store);
    await store.setSelectedElectives(PARENT, profile.id, ["jr_06_alm"]);
    const subscription = await store.getSubscription(PARENT);
    expect(subscription?.planCode).toBe(JUNIOR_PLAN_CODE);
    expect(subscription?.status).toBe("ACTIVE");
    expect(subscription?.electiveQuota).toBe(3);
    expect(JUNIOR_ELECTIVE_QUOTA).toBe(3);
    expect((await store.getProfile(PARENT, profile.id))?.selectedElectives).toEqual(["jr_06_alm"]);
    expect(juniorPaidElectives(["jr_06_alm"])).toEqual(["jr_06_alm"]);

    let calls = 0;
    const toldAttempt = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: "jr_06_alm-1",
        mode: "write",
        text: "Guten Tag demek günün selamıdır. Bunu bir kez daha söylerim.",
        now: NOW,
      },
      {
        invoke: async () => {
          calls += 1;
          return told();
        },
      },
    );
    expect(calls).toBe(1);
    expect(toldAttempt.ok).toBe(true);
  });
});

describe("Junior yıllık paket kasası", () => {
  it("mağaza hattı bağlanana kadar checkout not_configured döner; kart abonelik yazmaz", async () => {
    const store = createMemoryJuniorStore();
    await openProfile(store);
    const paid = await completeJuniorCheckout(store, PARENT, INVOICE, NOW, { env: {} as NodeJS.ProcessEnv });
    expect(paid).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_CLOSED_MESSAGE });
    expect(await store.getSubscription(PARENT)).toBeNull();
  });

  it("açık paket çekirdek dersleri açar; mühürsüz seçmeli ücretli kapsamda açılmaz", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const picked = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm", "jr_06_fra", "jr_06_siyer"],
    });
    expect(picked.ok).toBe(true);
    expect(readJuniorLesson("jr_06_mat-2").access).toBe("locked");
    expect(juniorLessonAccessForPlan("jr_06_mat-2", { active: false, selectedElectives: [] })).toBe("locked");

    // Doğrudan yazılmış (mühürsüz) seçim ücretli pakette açılmaz (T-06).
    await store.setSelectedElectives(PARENT, profile.id, ["jr_06_alm"]);
    await seedActivePlan(store);
    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.selectedElectives).toEqual(["jr_06_alm"]);
    expect(home.courses.filter((course) => course.track === "elective").map((course) => course.slug)).toEqual([
      "jr_06_alm",
    ]);
    const math = home.courses.find((course) => course.slug === "jr_06_mat");
    expect(math?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    // Seçmeli kartta 1. konu kamuya açık, 2. konu paket + seçimle açılır.
    const german = home.courses.find((course) => course.slug === "jr_06_alm");
    expect(german?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_alm-2", true, ["jr_06_alm"])).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_mat-2", true, [])).toBe(true);

    const plan = { active: true, selectedElectives: ["jr_06_alm"] };
    expect(readJuniorLesson("jr_06_mat-2", plan).access).toBe("free");
    expect(readJuniorLesson("jr_06_ing-2", plan).access).toBe("locked");
    expect(
      readJuniorLesson("jr_06_ing-2", { active: true, selectedElectives: ["jr_06_ing"] }).access,
    ).toBe("locked");
    // Seçili olmayan seçmeli kartın 2. konusu kilitli; 1. konusu kamuya açık kalır.
    expect(readJuniorLesson("jr_06_kod-1", plan).access).toBe("free");
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
        lessonKey: "jr_06_ing-2",
        mode: "write",
        text: "Good morning sabah selamıdır. Bunu bir kez daha söylerim.",
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

const IFRAME_CREDENTIALS = {
  merchantId: "111111",
  merchantKey: "iframe-key",
  merchantSalt: "iframe-salt",
  testMode: true,
} as const;

const OPEN_SANDBOX_ENV = {
  JUNIOR_CHECKOUT_OPEN: "1",
  NODE_ENV: "test",
  PAYTR_MERCHANT_ID: "111111",
  PAYTR_MERCHANT_KEY: "iframe-key",
  PAYTR_MERCHANT_SALT: "iframe-salt",
  PAYTR_SANDBOX: "1",
} as NodeJS.ProcessEnv;

const CHECKOUT_BODY = {
  ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
  guardianConsentAccepted: true as const,
  guardianNoticeVersion: JUNIOR_GUARDIAN_NOTICE.version,
  billing: CHECKOUT_BILLING_PAYLOAD,
};

describe("Junior PayTR iframe kapısı", () => {
  it("onay tikleri yokken sipariş kurmaz ve abonelik yazmaz", async () => {
    const store = createMemoryJuniorStore();
    let called = false;
    const paid = await completeJuniorCheckout(store, PARENT, {}, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "k1",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => {
          called = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });
    expect(called).toBe(false);
    expect(paid.ok).toBe(false);
    if (!paid.ok) {
      expect(paid.status).toBe(400);
      expect(paid.error).toBe(
        "Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu ve dijital içeriğin anında ifası için açık rıza zorunludur.",
      );
    }
    expect(await store.getSubscription(PARENT)).toBeNull();
  });

  it("veli tiki yokken PayTR çağrılmaz", async () => {
    const store = createMemoryJuniorStore();
    let called = false;
    const paid = await completeJuniorCheckout(
      store,
      PARENT,
      { ...CHECKOUT_BODY, guardianConsentAccepted: false },
      NOW,
      {
        env: OPEN_SANDBOX_ENV,
        email: "veli@yetkin.ai",
        userIp: "127.0.0.1",
        idempotencyKey: "k1",
        ports: {
          readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
          placeOrder: async () => {
            called = true;
            return { ok: false, status: 503, error: "olmamalı" };
          },
        },
      },
    );
    expect(called).toBe(false);
    expect(paid).toEqual({ ok: false, status: 400, error: JUNIOR_CHECKOUT_GUARDIAN_REQUIRED });
  });

  it("onaylı istek iframe döndürür; paket CLEARED köprüsüne kadar yazılmaz", async () => {
    const store = createMemoryJuniorStore();
    const drafts: JuniorCheckoutOrderDraft[] = [];
    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "k1",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async (draft) => {
          drafts.push(draft);
          return {
            ok: true,
            kind: "iframe",
            merchantOid: "JRCHECKOUT01",
            iframeUrl: "https://www.paytr.com/odeme/guvenli/ornek-token",
          };
        },
      },
    });
    expect(paid.ok).toBe(true);
    if (!paid.ok) {
      return;
    }
    expect(paid.data.embedIframe).toBe(true);
    expect(paid.data.iframeUrl).toBe("https://www.paytr.com/odeme/guvenli/ornek-token");
    expect(paid.data.status).toBe("PENDING");
    expect(drafts[0]?.amountMinor).toBe(JUNIOR_FIXTURE_PRICE_MINOR);
    expect(drafts[0]?.consent.consentVersion).toBe(CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion);
    expect(await store.getSubscription(PARENT)).toBeNull();

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-1",
        userId: PARENT,
        merchantOid: "JRCHECKOUT01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
    );
    expect(fulfilled.applied).toBe(true);
    expect(ledger.snapshot(PARENT).amountMinor).toBe(0);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe(JUNIOR_PLAN_CODE);
    expect(row?.appliedMerchantOids).toEqual(["JRCHECKOUT01"]);
    expect(row?.invoiceTckn).toBe("withheld");
  });

  it("açık kasada CLEARED junior-yearly, çocuğun 26 matematik dersini raftan açar", async () => {
    expect(JUNIOR_PLAN_CODE).toBe("junior-yearly");
    expect(isJuniorCheckoutLocked(OPEN_SANDBOX_ENV)).toBe(false);
    expect(juniorPaytrSaleGate(OPEN_SANDBOX_ENV)).toBe("sandbox");

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    expect(profile.grade).toBe(6);
    const lockedHome = await readJuniorHome(store, PARENT, NOW);
    const lockedMath = lockedHome.courses.find((course) => course.slug === "jr_06_mat");
    expect(lockedMath?.track).toBe("core");
    expect(lockedMath?.lessons.map((lesson) => lesson.key)).toEqual(JUNIOR_MAT_SHELF_KEYS);
    expect(lockedMath?.lessons[0]?.access).toBe("free");
    expect(lockedMath?.lessons.slice(1).every((lesson) => lesson.access === "locked")).toBe(true);
    const blocked = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_mat-26",
    });
    expect(blocked.ok).toBe(false);

    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "mat-shelf",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => ({
          ok: true,
          kind: "iframe",
          merchantOid: "JRMATSHELF01",
          iframeUrl: "https://www.paytr.com/odeme/guvenli/mat-shelf",
        }),
      },
    });
    expect(paid.ok).toBe(true);
    expect(await store.getSubscription(PARENT)).toBeNull();
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-mat-shelf",
        userId: PARENT,
        merchantOid: "JRMATSHELF01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
      NOW,
    );
    expect(fulfilled.applied).toBe(true);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.userId).toBe(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe("junior-yearly");
    expect(row).not.toHaveProperty("lessonKeys");
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.id).toBe(profile.id);
    expect(home.selected?.grade).toBe(6);
    const math = home.courses.find((course) => course.slug === "jr_06_mat");
    expect(math?.track).toBe("core");
    expect(math?.lessons.map((lesson) => lesson.key)).toEqual(JUNIOR_MAT_SHELF_KEYS);
    expect(math?.lessons.every((lesson) => lesson.access === "free")).toBe(true);

    for (const key of JUNIOR_MAT_CORE_KEYS) {
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("free");
      const opened = await openJuniorLessonPlay(store, {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: key,
      });
      expect(opened.ok, key).toBe(true);
    }

    const legacy = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_mat-27",
    });
    expect(legacy.ok).toBe(false);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
  });

  it("açık kasada CLEARED junior-yearly, çocuğun 27 fen dersini çekirdek raftan açar", async () => {
    expect(JUNIOR_PLAN_CODE).toBe("junior-yearly");
    expect(JUNIOR_FEN_CORE_KEYS).toHaveLength(27);
    expect(isJuniorCheckoutLocked(OPEN_SANDBOX_ENV)).toBe(false);
    expect(juniorPaytrSaleGate(OPEN_SANDBOX_ENV)).toBe("sandbox");

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    expect(profile.grade).toBe(6);
    const lockedHome = await readJuniorHome(store, PARENT, NOW);
    const lockedFen = lockedHome.courses.find((course) => course.slug === "jr_06_fen");
    expect(lockedFen?.track).toBe("core");
    expect(lockedFen?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_FEN_CORE_KEYS]);
    expect(lockedFen?.lessons[0]?.access).toBe("free");
    expect(lockedFen?.lessons[0]?.key).toBe("jr_06_fen-1");
    expect(lockedFen?.lessons.slice(1).every((lesson) => lesson.access === "locked")).toBe(true);
    const blocked = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_fen-38",
    });
    expect(blocked.ok).toBe(false);

    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "fen-shelf",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => ({
          ok: true,
          kind: "iframe",
          merchantOid: "JRFENSHELF01",
          iframeUrl: "https://www.paytr.com/odeme/guvenli/fen-shelf",
        }),
      },
    });
    expect(paid.ok).toBe(true);
    expect(await store.getSubscription(PARENT)).toBeNull();
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-fen-shelf",
        userId: PARENT,
        merchantOid: "JRFENSHELF01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
      NOW,
    );
    expect(fulfilled.applied).toBe(true);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.userId).toBe(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe("junior-yearly");
    expect(row).not.toHaveProperty("lessonKeys");
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.id).toBe(profile.id);
    expect(home.selected?.grade).toBe(6);
    const fen = home.courses.find((course) => course.slug === "jr_06_fen");
    expect(fen?.track).toBe("core");
    expect(fen?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_FEN_CORE_KEYS]);
    expect(fen?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(fen?.lessons.findIndex((lesson) => lesson.key === "jr_06_fen-18")).toBeLessThan(
      fen?.lessons.findIndex((lesson) => lesson.key === "jr_06_fen-28") ?? -1,
    );

    for (const key of JUNIOR_FEN_CORE_KEYS) {
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("free");
      const opened = await openJuniorLessonPlay(store, {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: key,
      });
      expect(opened.ok, key).toBe(true);
    }

    for (const key of JUNIOR_FEN_GAP_KEYS) {
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("missing");
    }
    const gap = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_fen-3",
    });
    expect(gap.ok).toBe(false);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
  });

  it("açık kasada CLEARED junior-yearly, çocuğun 20 Türkçe dersini çekirdek raftan açar", async () => {
    expect(JUNIOR_PLAN_CODE).toBe("junior-yearly");
    expect(JUNIOR_TURKCE_CORE_KEYS).toHaveLength(20);
    expect(JUNIOR_TURKCE_SHELL_KEYS).toHaveLength(6);
    expect(isJuniorCheckoutLocked(OPEN_SANDBOX_ENV)).toBe(false);
    expect(juniorPaytrSaleGate(OPEN_SANDBOX_ENV)).toBe("sandbox");

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    expect(profile.grade).toBe(6);
    const lockedHome = await readJuniorHome(store, PARENT, NOW);
    const lockedTurkce = lockedHome.courses.find((course) => course.slug === "jr_06_turkce");
    expect(lockedTurkce?.track).toBe("core");
    expect(lockedTurkce?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_TURKCE_CORE_KEYS]);
    expect(lockedTurkce?.lessons[0]?.access).toBe("free");
    expect(lockedTurkce?.lessons[0]?.key).toBe("jr_06_turkce-1");
    expect(lockedTurkce?.lessons[1]?.key).toBe("jr_06_turkce-2");
    expect(lockedTurkce?.lessons[1]?.weekHeading).toContain("(B Bölümü)");
    expect(lockedTurkce?.lessons[4]?.key).toBe("jr_06_turkce-13");
    expect(lockedTurkce?.lessons[4]?.weekHeading).toContain("(C Bölümü)");
    expect(lockedTurkce?.lessons.slice(1).every((lesson) => lesson.access === "locked")).toBe(true);
    const blocked = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_turkce-20",
    });
    expect(blocked.ok).toBe(false);

    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "turkce-shelf",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => ({
          ok: true,
          kind: "iframe",
          merchantOid: "JRTURKSHELF01",
          iframeUrl: "https://www.paytr.com/odeme/guvenli/turkce-shelf",
        }),
      },
    });
    expect(paid.ok).toBe(true);
    expect(await store.getSubscription(PARENT)).toBeNull();
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-turkce-shelf",
        userId: PARENT,
        merchantOid: "JRTURKSHELF01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
      NOW,
    );
    expect(fulfilled.applied).toBe(true);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.userId).toBe(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe("junior-yearly");
    expect(row).not.toHaveProperty("lessonKeys");
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.id).toBe(profile.id);
    expect(home.selected?.grade).toBe(6);
    const turkce = home.courses.find((course) => course.slug === "jr_06_turkce");
    expect(turkce?.track).toBe("core");
    expect(turkce?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_TURKCE_CORE_KEYS]);
    expect(turkce?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(turkce?.lessons.some((lesson) => (JUNIOR_TURKCE_SHELL_KEYS as readonly string[]).includes(lesson.key))).toBe(
      false,
    );

    for (const key of JUNIOR_TURKCE_CORE_KEYS) {
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("free");
      const opened = await openJuniorLessonPlay(store, {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: key,
      });
      expect(opened.ok, key).toBe(true);
    }

    for (const key of JUNIOR_TURKCE_SHELL_KEYS) {
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("missing");
    }
    const shell = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_turkce-21",
    });
    expect(shell.ok).toBe(false);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
  });

  it("açık kasada CLEARED junior-yearly, çocuğun 24 sosyal dersini çekirdek raftan açar", async () => {
    expect(JUNIOR_PLAN_CODE).toBe("junior-yearly");
    expect(JUNIOR_SOSYAL_CORE_KEYS).toHaveLength(24);
    expect(JUNIOR_SOSYAL_PARK_KEYS).toHaveLength(4);
    expect(JUNIOR_SOSYAL_GAP_KEYS).toHaveLength(2);
    expect(isJuniorCheckoutLocked(OPEN_SANDBOX_ENV)).toBe(false);
    expect(juniorPaytrSaleGate(OPEN_SANDBOX_ENV)).toBe("sandbox");

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    expect(profile.grade).toBe(6);
    const lockedHome = await readJuniorHome(store, PARENT, NOW);
    const lockedSosyal = lockedHome.courses.find((course) => course.slug === "jr_06_sosyal");
    expect(lockedSosyal?.track).toBe("core");
    expect(lockedSosyal?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_SOSYAL_CORE_KEYS]);
    expect(lockedSosyal?.lessons[0]?.access).toBe("free");
    expect(lockedSosyal?.lessons[0]?.key).toBe("jr_06_sosyal-1");
    expect(lockedSosyal?.lessons[0]?.weekHeading).toBe(
      "1–4. Hafta: Grup ve rolün zamanla değişmesi · Kültürel bağ ve millî değer",
    );
    expect(lockedSosyal?.lessons[1]?.key).toBe("jr_06_sosyal-21");
    expect(lockedSosyal?.lessons[1]?.weekHeading).toBe("4–6. Hafta: Toplumsal sorunu müzakere");
    const timedHeadings = lockedSosyal?.lessons.slice(0, 20).map((lesson) => lesson.weekHeading);
    expect(timedHeadings?.every((heading) => typeof heading === "string" && heading.includes(". Hafta:"))).toBe(true);
    expect(new Set(timedHeadings).size).toBe(20);
    expect(timedHeadings?.filter((heading) => heading?.includes("Bölümü"))).toEqual([]);
    expect(lockedSosyal?.lessons.slice(-4).map((lesson) => lesson.key)).toEqual([...JUNIOR_SOSYAL_PARK_KEYS]);
    expect(lockedSosyal?.lessons.slice(-4).every((lesson) => lesson.weekHeading == null)).toBe(true);
    expect(lockedSosyal?.lessons.slice(1).every((lesson) => lesson.access === "locked")).toBe(true);
    const blocked = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_sosyal-13",
    });
    expect(blocked.ok).toBe(false);

    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "sosyal-shelf",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => ({
          ok: true,
          kind: "iframe",
          merchantOid: "JRSOSSHELF01",
          iframeUrl: "https://www.paytr.com/odeme/guvenli/sosyal-shelf",
        }),
      },
    });
    expect(paid.ok).toBe(true);
    expect(await store.getSubscription(PARENT)).toBeNull();
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-sosyal-shelf",
        userId: PARENT,
        merchantOid: "JRSOSSHELF01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
      NOW,
    );
    expect(fulfilled.applied).toBe(true);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.userId).toBe(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe("junior-yearly");
    expect(row).not.toHaveProperty("lessonKeys");
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.id).toBe(profile.id);
    expect(home.selected?.grade).toBe(6);
    const sosyal = home.courses.find((course) => course.slug === "jr_06_sosyal");
    expect(sosyal?.track).toBe("core");
    expect(sosyal?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_SOSYAL_CORE_KEYS]);
    expect(sosyal?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(sosyal?.lessons.slice(-4).map((lesson) => lesson.key)).toEqual([...JUNIOR_SOSYAL_PARK_KEYS]);

    for (const key of JUNIOR_SOSYAL_CORE_KEYS) {
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("free");
      const opened = await openJuniorLessonPlay(store, {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: key,
      });
      expect(opened.ok, key).toBe(true);
    }

    for (const key of JUNIOR_SOSYAL_GAP_KEYS) {
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("missing");
    }
    const gap = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_sosyal-14",
    });
    expect(gap.ok).toBe(false);
    const gap19 = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_sosyal-19",
    });
    expect(gap19.ok).toBe(false);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
  });

  it("açık kasada CLEARED junior-yearly, çocuğun 14 İngilizce dersini çekirdek raftan açar", async () => {
    expect(JUNIOR_PLAN_CODE).toBe("junior-yearly");
    expect(JUNIOR_ING_CORE_KEYS).toHaveLength(14);
    expect(JUNIOR_ING_SHELL_KEYS).toHaveLength(7);
    expect(JUNIOR_ING_GAP_KEYS).toHaveLength(6);
    expect(
      JUNIOR_MAT_CORE_KEYS.length +
        JUNIOR_FEN_CORE_KEYS.length +
        JUNIOR_TURKCE_CORE_KEYS.length +
        JUNIOR_ING_CORE_KEYS.length +
        JUNIOR_SOSYAL_CORE_KEYS.length,
    ).toBe(111);
    expect(isJuniorCheckoutLocked(OPEN_SANDBOX_ENV)).toBe(false);
    expect(juniorPaytrSaleGate(OPEN_SANDBOX_ENV)).toBe("sandbox");

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    expect(profile.grade).toBe(6);
    expect(readJuniorLesson("jr_06_ing_main-20").access).toBe("free");
    expect(readJuniorLesson("jr_06_ing_main-1").access).toBe("locked");
    expect(readJuniorLesson("jr_06_ing_main-2").access).toBe("locked");
    const lockedHome = await readJuniorHome(store, PARENT, NOW);
    const lockedIng = lockedHome.courses.find((course) => course.slug === "jr_06_ing_main");
    expect(lockedIng?.track).toBe("core");
    expect(lockedIng?.title).toBe("6. Sınıf İngilizce");
    expect(lockedIng?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_ING_CORE_KEYS]);
    expect(lockedIng?.lessons.map((lesson) => lesson.weekHeading)).toEqual([...JUNIOR_ING_WEEK_HEADINGS]);
    expect(lockedIng?.lessons[0]?.access).toBe("free");
    expect(lockedIng?.lessons[0]?.key).toBe("jr_06_ing_main-20");
    expect(lockedIng?.lessons[1]?.key).toBe("jr_06_ing_main-2");
    expect(lockedIng?.lessons[11]?.key).toBe("jr_06_ing_main-1");
    expect(new Set(lockedIng?.lessons.map((lesson) => lesson.weekHeading)).size).toBe(14);
    expect(lockedIng?.lessons.every((lesson) => lesson.weekHeading?.includes(". Hafta:"))).toBe(true);
    expect(lockedIng?.lessons.some((lesson) => lesson.weekHeading?.includes("Bölümü"))).toBe(false);
    expect(
      lockedIng?.lessons.some((lesson) =>
        (JUNIOR_ING_SHELL_KEYS as readonly string[]).includes(lesson.key),
      ),
    ).toBe(false);
    expect(
      lockedIng?.lessons.some((lesson) => (JUNIOR_ING_GAP_KEYS as readonly string[]).includes(lesson.key)),
    ).toBe(false);
    expect(lockedIng?.lessons.slice(1).every((lesson) => lesson.access === "locked")).toBe(true);
    const blocked = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_ing_main-8",
    });
    expect(blocked.ok).toBe(false);

    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "ing-shelf",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => ({
          ok: true,
          kind: "iframe",
          merchantOid: "JRINGSHELF01",
          iframeUrl: "https://www.paytr.com/odeme/guvenli/ing-shelf",
        }),
      },
    });
    expect(paid.ok).toBe(true);
    expect(await store.getSubscription(PARENT)).toBeNull();
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const ledger = createMemoryLedgerStore([{ userId: PARENT, amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }]);
    const fulfilled = await fulfillJuniorLicenseFromClearedOrder(
      store,
      {
        id: "order-ing-shelf",
        userId: PARENT,
        merchantOid: "JRINGSHELF01",
        amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
        currencyCode: "TRY",
        status: "CLEARED",
        createdAt: NOW,
        purpose: JUNIOR_LICENSE_ORDER_PURPOSE,
        consentVersion: CHECKOUT_LEGAL_CONSENT_PAYLOAD.consentVersion,
        distanceContractAccepted: true,
        digitalImmediatePerformanceAccepted: true,
      },
      ledger,
      NOW,
    );
    expect(fulfilled.applied).toBe(true);
    expect(fulfilled.reason).toBe("settled");
    const row = await store.getSubscription(PARENT);
    expect(row?.userId).toBe(PARENT);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.planCode).toBe("junior-yearly");
    expect(row).not.toHaveProperty("lessonKeys");
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);

    const home = await readJuniorHome(store, PARENT, NOW);
    expect(home.plan.status).toBe("ACTIVE");
    expect(home.selected?.id).toBe(profile.id);
    expect(home.selected?.grade).toBe(6);
    const ing = home.courses.find((course) => course.slug === "jr_06_ing_main");
    expect(ing?.track).toBe("core");
    expect(ing?.lessons.map((lesson) => lesson.key)).toEqual([...JUNIOR_ING_CORE_KEYS]);
    expect(ing?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(JUNIOR_ING_CORE_KEYS).not.toContain("jr_06_ing-1");
    // Fiyat dışı seçmeli kart artık erişilemez değil: 1. konu kamuya açık tanıtım,
    // 2. konu paket vaadine girmediği için kilitli kalır.
    expect(readJuniorLesson("jr_06_ing-1").access).toBe("free");
    expect(juniorPlanCoversLesson("jr_06_ing-1", true, ["jr_06_ing"])).toBe(false);
    expect(readJuniorLesson("jr_06_ing-2", { active: true, selectedElectives: [] }).access).toBe("locked");
    expect(readJuniorLesson("jr_06_ing-2", { active: true, selectedElectives: ["jr_06_ing"] }).access).toBe(
      "locked",
    );

    for (const key of JUNIOR_ING_CORE_KEYS) {
      expect(juniorPlanCoversLesson(key, true, []), key).toBe(true);
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("free");
      const opened = await openJuniorLessonPlay(store, {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: key,
      });
      expect(opened.ok, key).toBe(true);
    }

    for (const key of JUNIOR_ING_SHELL_KEYS) {
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("missing");
    }
    for (const key of JUNIOR_ING_GAP_KEYS) {
      expect(readJuniorLesson(key, { active: true, selectedElectives: [] }).access, key).toBe("missing");
    }
    const shell = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_ing_main-21",
    });
    expect(shell.ok).toBe(false);
    const gap = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_ing_main-12",
    });
    expect(gap.ok).toBe(false);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
  });

  it("denetim hesabı açık kasada da nakit satırı yazmaz", async () => {
    const store = createMemoryJuniorStore();
    let called = false;
    const paid = await completeJuniorCheckout(store, "11111111-1111-4111-8111-111111111111", CHECKOUT_BODY, NOW, {
      env: OPEN_SANDBOX_ENV,
      email: "yapinet360@gmail.com",
      userIp: "127.0.0.1",
      idempotencyKey: "k1",
      actor: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "yapinet360@gmail.com",
        emailConfirmedAt: "2026-01-01T00:00:00.000Z",
      },
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => {
          called = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });
    expect(called).toBe(false);
    expect(paid).toEqual({ ok: false, status: 403, error: JUNIOR_CHECKOUT_AUDIT_MESSAGE });
    expect(await store.getSubscription("11111111-1111-4111-8111-111111111111")).toBeNull();
  });

  it("boş PayTR üçlüsü ve sandbox anahtarı canlı satış açmaz", async () => {
    const store = createMemoryJuniorStore();
    let called = false;
    const ports = {
      readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
      placeOrder: async () => {
        called = true;
        return { ok: false as const, status: 503 as const, error: "olmamalı" };
      },
    };
    const base = {
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "k1",
      ports,
    };
    const empty = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: { JUNIOR_CHECKOUT_OPEN: "1", NODE_ENV: "production" } as NodeJS.ProcessEnv,
      ...base,
    });
    expect(called).toBe(false);
    expect(empty).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_REFUSED_MESSAGE });
    expect(await store.getSubscription(PARENT)).toBeNull();

    const sandboxKey = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: {
        JUNIOR_CHECKOUT_OPEN: "1",
        NODE_ENV: "production",
        PAYTR_MERCHANT_ID: "111111",
        PAYTR_MERCHANT_KEY: "sandbox-key",
        PAYTR_MERCHANT_SALT: "live-looking-salt",
      } as NodeJS.ProcessEnv,
      ...base,
    });
    expect(called).toBe(false);
    expect(sandboxKey).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_REFUSED_MESSAGE });
  });

  it("üretimde deneme mağaza iframe açmaz", async () => {
    const store = createMemoryJuniorStore();
    let called = false;
    const paid = await completeJuniorCheckout(store, PARENT, CHECKOUT_BODY, NOW, {
      env: { ...OPEN_SANDBOX_ENV, NODE_ENV: "production" },
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      idempotencyKey: "k1",
      ports: {
        readPrice: async () => ({ amountMinor: JUNIOR_FIXTURE_PRICE_MINOR }),
        placeOrder: async () => {
          called = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });
    expect(called).toBe(false);
    expect(paid).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_REFUSED_MESSAGE });
  });
});

describe("Junior PayTR mühür", () => {
  it("sepet kernel iFrame hash sırasına girer", () => {
    const seal = buildJuniorPaytrSeal({
      now: NOW,
      idempotencyKey: "4358",
      email: "veli@yetkin.ai",
      userIp: "127.0.0.1",
      userName: INVOICE.fullName,
      amountMinor: JUNIOR_FIXTURE_PRICE_MINOR,
      credentials: IFRAME_CREDENTIALS,
    });
    const basket = JSON.parse(Buffer.from(seal.userBasket, "base64").toString("utf8")) as unknown;
    expect(basket).toEqual([[JUNIOR_PAYTR_BASKET_NAME, "5499.00", 1]]);
    expect(seal.paymentAmount).toBe(String(JUNIOR_FIXTURE_PRICE_MINOR));
    expect(seal.userName).toBe(INVOICE.fullName);
    expect(seal.iframeToken).toBe(
      buildPaytrTokenHash({
        credentials: IFRAME_CREDENTIALS,
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
    expect(seal.iframeUrl.startsWith("https://www.paytr.com/odeme/guvenli/")).toBe(true);
    expect(seal.merchantOid).toMatch(/^JR[A-Z0-9]+4358$/);
    expect(JSON.stringify(seal)).not.toContain("directToken");
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
        credentials: {
          merchantId: "000000",
          merchantKey: "sandbox-key",
          merchantSalt: "sandbox-salt",
          testMode: true,
        },
        productionLocked: false,
        runtimeMode: "live",
      }),
    ).toBe(false);
    expect(
      juniorPaytrCredentialsAllowSale({
        credentials: {
          merchantId: "111111",
          merchantKey: "sandbox-key",
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

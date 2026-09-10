import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createAcademyGrantPurchase, hasAcademyPlayerAccess } from "@/lib/academy/access";
import {
  academyStorefrontAccess,
  hasCommercialAcademyEnrolment,
  isAcademyGrantPurchase,
} from "@/lib/academy/enrolment";
import { overlayStudioGrowthLearnerBoard } from "@/lib/academy/catalog-learner";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import {
  resolveAcademyAntreHeroCta,
  resolveAcademyCatalogCardCta,
  academyCheckoutHref,
} from "@/lib/academy/storefront-cta";
import {
  ACADEMY_CARD_OFFER_PATHS,
  ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
  ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN,
  academyCardOfferPaths,
} from "@/lib/academy/purchase-path";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";

const NOW = new Date("2026-08-27T12:00:00.000Z");

function settledPurchase(overrides: Partial<AcademyPurchaseRecord> = {}): AcademyPurchaseRecord {
  return {
    id: "pur_1",
    userId: "citizen-1",
    courseId: "ac_python_temel",
    priceLockId: "lock_1",
    amountMinor: toAmountMinor(49_000),
    currencyCode: SETTLEMENT_CURRENCY,
    status: "SETTLED",
    settledAt: new Date("2026-08-01T00:00:00.000Z"),
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("akademi ticari kayıt vs lab bağışı", () => {
  it("sa_grant satırı satın alınmış sayılmaz", () => {
    const grant = createAcademyGrantPurchase("admin-1", "ac_python_temel", NOW);
    expect(isAcademyGrantPurchase(grant)).toBe(true);
    expect(hasCommercialAcademyEnrolment(grant, NOW)).toBe(false);
    expect(academyStorefrontAccess(grant, NOW)).toBe("unenrolled");
    expect(hasCommercialAcademyEnrolment(null, NOW)).toBe(false);
  });

  it("harçlı SETTLED lisans Antre'de enrolled basar; süresi dolmuş expired'dır", () => {
    const live = settledPurchase();
    expect(isAcademyGrantPurchase(live)).toBe(false);
    expect(hasCommercialAcademyEnrolment(live, NOW)).toBe(true);
    expect(academyStorefrontAccess(live, NOW)).toBe("enrolled");

    const expired = settledPurchase({ settledAt: new Date("2020-01-01T00:00:00.000Z") });
    expect(hasCommercialAcademyEnrolment(expired, NOW)).toBe(false);
    expect(academyStorefrontAccess(expired, NOW)).toBe("expired");
  });
});

describe("Antre hero CTA — Satın Al vs Derse başla", () => {
  it("satın alınmadıysa fiyat yalnız CTA içinde compact durur", () => {
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺890,00",
      purchasable: true,
      session: true,
      courseSlug: "python-temel",
      loginHref: "/login?next=%2Facademy%2Fpython-temel",
    });
    expect(hero.priceLabel).toBe("₺890");
    expect(hero.priceLabel).not.toContain("KDV dahil");
    expect(hero.action).toBe("buy");
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺890"));
    expect(hero.primaryLabel).toBe("Eğitimi Satın Al — ₺890");
    expect(hero.primaryLabel).toContain("Eğitimi Satın Al");
    expect(hero.primaryLabel).not.toBe(ACADEMY_SEN.player.openCta);
    expect(hero.primaryHref).toBe("/academy/python-temel#satin-al");
  });

  it("oturumsuz satın alma girişe düşer; Derse başla basılmaz", () => {
    const loginHref = "/login?next=%2Facademy%2F01_office_ai%23satin-al";
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺890,00",
      purchasable: true,
      session: false,
      courseSlug: "01_office_ai",
      loginHref,
    });
    expect(hero.action).toBe("buy");
    expect(hero.primaryHref).toBe(loginHref);
    expect(hero.primaryHref).toContain("%23satin-al");
    expect(hero.primaryLabel).not.toBe(ACADEMY_SEN.player.openCta);
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺890"));
    expect(academyCheckoutHref("01_office_ai")).toBe("/academy/01_office_ai#satin-al");
  });

  it("e-ticaret misafir kasası hero ile aynı giriş next'ini taşır", () => {
    const loginHref = "/login?next=%2Facademy%2F02_ecommerce_ai%23satin-al";
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺990,00",
      purchasable: true,
      session: false,
      courseSlug: "02_ecommerce_ai",
      loginHref,
    });
    expect(hero.action).toBe("buy");
    expect(hero.primaryHref).toBe(loginHref);
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺990"));
    expect(hero.primaryLabel).toBe("Eğitimi Satın Al — ₺990");
    expect(academyCheckoutHref("02_ecommerce_ai")).toBe("/academy/02_ecommerce_ai#satin-al");
  });

  it("sosyal medya misafir kasası hero ile aynı giriş next'ini taşır", () => {
    const loginHref = "/login?next=%2Facademy%2F03_social_media_ai%23satin-al";
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺890,00",
      purchasable: true,
      session: false,
      courseSlug: "03_social_media_ai",
      loginHref,
    });
    expect(hero.action).toBe("buy");
    expect(hero.primaryHref).toBe(loginHref);
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺890"));
    expect(hero.primaryLabel).toBe("Eğitimi Satın Al — ₺890");
    expect(academyCheckoutHref("03_social_media_ai")).toBe("/academy/03_social_media_ai#satin-al");
  });

  it("chatbot misafir kasası hero ile aynı giriş next'ini taşır", () => {
    const loginHref = "/login?next=%2Facademy%2F04_chatbot_nocode%23satin-al";
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺1.290,00",
      purchasable: true,
      session: false,
      courseSlug: "04_chatbot_nocode",
      loginHref,
    });
    expect(hero.action).toBe("buy");
    expect(hero.primaryHref).toBe(loginHref);
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺1.290"));
    expect(hero.primaryLabel).toBe("Eğitimi Satın Al — ₺1.290");
    expect(academyCheckoutHref("04_chatbot_nocode")).toBe("/academy/04_chatbot_nocode#satin-al");
  });

  it("prompt misafir kasası hero ile aynı giriş next'ini taşır", () => {
    const loginHref = "/login?next=%2Facademy%2F05_prompt_practice%23satin-al";
    const hero = resolveAcademyAntreHeroCta({
      access: "unenrolled",
      priceLabel: "₺490,00",
      purchasable: true,
      session: false,
      courseSlug: "05_prompt_practice",
      loginHref,
    });
    expect(hero.action).toBe("buy");
    expect(hero.primaryHref).toBe(loginHref);
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.course.heroBuyCta("₺490"));
    expect(hero.primaryLabel).toBe("Eğitimi Satın Al — ₺490");
    expect(academyCheckoutHref("05_prompt_practice")).toBe("/academy/05_prompt_practice#satin-al");
  });

  it("misafir #satin-al kartı hero CTA'yı birincil buton olarak basar", () => {
    const page = readFileSync(join(process.cwd(), "app/academy/[slug]/page.tsx"), "utf8");
    expect(page).toContain("data-academy-checkout-cta");
    expect(page).toContain("hero.primaryHref");
    expect(page).toContain("hero.primaryLabel");
    expect(page).toContain("copy.loginCta");
    expect(page).toContain("paytrCheckout");
  });

  it("hero bağımsız ₺ satırı basmaz; fiyat yalnız satın al CTA içindedir", () => {
    const hero = readFileSync(join(process.cwd(), "components/academy/course-hero-actions.tsx"), "utf8");
    expect(hero).toContain("buyPriced");
    expect(hero).toContain("data-academy-hero-status");
    expect(hero).not.toMatch(/<p[\s\S]*data-academy-hero-price/);
    expect(hero).toContain("data-academy-hero-price");
    const purchase = readFileSync(join(process.cwd(), "components/academy/purchase-button.tsx"), "utf8");
    expect(purchase).toContain("stripZeroKurusFromTryLabel");
    expect(purchase).toContain("data-checkout-pay-cta");
  });

  it("satın alındıysa fiyat Erişim Açık olur ve CTA /oyna açar", () => {
    const hero = resolveAcademyAntreHeroCta({
      access: "enrolled",
      priceLabel: "₺890,00",
      purchasable: true,
      continueCompletedCount: 0,
      continuePhase: "lesson",
      session: true,
      courseSlug: "python-temel",
      loginHref: "/login",
    });
    expect(hero.priceLabel).toBe(ACADEMY_SEN.course.accessOpen);
    expect(hero.action).toBe("play");
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.player.openCta);
    expect(hero.primaryHref).toBe("/academy/python-temel/oyna");
  });

  it("yarım müfredatta kaldığın yerden devam et basar", () => {
    const hero = resolveAcademyAntreHeroCta({
      access: "enrolled",
      priceLabel: "₺890,00",
      purchasable: true,
      continueCompletedCount: 3,
      continuePhase: "lesson",
      session: true,
      courseSlug: "python-temel",
      loginHref: "/login",
    });
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.player.resumeCta);
    expect(hero.action).toBe("play");
  });
});

describe("vitrin kartı CTA", () => {
  it("satın alınmadıysa Satın Al ve fiyat; purchased /oyna ve Erişim Açık", () => {
    const locked = resolveAcademyCatalogCardCta({
      slug: "python-temel",
      owned: false,
      priceLabel: "₺890,00",
    });
    expect(locked.cta).toBe(ACADEMY_SEN.catalog.cardCtaBuy);
    expect(locked.cta).not.toMatch(/₺/);
    expect(locked.priceLabel).toBe("₺890");
    expect(locked.priceCaption).toBe(ACADEMY_SEN.catalog.vatInclusiveHint);
    expect(locked.href).toBe("/academy/python-temel");
    expect(locked.priceLabel).not.toBe(ACADEMY_SEN.course.accessOpen);
    expect(locked.cta).not.toContain(ACADEMY_SEN.course.accessOpen);

    const owned = resolveAcademyCatalogCardCta({
      slug: "python-temel",
      owned: true,
      learnerStatus: "continue",
      priceLabel: "₺890,00",
    });
    expect(owned.cta).toBe(ACADEMY_SEN.catalog.statusContinue);
    expect(owned.priceLabel).toBe(ACADEMY_SEN.course.accessOpen);
    expect(owned.priceCaption).toBeNull();
    expect(owned.href).toBe("/academy/python-temel/oyna");
    for (const slug of ["fullstack-temel", "ai-temel", "ux-temel"] as const) {
      const buy = resolveAcademyCatalogCardCta({
        slug,
        owned: false,
        priceLabel: "₺1.090,00",
      });
      expect(buy.cta).toBe(ACADEMY_SEN.catalog.cardCtaBuy);
      expect(buy.priceLabel).toBe("₺1.090");
      expect(buy.priceCaption).toBe(ACADEMY_SEN.catalog.vatInclusiveHint);
      expect(buy.priceLabel).not.toBe(ACADEMY_SEN.course.accessOpen);
      expect(buy.href).toBe(`/academy/${slug}`);
      const play = resolveAcademyCatalogCardCta({
        slug,
        owned: true,
        priceLabel: "₺1.090,00",
      });
      expect(play.cta).toBe(ACADEMY_SEN.player.openCta);
      expect(play.priceLabel).toBe(ACADEMY_SEN.course.accessOpen);
      expect(play.href).toBe(`/academy/${slug}/oyna`);
    }
  });
});

describe("Super Admin lab oynatıcı — DURUM B, ticari enrolled değil", () => {
  it("sa_grant vatandaşta player açmaz; ticari enrolled değildir", () => {
    const grant = createAcademyGrantPurchase("admin-1", "ac_ai_temel", NOW);
    expect(hasCommercialAcademyEnrolment(grant, NOW)).toBe(false);
    expect(
      hasAcademyPlayerAccess(grant, { userId: "admin-1", email: "admin@yetkin.test" }, NOW),
    ).toBe(false);
  });

  it("Antre enrolled erişiminde Derse başla /oyna basar", () => {
    const hero = resolveAcademyAntreHeroCta({
      access: "enrolled",
      priceLabel: "₺590,00",
      purchasable: true,
      continueCompletedCount: 0,
      continuePhase: "lesson",
      session: true,
      courseSlug: "ai-temel",
      loginHref: "/login",
    });
    expect(hero.action).toBe("play");
    expect(hero.primaryLabel).toBe(ACADEMY_SEN.player.openCta);
    expect(hero.primaryHref).toBe("/academy/ai-temel/oyna");
    expect(hero.priceLabel).toBe(ACADEMY_SEN.course.accessOpen);
  });

  it("lab vitrin overlay büyüme kartlarını owned yapar; continue yazmaz", () => {
    const board = overlayStudioGrowthLearnerBoard(
      { ownedSlugs: [], statusBySlug: {} },
      { studio: true, growthSlugs: ACADEMY_GROWTH_SKU_SLUGS },
    );
    expect(board.ownedSlugs).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(board.statusBySlug).toEqual({});
    const ai = resolveAcademyCatalogCardCta({
      slug: "ai-temel",
      owned: true,
      priceLabel: "₺590,00",
    });
    expect(ai.cta).toBe(ACADEMY_SEN.player.openCta);
    expect(ai.href).toBe("/academy/ai-temel/oyna");
    expect(
      overlayStudioGrowthLearnerBoard(
        { ownedSlugs: ["python-temel"], statusBySlug: { "python-temel": "continue" } },
        { studio: false, growthSlugs: ACADEMY_GROWTH_SKU_SLUGS },
      ).ownedSlugs,
    ).toEqual(["python-temel"]);
  });
});

describe("kasa eğitim özeti — Aşama 1 ses mührü", () => {
  it("mühürlü ses SKU özeti basar; vitrin beş SKU karaoke taşır", () => {
    expect(ACADEMY_CARD_OFFER_PATHS.find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN,
    );
    expect(ACADEMY_TRAINING_OFFER_SUMMARY_SEALED).toBe(
      "Sesli Anlatım + Kayan Metin (Karaoke) + Sınav + Mühürlü Sertifika",
    );
    expect(ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN).toBe(
      "Yazılı Compact Dersler + Uygulamalı Senaryolar + Sınav + Mühürlü Sertifika",
    );
    expect(ACADEMY_TRAINING_OFFER_SUMMARY_SEALED).not.toMatch(/Video/i);
    expect(ACADEMY_TRAINING_OFFER_SUMMARY_WRITTEN).not.toMatch(/Sesli Akademi/i);
    expect(academyCardOfferPaths("01_office_ai").find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
    );
    expect(academyCardOfferPaths("02_ecommerce_ai").find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
    );
    expect(academyCardOfferPaths("03_social_media_ai").find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
    );
    expect(academyCardOfferPaths("04_chatbot_nocode").find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
    );
    expect(academyCardOfferPaths("05_prompt_practice").find((offer) => offer.path === "training")?.summary).toBe(
      ACADEMY_TRAINING_OFFER_SUMMARY_SEALED,
    );
  });
});

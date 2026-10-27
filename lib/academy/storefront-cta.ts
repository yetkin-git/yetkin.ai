/**
 * Akademi vitrin + Antre birincil CTA — satın alma durumunun tek çözücüsü.
 * Client-safe.
 */

import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademyCatalogLearnerStatus } from "@/lib/academy/catalog-learner";
import type { AcademyStorefrontAccess } from "@/lib/academy/enrolment";
import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";
import {
  ACADEMY_OFF201_STOREFRONT_SLUG,
  academyCourseSaleListed,
  isAcademyProductionLineSkuSlug,
} from "@/lib/academy/pilot-sku";
import { stripZeroKurusFromTryLabel } from "@/lib/kernel/money/format";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";

function academyEmptyCanonShell(slug: string): boolean {
  const row = COURSE_REGISTRY.find((item) => item.slug === slug);
  return Boolean(row && row.canon && row.lessonKeys.length === 0);
}

/** Kapalı düğmenin nedeni. Yayın, fiyat ve ses mührü aynı cümleye düşmez. */
function closedSaleCta(saleHold: string | null | undefined): string {
  const text = saleHold ?? "";
  const voice = text.includes("ses veya metin");
  const price = text.includes("fiyat");
  if (voice && price) {
    return `${ACADEMY_SEN.catalog.priceAwaiting} · ${ACADEMY_SEN.catalog.voiceSealMissing}`;
  }
  if (voice) {
    return ACADEMY_SEN.catalog.voiceSealMissing;
  }
  if (price) {
    return ACADEMY_SEN.catalog.priceAwaiting;
  }
  return ACADEMY_SEN.catalog.pricePending;
}

export const ACADEMY_CHECKOUT_HASH = "satin-al";

/** Oturumlu Antre hero "Eğitimi Satın Al" — hash kaydırmaz; PayTR iFrame tetikler. */
export const ACADEMY_HERO_PAYTR_EVENT = "yetkin:academy-hero-paytr";

export function academyCheckoutHref(courseSlug: string): string {
  return `/academy/${courseSlug.trim()}#${ACADEMY_CHECKOUT_HASH}`;
}

export type AcademyAntreHeroAction = "buy" | "play" | "exam" | "none";

export type AcademyAntreHeroCta = {
  priceLabel: string;
  primaryLabel: string | null;
  primaryHref: string | null;
  action: AcademyAntreHeroAction;
};

export type AcademyCatalogCardCta = {
  priceLabel: string;
  /** Satın alınmamış kartta fiyatın altında küçük KDV ipucu; owned'da null. */
  priceCaption: string | null;
  cta: string;
  href: string;
  /** Fiyat yok — düğme tıklanmaz. */
  ctaDisabled?: boolean;
  /** Ücretsiz ders birincilken satın alma ikincil kalır. */
  secondaryCta?: string | null;
  secondaryHref?: string | null;
};

export function academyStorefrontMoneyLabel(priceLabel: string | null | undefined): string | null {
  const trimmed = priceLabel?.trim() ?? "";
  if (!trimmed || trimmed === ACADEMY_SEN.course.accessOpen) {
    return null;
  }
  return trimmed;
}

/** Antre CTA tutarı — tamsayı lirada `,00` düşer (₺990,00 → ₺990). */
export function academyStorefrontCompactMoneyLabel(
  priceLabel: string | null | undefined,
): string | null {
  const money = academyStorefrontMoneyLabel(priceLabel);
  return money ? stripZeroKurusFromTryLabel(money) : null;
}

export function academyStorefrontVatLabel(priceLabel: string | null | undefined): string {
  const money = academyStorefrontMoneyLabel(priceLabel);
  if (!money) {
    return ACADEMY_SEN.catalog.priceMissing;
  }
  return ACADEMY_SEN.catalog.priceVatInclusive(money);
}

export function resolveAcademyAntreHeroCta(input: {
  access: AcademyStorefrontAccess;
  priceLabel: string | null;
  purchasable: boolean;
  continueCompletedCount?: number;
  continuePhase?: "lesson" | "exam" | null;
  session: boolean;
  courseSlug: string;
  loginHref: string;
}): AcademyAntreHeroCta {
  const copy = ACADEMY_SEN;
  const slug = input.courseSlug.trim();
  const courseHref = `/academy/${slug}`;
  const playHref = `${courseHref}/oyna`;
  const buyHref = input.session ? academyCheckoutHref(slug) : input.loginHref;

  if (input.access === "enrolled") {
    if (input.continuePhase === "exam") {
      return {
        priceLabel: copy.course.accessOpen,
        primaryLabel: copy.player.continueExamCta,
        primaryHref: courseHref,
        action: "exam",
      };
    }
    const started = (input.continueCompletedCount ?? 0) > 0;
    return {
      priceLabel: copy.course.accessOpen,
      primaryLabel: started ? copy.player.resumeCta : copy.player.openCta,
      primaryHref: playHref,
      action: "play",
    };
  }

  if (input.access === "expired") {
    if (!input.purchasable) {
      return {
        priceLabel: copy.course.purchasedBadge,
        primaryLabel: null,
        primaryHref: null,
        action: "none",
      };
    }
    const compact = academyStorefrontCompactMoneyLabel(input.priceLabel);
    return {
      priceLabel: compact ?? copy.course.purchasedBadge,
      primaryLabel: copy.course.renewCta,
      primaryHref: buyHref,
      action: "buy",
    };
  }

  if (!input.purchasable) {
    const compact = academyStorefrontCompactMoneyLabel(input.priceLabel);
    return {
      priceLabel: compact ?? copy.course.noPrice,
      primaryLabel: null,
      primaryHref: null,
      action: "none",
    };
  }

  const compact = academyStorefrontCompactMoneyLabel(input.priceLabel);
  return {
    priceLabel: compact ?? copy.course.noPrice,
    primaryLabel: compact ? copy.course.heroBuyCta(compact) : copy.course.heroBuyCtaIdle,
    primaryHref: buyHref,
    action: "buy",
  };
}

export function resolveAcademyCatalogCardCta(input: {
  slug: string;
  owned: boolean;
  learnerStatus?: AcademyCatalogLearnerStatus;
  priceLabel: string | null;
  purchasable?: boolean;
  /** Veritabanı `is_published`. Boş bırakılırsa bu kapı uygulanmaz. */
  isPublished?: boolean;
  /**
   * Kapalı kayıt nedeni (yayın, fiyat, ses ve metin).
   * Super Admin `/oyna` ayrıcalığı bu düğmeyi açmaz.
   */
  saleHold?: string | null;
  /**
   * Satın Al hedefi. Oturum varsa kasa çapası, yoksa giriş.
   * Boşsa kart `#satin-al` basar; çağıran oturumu kendisi keser.
   */
  buyHref?: string | null;
  /**
   * Öne çıkan (tek kahraman) kart. CTA sonuç odaklı tam cümleyi basar;
   * ileri raf kartları kısa ve jenerik kalır (vitrin ana kararı onlar değildir).
   */
  hero?: boolean;
}): AcademyCatalogCardCta {
  const copy = ACADEMY_SEN;
  if (input.owned) {
    const started = input.learnerStatus === "continue";
    return {
      priceLabel: copy.course.accessOpen,
      priceCaption: null,
      cta: started ? copy.catalog.statusContinue : copy.player.openCta,
      href: `/academy/${input.slug}/oyna`,
    };
  }
  if (academyEmptyCanonShell(input.slug)) {
    return {
      priceLabel: copy.catalog.comingSoonMeta,
      priceCaption: "Ders ve fiyat hazır değil. Tohum tutar vitrine çıkmaz.",
      cta: copy.catalog.comingSoonBadge,
      href: "",
      ctaDisabled: true,
    };
  }
  if (isAcademyProductionLineSkuSlug(input.slug) && !academyCourseSaleListed(input.slug)) {
    const money = academyStorefrontMoneyLabel(input.priceLabel);
    const display = money ? stripZeroKurusFromTryLabel(money) : null;
    return {
      priceLabel: display ?? copy.catalog.comingSoonMeta,
      priceCaption: copy.catalog.comingSoonMeta,
      cta: copy.catalog.cardCtaComingSoon,
      href: "",
    };
  }
  if (input.isPublished === false) {
    const money = academyStorefrontMoneyLabel(input.priceLabel);
    const display = money ? stripZeroKurusFromTryLabel(money) : null;
    return {
      priceLabel: display ?? copy.catalog.unpublishedBadge,
      priceCaption: null,
      cta: copy.catalog.unpublishedBadge,
      href: "",
      ctaDisabled: true,
    };
  }
  const money = academyStorefrontMoneyLabel(input.priceLabel);
  const display = money ? stripZeroKurusFromTryLabel(money) : null;
  const purchaseOpen =
    input.purchasable === true &&
    !(input.slug === ACADEMY_OFF201_STOREFRONT_SLUG && !academyCourseSaleListed(input.slug));
  if (!input.owned && !purchaseOpen) {
    return {
      priceLabel: display ?? copy.catalog.priceMissing,
      priceCaption: input.saleHold ?? null,
      cta: closedSaleCta(input.saleHold),
      href: "",
      ctaDisabled: true,
    };
  }
  if (input.slug === ACADEMY_OFF201_STOREFRONT_SLUG && !display) {
    return {
      priceLabel: copy.catalog.priceMissing,
      priceCaption: null,
      cta: copy.catalog.pricePending,
      href: "",
      ctaDisabled: true,
    };
  }
  if (display && academyCourseOffersFreePreview(input.slug)) {
    // Sonuç odaklı CTA: düğme "ne alıyorum" sorusunu yanıtlar; fiyat ikinci plandadır.
    // Metin `FocusSalePitch` "result" basamağıyla aynı işi söyler — jenerik «Satın Al» değil.
    const outcomeCta = input.hero === true
      ? copy.catalog.cardCtaOutcome(display)
      : copy.catalog.cardCtaOutcomeIdle;
    return {
      priceLabel: display,
      priceCaption: copy.catalog.vatInclusiveHint,
      cta: outcomeCta,
      href: input.buyHref ?? academyCheckoutHref(input.slug),
      secondaryCta: copy.catalog.cardCtaFreePreview,
      secondaryHref: `/academy/${input.slug}/oyna`,
    };
  }
  return {
    priceLabel: display ?? copy.catalog.priceMissing,
    priceCaption: display ? copy.catalog.vatInclusiveHint : null,
    cta: copy.catalog.cardCtaBuy,
    href: `/academy/${input.slug}`,
  };
}

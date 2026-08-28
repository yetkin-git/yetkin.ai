/**
 * Akademi vitrin + Antre birincil CTA — satın alma durumunun tek çözücüsü.
 * Client-safe.
 */

import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademyCatalogLearnerStatus } from "@/lib/academy/catalog-learner";
import type { AcademyStorefrontAccess } from "@/lib/academy/enrolment";

export type AcademyAntreHeroAction = "buy" | "play" | "exam" | "none";

export type AcademyAntreHeroCta = {
  priceLabel: string;
  primaryLabel: string | null;
  primaryHref: string | null;
  action: AcademyAntreHeroAction;
};

export type AcademyCatalogCardCta = {
  priceLabel: string;
  cta: string;
  href: string;
};

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
  const buyHref = input.session ? `${courseHref}#satin-al` : input.loginHref;

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
    return {
      priceLabel: copy.course.purchasedBadge,
      primaryLabel: null,
      primaryHref: null,
      action: "none",
    };
  }

  if (!input.purchasable) {
    return {
      priceLabel: input.priceLabel ?? copy.course.noPrice,
      primaryLabel: null,
      primaryHref: null,
      action: "none",
    };
  }

  return {
    priceLabel: input.priceLabel ?? copy.course.noPrice,
    primaryLabel: input.priceLabel
      ? copy.course.heroBuyCta(input.priceLabel)
      : copy.course.heroBuyCtaIdle,
    primaryHref: buyHref,
    action: "buy",
  };
}

export function resolveAcademyCatalogCardCta(input: {
  slug: string;
  owned: boolean;
  learnerStatus?: AcademyCatalogLearnerStatus;
  priceLabel: string | null;
}): AcademyCatalogCardCta {
  const copy = ACADEMY_SEN;
  if (input.owned) {
    const started = input.learnerStatus === "continue";
    return {
      priceLabel: copy.course.accessOpen,
      cta: started ? copy.catalog.statusContinue : copy.player.openCta,
      href: `/academy/${input.slug}/oyna`,
    };
  }
  return {
    priceLabel: input.priceLabel ?? copy.catalog.priceMissing,
    cta: input.priceLabel
      ? copy.catalog.cardCtaBuyPriced(input.priceLabel)
      : copy.catalog.cardCtaBuy,
    href: `/academy/${input.slug}`,
  };
}

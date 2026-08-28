import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  academyCourseLevelTone,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";
import type { AcademyAntreHeroAction } from "@/lib/academy/storefront-cta";
import type { Route } from "next";

/**
 * Ders detay header — fiyat veya erişim mührü + durumlu birincil CTA.
 * Satın alınmadıysa "Derse başla" basılmaz.
 */
export function CourseHeroActions({
  priceLabel,
  level,
  primaryHref,
  primaryLabel,
  primaryAction = "none",
  catalogHref,
  catalogLabel,
}: {
  priceLabel: string;
  level: AcademyCourseLevel | null;
  primaryHref?: string | null;
  primaryLabel?: string | null;
  primaryAction?: AcademyAntreHeroAction;
  catalogHref: Route;
  catalogLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
      <p
        className="font-semibold tabular-nums tracking-tight text-[var(--foreground)]"
        data-academy-hero-price=""
      >
        {priceLabel}
      </p>
      {level ? <Badge tone={academyCourseLevelTone(level)}>{level}</Badge> : null}
      {primaryHref && primaryLabel ? (
        <LinkButton
          href={primaryHref as Route}
          size="sm"
          data-academy-hero-cta={primaryAction}
        >
          {primaryLabel}
        </LinkButton>
      ) : null}
      <LinkButton href={catalogHref} variant="outline" size="sm">
        {catalogLabel}
      </LinkButton>
    </div>
  );
}

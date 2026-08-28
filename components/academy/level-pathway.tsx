"use client";

import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import type { AcademyCourseLevel } from "@/lib/academy/course-level";
import type { AcademyPathwayView } from "@/lib/academy/level-pathway";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";

export function AcademyLevelPathway({
  pathways,
  highlightLevel,
}: {
  pathways: readonly AcademyPathwayView[];
  highlightLevel?: AcademyCourseLevel | null;
}) {
  const copy = ACADEMY_SEN.pathway;
  return (
    <section
      className="space-y-4 border-t border-[var(--border)]/60 pt-5"
      aria-label={copy.title}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {copy.eyebrow}
        </p>
        <h2 className="text-base font-semibold tracking-tight text-[var(--muted)]">{copy.title}</h2>
        <p className="text-sm text-[var(--muted)]">{copy.lead}</p>
      </div>
      <ul className="space-y-4">
        {pathways.map((pathway) => (
          <li
            key={pathway.id}
            className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{pathway.title}</p>
                <p className="text-sm text-[var(--muted)]">{pathway.summary}</p>
              </div>
              {pathway.mastered ? (
                <Badge>{copy.ringComplete}</Badge>
              ) : highlightLevel ? (
                <span className="text-xs text-[var(--muted)]">{copy.highlight(highlightLevel)}</span>
              ) : (
                <span className="text-xs text-[var(--muted)]">{copy.highlightAll}</span>
              )}
            </div>
            <ol className="grid gap-3 md:grid-cols-3">
              {pathway.rings.map((ring) => {
                const level = academyCourseLevelBySlug(ring.slug);
                return (
                  <li
                    key={ring.slug}
                    className={`rounded-2xl border p-3 ${
                      ring.highlighted
                        ? "border-[var(--safir)] bg-[var(--safir-soft)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
                      {level ?? ring.level}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{ring.title}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {copy.lessons(ring.lessonCount)}
                      {ring.priceLabel ? ` · ${ring.priceLabel}` : ` · ${copy.priceMissing}`}
                    </p>
                    {ring.completed ? (
                      <p className="mt-2 text-xs text-[var(--gold)]">{copy.ringComplete}</p>
                    ) : ring.owned ? (
                      <p className="mt-2 text-xs text-[var(--safir-deep)]">{copy.yours}</p>
                    ) : ring.purchasable ? (
                      <p className="mt-2 text-xs text-[var(--emerald)]">{copy.open}</p>
                    ) : (
                      <p className="mt-2 text-xs text-[var(--amber)]">{copy.locked}</p>
                    )}
                    <div className="mt-3">
                      <LinkButton
                        href={ring.href}
                        size="sm"
                        className="min-h-11"
                        variant={ring.owned && !ring.completed ? "primary" : ring.purchasable || ring.completed ? "outline" : "ghost"}
                      >
                        {ring.owned && !ring.completed
                          ? copy.continueCta
                          : ring.completed
                            ? ACADEMY_SEN.catalog.cardCtaOpen
                            : copy.inspect}
                      </LinkButton>
                    </div>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  );
}

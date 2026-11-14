import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import type { HomeOfferState } from "@/lib/yetkinhibe/home-offer-state";

export type HomeOfferCopy = (typeof PUBLIC_SEN)["home"]["offers"];

/**
 * Ana sayfa hibe hazırlığı bölümü (V1). Yalnız `state === "preview"` iken basılır.
 * Sunucu bileşeni: istemci JavaScript'i yok. Fiyat ve freelancer bağlantısı taşımaz.
 */
export function HomeOfferSection({ state, copy }: { state: HomeOfferState; copy: HomeOfferCopy }) {
  if (state !== "preview") {
    return null;
  }
  return (
    <section className="relative mt-8 min-h-0" aria-labelledby="home-offer-heading">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {copy.eyebrow}
      </p>
      <h2
        id="home-offer-heading"
        className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
      >
        {copy.heading}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{copy.lead}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card variant="default" className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--foreground)]">{copy.selfPrepare.title}</h3>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {copy.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.selfPrepare.body}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.selfPrepare.note}</p>
          <div className="pt-4">
            <LinkButton href="/academy/01_office_ai/oyna" size="sm" variant="outline">
              {copy.selfPrepare.cta}
            </LinkButton>
          </div>
        </Card>
        <Card variant="default" className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--foreground)]">{copy.expert.title}</h3>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {copy.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.expert.body}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.expert.note}</p>
        </Card>
      </div>
    </section>
  );
}

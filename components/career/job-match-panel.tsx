import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { CareerJobMatchBoard } from "@/lib/career/job-matcher";

export function CareerJobMatchPanel({
  board,
  activeSlug,
}: {
  board: CareerJobMatchBoard;
  activeSlug: string | null;
}) {
  return (
    <section data-career-job-matches="">
      <Card eyebrow="Canlı ilan" title="Sana Uygun Kurumsal İlanlar & Hedef Koçluğu">
        {board.state === "matches" ? (
          <>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Ağırlıklı puan, YetkinCV alt beceri puanın ile ilanın ağırlık matrisinden hesaplanır.
            </p>
            <ul className="mt-4 grid gap-3">
              {board.cards.map((card) => {
                const ready = card.kind === "ready";
                const active = !ready && card.slug === activeSlug;
                return (
                  <li
                    key={card.slug}
                    data-career-job-match={card.kind}
                    data-career-job-slug={card.slug}
                    className={
                      ready
                        ? "rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"
                        : active
                          ? "rounded-2xl border border-blue-300 bg-amber-50/70 p-4 ring-2 ring-blue-600"
                          : "rounded-2xl border border-amber-200 bg-amber-50/40 p-4"
                    }
                  >
                    <p className="text-xs font-medium text-[var(--muted)]">{card.companyName}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{card.title}</p>
                    <p
                      className={
                        ready
                          ? "mt-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                          : "mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950 ring-1 ring-blue-600"
                      }
                    >
                      {card.badge}
                    </p>
                    {card.kind === "coach" ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{card.gapLine}</p>
                    ) : null}
                    <div className="mt-4">
                      {card.kind === "ready" ? (
                        <LinkButton href={card.applyPath as Route} variant="success" size="sm">
                          Hemen Başvur →
                        </LinkButton>
                      ) : (
                        <LinkButton
                          href={`/career?hedef=${card.slug}#career-roadmap` as Route}
                          variant="primary"
                          size="sm"
                          aria-current={active ? "true" : undefined}
                        >
                          Bu İlan İçin Hedef Planı Oluştur
                        </LinkButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
            {board.message}
          </p>
        )}
        {board.state === "needs-score" ? (
          <div className="mt-4">
            <LinkButton href={"/career#yetkincv" as Route} variant="outline" size="sm">
              YetkinCV puanını aç
            </LinkButton>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

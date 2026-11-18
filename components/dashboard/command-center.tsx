import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { CommandCardModel, CommandCenterModel } from "@/lib/dashboard/command-center";

function CommandCard({ card }: { card: CommandCardModel }) {
  const stats = card.stats;
  const metricGrid = stats.length > 1 ? "grid grid-cols-2 gap-x-3 gap-y-0.5" : "grid grid-cols-1 gap-y-0.5";

  return (
    <Card
      eyebrow={card.eyebrow}
      title={card.title}
      snug
      className="flex h-full min-w-0 flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col text-[var(--foreground)]"
    >
      <dl className={metricGrid}>
        {stats.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.label}
            </dt>
            <dd className="mt-0.5 truncate text-base font-semibold tabular-nums leading-tight tracking-tight text-[var(--foreground)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {card.detail ? (
        <p className="mt-2 text-pretty text-sm leading-5 text-[var(--muted)]">{card.detail}</p>
      ) : null}
      <div className="mt-auto pt-2">
        <LinkButton href={card.href as Route} size="sm">
          {card.cta}
        </LinkButton>
      </div>
    </Card>
  );
}

/** Girişli Genel Bakış gövdesi. Dar ekranda iki, geniş ekranda dört sütun. */
export function CommandCenter({ model }: { model: CommandCenterModel }) {
  return (
    <section
      aria-label="Komuta merkezi"
      className="grid min-w-0 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4"
    >
      {model.map((card) => (
        <CommandCard key={card.key} card={card} />
      ))}
    </section>
  );
}

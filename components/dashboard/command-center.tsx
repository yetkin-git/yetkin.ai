import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { CommandCardModel, CommandCenterModel } from "@/lib/dashboard/command-center";

function CommandCard({ card }: { card: CommandCardModel }) {
  const stats = card.stats;
  const metricGrid = stats.length > 1 ? "grid grid-cols-2 gap-x-4 gap-y-1" : "grid grid-cols-1 gap-y-1";

  return (
    <Card
      eyebrow={card.eyebrow}
      title={card.title}
      dense
      className="flex h-full min-w-0 flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col text-[var(--foreground)]"
    >
      <dl className={metricGrid}>
        {stats.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.label}
            </dt>
            <dd className="mt-0.5 truncate text-lg font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-xl">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {card.detail ? (
        <p className="mt-3 text-pretty text-sm leading-6 text-[var(--muted)]">{card.detail}</p>
      ) : null}
      <div className="mt-auto pt-4">
        <LinkButton href={card.href as Route} size="sm">
          {card.cta}
        </LinkButton>
      </div>
    </Card>
  );
}

/** Girişli Genel Bakış gövdesi. Dört oda, iki sütun. */
export function CommandCenter({ model }: { model: CommandCenterModel }) {
  return (
    <section aria-label="Komuta merkezi" className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2">
      {model.map((card) => (
        <CommandCard key={card.key} card={card} />
      ))}
    </section>
  );
}

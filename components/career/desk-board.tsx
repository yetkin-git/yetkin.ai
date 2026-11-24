import type { Route } from "next";
import { DeskStartButton } from "@/components/career/desk-start-button";
import { Card } from "@/components/ui/card";
import type { CareerDeskTaskView } from "@/lib/career/desk-load";
import Link from "next/link";

export function CareerDeskBoard({ tasks }: { tasks: readonly CareerDeskTaskView[] }) {
  return (
    <section id="calisma-odasi" className="scroll-mt-24">
      <Card eyebrow="Çalışma odası" title="E-ticaret görev paketleri">
        <p className="text-sm text-[var(--foreground)]">
          Bu paketler yalnız senin odandadır. Kamu ilanı açılmaz. Kısayol ilgili teknik tezgâhı açar.
        </p>
        {tasks.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Aktarılmış görev paketi yok.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-2xl border border-[var(--border)] p-3">
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {task.kindLabel}
                  <span className="ml-2 font-semibold text-[var(--safir-deep)]">{task.statusLabel}</span>
                </p>
                <p className="mt-2 text-sm">{task.brief}</p>
                {task.deliverySummary ? (
                  <p className="mt-2 text-sm text-[var(--foreground)]">{task.deliverySummary}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {task.benches.map((bench) => (
                    <Link
                      key={bench.href}
                      href={bench.href as Route}
                      className="text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                    >
                      {bench.label}
                    </Link>
                  ))}
                  <DeskStartButton taskId={task.id} status={task.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

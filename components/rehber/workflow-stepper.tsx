import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { IconArrow, IconArrowDown, IconCheck } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import type { WorkflowModule, WorkflowStep } from "@/lib/rehber/workflows";
import { moduleTotalLabel, workflowStepHref } from "@/lib/rehber/workflows";

/**
 * Süreç akış şeması — tek modülün uçtan uca adımları.
 *
 * Gazete paragrafı değil: her adım bir karttır ve adımlar arasında dikey akış
 * çizgisi + gerçek yön oku (`IconArrowDown`) vardır. Kart sırası veri sırasıdır;
 * numara veriden gelir. Buton adresi korumalı rotada `next` parametreli kayıt
 * yoluna çevrilir (`workflowStepHref`), böylece oturumsuz ziyaretçi çıplak
 * `/login` duvarına düşmez.
 */

function StepCard({
  step,
  done,
  last,
}: {
  step: WorkflowStep;
  done: boolean;
  last: boolean;
}) {
  return (
    <li
      className="relative pl-12 sm:pl-14"
      data-workflow-step={step.order}
      data-workflow-step-state={done ? "done" : "open"}
    >
      {/* Dikey akış çizgisi — son adımda kesilir. */}
      {last ? null : (
        <>
          <span
            aria-hidden
            className="absolute left-[19px] top-11 -bottom-4 w-0.5 rounded-full bg-gradient-to-b from-[var(--safir)]/45 to-[var(--safir)]/15 sm:left-[23px]"
          />
          {/* Gerçek yön oku — çizginin üstünde, kartın alt boşluğunda durur. */}
          <span
            aria-hidden
            data-workflow-step-arrow={step.order}
            className="absolute left-[19px] -bottom-4 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--safir)]/30 bg-[var(--surface)] text-[var(--safir-deep)] shadow-sm sm:left-[23px]"
          >
            <IconArrowDown className="h-3.5 w-3.5" />
          </span>
        </>
      )}

      {/* Adım numarası rozeti — tamamlanınca yeşile döner. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-1 sm:h-12 sm:w-12",
          done
            ? "bg-[var(--emerald)] text-white ring-[var(--emerald)]"
            : "bg-[var(--safir-soft)] text-[var(--safir-deep)] ring-[var(--safir-soft)]",
        )}
      >
        {done ? <IconCheck className="h-5 w-5" /> : step.order}
      </span>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
            {step.title}
          </h4>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]">
            {step.duration}
          </span>
          {done ? <Badge tone="emerald">Tamamlandı ✓</Badge> : null}
        </div>

        {/* Somut girdi → çıktı. */}
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--surface-muted)]/60 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Girdi
            </dt>
            <dd className="mt-1 text-sm leading-6 text-[var(--foreground)]">{step.input}</dd>
          </div>
          <div className="rounded-xl bg-[var(--emerald-soft)]/50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--emerald)]">
              Çıktı
            </dt>
            <dd className="mt-1 text-sm leading-6 text-[var(--foreground)]">{step.output}</dd>
          </div>
        </dl>

        {/* Kritik ipucu / ön koşul. */}
        <p className="mt-3 rounded-xl border border-[var(--amber-soft)] bg-[var(--amber-soft)]/45 px-3 py-2 text-xs leading-5 text-[var(--foreground)]">
          <span className="font-semibold text-[var(--amber)]">Kritik ipucu · </span>
          {step.tip}
        </p>

        <div className="mt-4">
          <LinkButton
            href={workflowStepHref(step.href)}
            size="sm"
            variant={step.emphasis === "outline" ? "outline" : "primary"}
          >
            {step.cta}
            <IconArrow className="h-3.5 w-3.5" />
          </LinkButton>
        </div>
      </article>
    </li>
  );
}

export function WorkflowStepper({
  module,
  completed,
  note,
}: {
  module: WorkflowModule;
  completed: readonly number[];
  note: string | null;
}) {
  const doneSet = new Set(completed);
  const doneCount = module.steps.filter((step) => doneSet.has(step.order)).length;
  const totalLabel = moduleTotalLabel(module);

  return (
    <section
      aria-labelledby={`workflow-${module.id}-heading`}
      data-workflow-module={module.id}
      className="mt-6"
    >
      <header className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--safir-soft)]/70 via-[var(--surface)] to-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              id={`workflow-${module.id}-heading`}
              className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
            >
              {module.label}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">{module.blurb}</p>
          </div>
          <div className="flex items-start gap-5 text-right">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Adım
              </p>
              <p className="text-lg font-bold text-[var(--safir-deep)]">
                {doneCount} / {module.steps.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Toplam süre
              </p>
              <p
                className="text-lg font-bold text-[var(--safir-deep)]"
                data-workflow-total-duration={module.id}
              >
                {totalLabel}
              </p>
            </div>
          </div>
        </div>

        {note ? (
          <p className="mt-3 rounded-xl bg-[var(--emerald-soft)]/60 px-3 py-2 text-xs font-medium text-[var(--emerald)]">
            {note}
          </p>
        ) : null}

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">Akış sonunda: </span>
          {module.outcome}
        </p>
      </header>

      <ol className="mt-5 grid gap-4">
        {module.steps.map((step, index) => (
          <StepCard
            key={`${module.id}-${step.order}`}
            step={step}
            done={doneSet.has(step.order)}
            last={index === module.steps.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}

/**
 * Modül seçici şerit. Sekme gibi davranır ama JS gerektirmez:
 * her buton `?modul=<id>` sorgusuna gider, sunucu tek modülü basar.
 * `<nav>` + `aria-current` gerçek bir gezinme semantiği verir.
 */
export function WorkflowModuleTabs({
  modules,
  activeId,
  basePath,
}: {
  modules: readonly WorkflowModule[];
  activeId: string;
  basePath: Route | string;
}) {
  return (
    <nav aria-label="Modül seç" className="mt-6">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => {
          const active = module.id === activeId;
          return (
            <li key={module.id}>
              <a
                href={`${basePath}?modul=${module.id}`}
                aria-current={active ? "page" : undefined}
                data-workflow-tab={module.id}
                data-workflow-tab-active={active ? "true" : "false"}
                className={cn(
                  "flex h-full flex-col gap-1 rounded-xl border p-3 text-left transition",
                  active
                    ? "border-[var(--safir)] bg-[var(--safir-soft)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--safir)]/40 hover:bg-[var(--surface-muted)]/60",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold tracking-tight",
                    active ? "text-[var(--safir-deep)]" : "text-[var(--foreground)]",
                  )}
                >
                  {module.label}
                </span>
                <span className="text-[11px] font-medium text-[var(--muted)]">
                  {module.steps.length} adım · {moduleTotalLabel(module)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import { useState } from "react";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import {
  buildCareerActionPlan,
  suggestCareerActionInput,
  type CareerActionFocus,
  type CareerActionLive,
  type CareerActionSituation,
  type CareerActionTimeBand,
} from "@/lib/career/action-plan";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function ActionPlanPanel({ live }: { live: CareerActionLive }) {
  const copy = SEN_VOICE.career.actionPlan;
  const suggested = suggestCareerActionInput(live);
  const [situation, setSituation] = useState<CareerActionSituation>(suggested.situation);
  const [timeBand, setTimeBand] = useState<CareerActionTimeBand>(suggested.timeBand);
  const [focus, setFocus] = useState<CareerActionFocus>(suggested.focus);
  const plan = buildCareerActionPlan({ situation, timeBand, focus, live });

  return (
    <div id="kariyer-plani" data-action-plan="true" className="scroll-mt-24">
      <Card eyebrow={copy.eyebrow} title={copy.title}>
        <p className="text-[var(--foreground)]">{copy.intro}</p>
        <p className="mt-3 text-[var(--foreground)]">{plan.lead}</p>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">{copy.legend}</legend>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.situationLabel}
            <select
              className={INPUT_SURFACE_CLASS}
              value={situation}
              onChange={(event) => setSituation(event.target.value as CareerActionSituation)}
            >
              {copy.situations.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.timeBandLabel}
            <select
              className={INPUT_SURFACE_CLASS}
              value={timeBand}
              onChange={(event) => setTimeBand(event.target.value as CareerActionTimeBand)}
            >
              {copy.timeBands.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.focusLabel}
            <select
              className={INPUT_SURFACE_CLASS}
              value={focus}
              onChange={(event) => setFocus(event.target.value as CareerActionFocus)}
            >
              {copy.foci.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        <ol className="mt-5 space-y-4">
          {plan.steps.map((step) => (
            <li key={step.id} className="rounded-xl border border-[var(--border)] p-4" data-action-step={step.id}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {step.window}
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{step.title}</p>
              <p className="mt-1 text-[var(--foreground)]">{step.body}</p>
              <div className="mt-3">
                <LinkButton href={step.href as Route} size="sm">
                  {step.cta}
                </LinkButton>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[var(--foreground)]">{copy.disclaimer}</p>
      </Card>
    </div>
  );
}

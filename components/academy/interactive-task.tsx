"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  academyInteractiveTaskByKey,
  evaluateAcademyProofSubmission,
  type AcademyProofSubmission,
} from "@/lib/academy/proof-of-work";

export function InteractiveTask({
  lessonKey,
  disabled = false,
  sealedHash = null,
  onSealed,
}: {
  lessonKey: string;
  disabled?: boolean;
  sealedHash?: string | null;
  onSealed?: (proof: AcademyProofSubmission) => void;
}) {
  const copy = ACADEMY_SEN.task;
  const task = useMemo(() => academyInteractiveTaskByKey(lessonKey), [lessonKey]);
  const [amountText, setAmountText] = useState("");
  const [currencyText, setCurrencyText] = useState("TRY");
  const [prompt, setPrompt] = useState("");
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!task) {
    return null;
  }

  function submit() {
    if (!task) {
      return;
    }
    const proof: AcademyProofSubmission =
      task.kind === "amount-kurus"
        ? { kind: "amount-kurus", amountText, currencyText }
        : task.kind === "prompt-pack"
          ? { kind: "prompt-pack", prompt, slots }
          : { kind: "param-lock", slots };
    const judged = evaluateAcademyProofSubmission(lessonKey, proof);
    if (!judged.ok) {
      setError(copy.locked);
      return;
    }
    setError(null);
    onSealed?.(proof);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
        {copy.eyebrow}
      </p>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{copy.title}</h3>
      <p className="text-sm text-[var(--muted)]">{task.brief}</p>
      {task.kind === "amount-kurus" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {copy.amountLabel}
            <Input
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
              disabled={disabled || Boolean(sealedHash)}
            />
            <span className="mt-1 block text-xs text-slate-600">{copy.amountHint}</span>
          </label>
          <label className="text-sm font-medium text-[var(--foreground)]">
            {copy.currencyLabel}
            <Input
              value={currencyText}
              onChange={(event) => setCurrencyText(event.target.value)}
              disabled={disabled || Boolean(sealedHash)}
            />
          </label>
        </div>
      ) : null}
      {task.kind === "prompt-pack" ? (
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {copy.promptLabel}
          <textarea
            className="mt-1 min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
            value={prompt}
            placeholder={copy.promptPlaceholder}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={disabled || Boolean(sealedHash)}
          />
        </label>
      ) : null}
      {task.kind === "prompt-pack" || task.kind === "param-lock" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">{copy.bank}</p>
          {task.slots.map((slot) => (
            <label key={slot.id} className="block text-sm font-medium text-[var(--foreground)]">
              {slot.label}
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base"
                value={slots[slot.id] ?? ""}
                onChange={(event) =>
                  setSlots((current) => ({ ...current, [slot.id]: event.target.value }))
                }
                disabled={disabled || Boolean(sealedHash)}
              >
                <option value="">{copy.slotEmpty}</option>
                {task.tokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
      {sealedHash ? (
        <p className="text-sm font-medium text-[var(--foreground)]">{copy.confirmed}</p>
      ) : (
        <Button type="button" size="sm" className="min-h-11" onClick={submit} disabled={disabled}>
          {copy.confirm}
        </Button>
      )}
      {error ? (
        <p className="text-xs text-[var(--rose)]" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </section>
  );
}

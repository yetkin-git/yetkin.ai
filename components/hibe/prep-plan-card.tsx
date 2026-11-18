"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import {
  grantPrepDocxFilename,
  grantPrepMasterPlanDocx,
  renderGrantPrepMasterPlan,
  type GrantPrepMasterPlan,
} from "@/lib/yetkinhibe/master-plan";

function downloadDocx(plan: GrantPrepMasterPlan) {
  const bytes = grantPrepMasterPlanDocx(plan);
  const url = URL.createObjectURL(
    new Blob([Uint8Array.from(bytes)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = grantPrepDocxFilename(plan.grantId);
  link.click();
  URL.revokeObjectURL(url);
}

export function HibePrepPlanCard({
  plan,
  projectHref,
}: {
  plan: GrantPrepMasterPlan;
  projectHref: Route;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(renderGrantPrepMasterPlan(plan));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-4"
      data-hibe-prep=""
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950">
        Uyum Yükseltme & Danışmanlık
      </p>
      {plan.closable.length === 0 ? (
        <p className="mt-2 text-sm leading-6">
          Mevcut Kriter Uyumu: <strong className="tabular-nums">%{plan.currentScore}</strong>. Hazırlık planıyla
          kapanan ek kriter yok.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6">
          Mevcut Kriter Uyumu: <strong className="tabular-nums">%{plan.currentScore}</strong>
          {" → Eksik "}
          {plan.closable.length} adımı tamamlarsan{" "}
          <strong className="tabular-nums">%{plan.targetScore}</strong> uyuma ulaşırsın.
        </p>
      )}
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{plan.disclaimer}</p>
      <p className="mt-2 text-sm font-semibold">{plan.window.title}</p>
      <p className="mt-1 text-sm leading-6">{plan.window.detail}</p>
      {plan.closable.length > 0 ? (
        <ul className="mt-3 grid gap-1.5">
          {plan.closable.map((gap) => (
            <li key={gap.key} className="text-sm leading-6">
              {gap.label} <span className="font-semibold tabular-nums">(+{gap.points} puan)</span>
            </li>
          ))}
        </ul>
      ) : null}
      {plan.blockers.length > 0 ? (
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Belge planıyla kapanmayan şart: {plan.blockers.map((row) => row.label).join(", ")}.
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className={buttonClassName("success", "md")}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Master planı kapat" : "90 Günlük Master Plan Hazırla"}
        </button>
        <Link href={projectHref} className={buttonClassName("outline", "md")}>
          Tam Proje Dosyasını Üret →
        </Link>
      </div>
      {open ? (
        <div className="mt-4 space-y-4 border-t border-amber-200 pt-4" data-hibe-prep-open="">
          {plan.stages.map((stage) => (
            <section key={stage.id}>
              <h4 className="text-sm font-semibold text-emerald-950">{stage.title}</h4>
              <ul className="mt-2 space-y-1.5">
                {stage.tasks.map((task) => (
                  <li key={`${stage.id}-${task.actor}-${task.text}`} className="text-sm leading-6">
                    <span className="font-semibold">{task.actor === "firma" ? "Firma" : "YetkinHibe"}:</span>{" "}
                    {task.text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClassName("outline", "sm")} onClick={() => void copyPlan()}>
              {copied ? "Kopyalandı" : "Planı kopyala"}
            </button>
            <button type="button" className={buttonClassName("outline", "sm")} onClick={() => downloadDocx(plan)}>
              DOCX indir
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

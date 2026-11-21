"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  OFFICE_AI_FRIDAY_30_ITEMS,
  OFFICE_AI_KVKK_MASK_TEMPLATE,
  officeAiExitPromptCards,
  renderOfficeAiExitKitMarkdown,
  renderOfficeAiFriday30Markdown,
  renderOfficeAiKvkkTemplateMarkdown,
  renderOfficeAiPromptCardsMarkdown,
} from "@/lib/academy/exit-kit";

function downloadText(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export function OfficeAiExitKit({ compact = false }: { compact?: boolean }) {
  const copy = ACADEMY_SEN.player;
  const cards = useMemo(() => officeAiExitPromptCards(), []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function onCopy(id: string, text: string) {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1600);
    }
  }

  return (
    <section
      className="space-y-6 print:space-y-4"
      data-academy-exit-kit=""
    >
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
          {copy.exitKitCta}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Cuma 30, istem kartları, KVKK maskesi
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{copy.exitKitLead}</p>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => downloadText("office-ai-cikis-paketi.md", renderOfficeAiExitKitMarkdown())}
          >
            Tümünü indir
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => window.print()}>
            Yazdır
          </Button>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Cuma 30 rutini — tek sayfa</h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="print:hidden"
            onClick={() => downloadText("cuma-30-rutini.md", renderOfficeAiFriday30Markdown())}
          >
            İndir
          </Button>
        </div>
        <ol className="space-y-3">
          {OFFICE_AI_FRIDAY_30_ITEMS.map((item) => (
            <li key={item.id} className="flex gap-3 text-sm leading-6">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" aria-label={item.label} />
              <span>
                <span className="font-medium text-[var(--foreground)]">
                  {item.block}
                  {item.minutes > 0 ? ` · ${item.minutes} dk` : ""} — {item.label}
                </span>
                <span className="mt-0.5 block text-[var(--muted)]">{item.hint}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">8 ders — istem kartları</h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="print:hidden"
            onClick={() => downloadText("office-ai-istem-kartlari.md", renderOfficeAiPromptCardsMarkdown())}
          >
            İndir
          </Button>
        </div>
        <div className={`grid gap-3 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
          {cards.map((card) => {
            const id = `prompt-${card.lessonKey}`;
            return (
              <article
                key={card.lessonKey}
                className="rounded-2xl border border-[var(--border)] bg-white p-4"
                data-academy-exit-prompt-card={card.lessonKey}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--safir-deep)]">
                  Ders {card.ordinal}
                </p>
                <h4 className="mt-1 text-sm font-semibold leading-snug">{card.title}</h4>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[12.5px] leading-6 text-slate-800">
                  {card.prompt}
                </pre>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 print:hidden"
                  onClick={() => void onCopy(id, card.prompt)}
                >
                  {copiedId === id ? copy.labCopied : copy.labCopy}
                </Button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">KVKK maskeleme pratik şablonu</h3>
          <div className="flex gap-2 print:hidden">
            <Button type="button" size="sm" onClick={() => void onCopy("kvkk", OFFICE_AI_KVKK_MASK_TEMPLATE)}>
              {copiedId === "kvkk" ? copy.labCopied : copy.labCopy}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => downloadText("kvkk-maskeleme-sablonu.md", renderOfficeAiKvkkTemplateMarkdown())}
            >
              İndir
            </Button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
          {OFFICE_AI_KVKK_MASK_TEMPLATE}
        </pre>
      </div>
    </section>
  );
}

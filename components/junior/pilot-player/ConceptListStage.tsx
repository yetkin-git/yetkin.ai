"use client";

import type { ReactElement } from "react";
import type { ConceptListState } from "@/lib/junior/pilot-engine/state-reducer";

/**
 * Kavram listesi sahnesi.
 * Anlatı ilerledikçe satır satır açılır; ders boyunca ekranda duran tek kart yığını
 * yerine konuşmayla birlikte büyüyen bir liste gösterir.
 * Satır sayısı ve metni timeline'daki `SHOW_CONCEPT_LIST` parametrelerinden gelir.
 */

const TONE_CLASS: Record<string, string> = {
  concept: "border-cyan-400/45 bg-cyan-950/40 text-cyan-100",
  example: "border-sky-400/45 bg-sky-950/40 text-sky-100",
  trap: "border-rose-400/50 bg-rose-950/40 text-rose-100",
  gold: "border-amber-400/55 bg-amber-950/40 text-amber-100",
  recap: "border-emerald-400/45 bg-emerald-950/40 text-emerald-100",
};

const TONE_LABEL: Record<string, string> = {
  concept: "Kavram",
  example: "Örnek",
  trap: "Tuzak",
  gold: "Altın İpucu",
  recap: "Özet",
};

export function ConceptListStage(props: { card: ConceptListState }): ReactElement {
  const { card } = props;
  const shown = card.rows.slice(0, Math.max(0, card.revealed));
  return (
    <div
      data-junior-graphic-op="concept-list"
      data-junior-concept-revealed={shown.length}
      className="flex h-full min-h-0 w-full flex-col gap-2 p-3 sm:p-4"
    >
      {card.heading.length > 0 ? (
        <h4 className="shrink-0 text-sm font-black text-white sm:text-base">{card.heading}</h4>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        {shown.map((row, index) => {
          const tone = TONE_CLASS[row.tone] ?? TONE_CLASS.concept!;
          return (
            <div
              key={`${row.title}-${index}`}
              data-junior-concept-row={index + 1}
              data-junior-concept-tone={row.tone}
              className={`flex min-h-0 items-start gap-2 rounded-xl border px-3 py-2 ${tone}`}
            >
              <span className="mt-0.5 inline-flex shrink-0 items-center rounded-md bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
                {TONE_LABEL[row.tone] ?? "Kavram"}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black leading-snug sm:text-sm">{row.title}</p>
                <p className="text-xs font-semibold leading-snug text-slate-200 sm:text-sm">{row.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {card.note.length > 0 ? (
        <p className="shrink-0 rounded-lg bg-slate-900/70 px-3 py-1.5 text-xs font-bold text-slate-200">
          {card.note}
        </p>
      ) : null}
    </div>
  );
}

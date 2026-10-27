"use client";

import type { ReactElement } from "react";
import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

const ICON_MAP: Record<string, string> = {
  puzzle: "🧩",
  search: "🔎",
  plus: "➕",
  columns: "🔢",
  link: "🤝",
};

export function SummaryPromptStage(props: { state: SceneGraphState }): ReactElement {
  const { state } = props;
  const cards =
    state.summaryCards.length > 0
      ? state.summaryCards
      : [
          {
            icon: "puzzle",
            title: "Çarpan & Kat",
            body: "Çarpan ≤ sayı · Kat ≥ sayı",
          },
          {
            icon: "search",
            title: "Son Basamak (2, 5, 10)",
            body: "2: Çift · 5: 0 veya 5 · 10: Sonu 0",
          },
          {
            icon: "columns",
            title: "Son İki Basamak (4)",
            body: "100 ÷ 4 = 25 olduğu için son iki basamak yeter.",
          },
          {
            icon: "plus",
            title: "Rakam Toplamı (3 ve 9)",
            body: "Rakamları topla → 3'ün veya 9'un katı mı?",
          },
          {
            icon: "link",
            title: "Çifte Koşul (6)",
            body: "Hem 2'ye hem 3'e aynı anda.",
          },
        ];

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden p-3 sm:p-4">
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 items-stretch gap-2 sm:grid-cols-3">
        {cards.map((card, idx) => (
          <div
            key={card.title}
            style={{
              transitionDelay: `${idx * 100}ms`,
            }}
            className="flex min-h-0 flex-col justify-center rounded-xl border border-cyan-300/35 bg-slate-900/75 p-3.5 shadow-md"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-lg">
                  {ICON_MAP[card.icon] ?? "✨"}
                </span>
                <h4 className="text-sm font-black text-cyan-200 sm:text-base">{card.title}</h4>
              </div>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-200">
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sıra Sende Mikrofon Çağrısı */}
      <div className="mt-2 flex shrink-0 flex-col items-center justify-between gap-3 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 px-4 py-2.5 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg text-slate-950 shadow-md">
            🎙️
          </span>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Sıra Sende
            </div>
            <div className="text-xs font-extrabold text-white sm:text-sm">
              {state.echoPrompt ??
                "24 ve 30 ile 116 sayılarının hangi kurallara uyduğunu kendi cümlenle anlat!"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

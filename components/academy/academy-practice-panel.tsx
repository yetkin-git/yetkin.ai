"use client";

import { useState, useEffect } from "react";
import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

/**
 * Canlı oynatıcıya bağlı değil (`LESSON_PRACTICE` boş).
 * Eski müfredat örnek çözümleri (toplantı notu, ÇOKETOPLA, VBA) basılmaz.
 */
export function AcademyPracticePanel({
  sectionNumber,
  practice,
  className = "",
}: {
  sectionNumber: number;
  practice?: AcademyLessonPractice | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [userPrompt, setUserPrompt] = useState(practice?.code.source ?? "");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setUserPrompt(practice?.code.source ?? "");
    setCompletedSteps({});
    setIsDone(false);
  }, [sectionNumber, practice?.code.source]);

  const initialSource = practice?.code.source ?? "";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(userPrompt || initialSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <aside
      className={`rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-xl backdrop-blur-md ${className}`}
      aria-label="İstem ve Alıştırma Paneli"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--safir)]/20 text-sm text-[var(--safir)]">
            ⚡
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">
              İstem & Alıştırma Paneli
            </h3>
            <p className="text-[11px] text-slate-400">
              Bölüm {sectionNumber} Pratik Konsolu
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--safir)]/30 bg-[var(--safir)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--safir)]">
          Bağlı değil
        </span>
      </div>

      {practice?.params && practice.params.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Hedef ve Kural Parametreleri
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {practice.params.map((param, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span className="block text-[10px] font-medium uppercase text-[var(--safir)]">
                  {param.label}
                </span>
                <span className="mt-0.5 block font-semibold text-white">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {practice?.steps && practice.steps.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Uygulama Adım Adım Rehberi
          </p>
          <div className="space-y-2">
            {practice.steps.map((step, idx) => {
              const checked = Boolean(completedSteps[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    checked
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-emerald-500 bg-emerald-500 text-slate-950 text-[10px] font-bold"
                        : "border-slate-500 bg-transparent text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={checked ? "line-through opacity-75" : ""}>
                    <strong className="font-semibold text-white">{idx + 1}. Adım:</strong> {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Kullanıma Hazır İstem (Prompt Konsolu)
          </p>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--safir)]/20 px-2.5 py-1 text-xs font-medium text-[var(--safir)] transition-colors hover:bg-[var(--safir)]/30 active:scale-95"
          >
            {copied ? "✓ Kopyalandı!" : "📋 İstemi Kopyala"}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/80 p-3 font-mono text-xs leading-relaxed text-slate-200 shadow-inner focus:border-[var(--safir)] focus:ring-1 focus:ring-[var(--safir)] focus:outline-none"
            placeholder="LESSON_PRACTICE bağlanınca istem burada durur."
          />
          <button
            type="button"
            onClick={() => setUserPrompt(initialSource)}
            className="absolute right-2.5 bottom-3 text-[10px] text-slate-400 underline hover:text-white"
          >
            Sıfırla
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Bu panel canlı müfredata bağlı değildir. Örnek çözüm basılmaz.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3.5">
        <span className="text-xs text-slate-400">
          {isDone ? "🎉 Pratik çalışması uygulandı!" : "Pratik adımlarını tamamladınız mı?"}
        </span>
        <button
          type="button"
          onClick={() => setIsDone((prev) => !prev)}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            isDone
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
          }`}
        >
          {isDone ? "✓ Tamamlandı" : "Alıştırmayı Tamamla"}
        </button>
      </div>
    </aside>
  );
}

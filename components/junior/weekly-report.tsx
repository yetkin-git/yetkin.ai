"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/ui/icons";
import type { JuniorWeeklyReport } from "@/lib/junior/report";

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function WeeklyReport({
  nickname,
  report,
  variant = "card",
}: {
  nickname: string;
  report: JuniorWeeklyReport;
  /** `button` yalnız tetik ve pencereyi bırakır. Kart şeridi çizilmez. */
  variant?: "card" | "button";
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const narration = report.narration;
  const average = narration.averageScore;

  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
    >
      {variant === "button" ? "Haftalık Rapor" : "Raporu aç"}
    </Button>
  );

  return (
    <>
      {variant === "button" ? (
        trigger
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-card)]">
          <div>
            <h2 className="text-sm font-semibold">Haftalık Gelişim Raporu</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {nickname} için son yedi günün anlatış ve test özeti.
            </p>
          </div>
          {trigger}
        </section>
      )}
      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)] outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
                  Veli paneli
                </p>
                <h2 id={titleId} className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  Haftalık Gelişim Raporu
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {nickname} · {formatDay(report.from)} – {formatDay(report.to)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[var(--muted)]"
                aria-label="Raporu kapat"
              >
                <IconClose />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <h3 className="text-sm font-semibold">Haftalık Anlatım Performansı</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Dinle ve Anlat aşamasında yapay zekanın konuşma puanı.
                </p>
                {average === null ? (
                  <p className="mt-3 text-sm leading-6">Bu yedi günde Dinle ve Anlat kaydı yok.</p>
                ) : (
                  <div className="mt-3">
                    <p className="text-3xl font-semibold tabular-nums text-[var(--safir-deep)]">{average}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {narration.attempts} anlatışın ortalama puanı
                      {narration.latestScore !== null ? ` · Son anlatış ${narration.latestScore}` : ""}
                    </p>
                    <div
                      className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]"
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={average}
                      aria-label="Haftalık anlatım puanı"
                    >
                      <div className="h-full rounded-full bg-[var(--safir)]" style={{ width: `${average}%` }} />
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <h3 className="text-sm font-semibold">10 Soruluk Test Başarı Grafiği</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Konu testlerindeki doğru ve yanlış sayısı.
                </p>
                {report.quizzes.length === 0 ? (
                  <p className="mt-3 text-sm leading-6">Bu yedi günde konu testi yok.</p>
                ) : (
                  <div className="mt-3 grid gap-3">
                    <p className="text-sm">
                      {report.quizTotals.attempts} test · {report.quizTotals.correct} doğru · {report.quizTotals.wrong}{" "}
                      yanlış
                    </p>
                    <p className="text-xs text-[var(--muted)]">Yeşil doğru · Kırmızı yanlış</p>
                    <ul className="grid gap-3">
                      {report.quizzes.map((quiz, index) => (
                        <li key={`${quiz.lessonKey}-${quiz.takenAt}-${index}`} className="grid gap-1">
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium">{quiz.lessonTitle}</span>
                            <span className="shrink-0 text-xs text-[var(--muted)]">{formatDay(quiz.takenAt)}</span>
                          </div>
                          <div
                            className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]"
                            role="img"
                            aria-label={`${quiz.lessonTitle}: ${quiz.correct} doğru, ${quiz.wrong} yanlış`}
                          >
                            <div
                              className="h-full bg-[var(--emerald)]"
                              style={{ width: `${(quiz.correct / quiz.total) * 100}%` }}
                            />
                            <div
                              className="h-full bg-[var(--rose)]"
                              style={{ width: `${(quiz.wrong / quiz.total) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            {quiz.correct} doğru, {quiz.wrong} yanlış
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-[color-mix(in_srgb,var(--gold)_48%,var(--border))] bg-[var(--gold-soft)] p-4">
                <h3 className="text-sm font-semibold">AI Ebeveyn İpucu</h3>
                <p className="mt-2 text-sm leading-6">{report.parentTip}</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

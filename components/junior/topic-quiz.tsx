"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import { playApplauseSound, playOopsSound, primeActivityAudio } from "@/lib/junior/activity-sound";
import { juniorNextLesson } from "@/lib/junior/lesson-nav";
import { JUNIOR_QUIZ_CONTROL_LABEL, JUNIOR_QUIZ_PATH } from "@/lib/junior/limits";
import { recordQuizScore } from "@/lib/junior/progress-tracker";
import type { JuniorPracticeChoice } from "@/lib/junior/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Note = { id: string; ok: boolean; explanation: string; answer?: string };

type Report = {
  correct: number;
  total: number;
  percent: number;
  notes: Note[];
};

const QUIZ_LEVELS = [
  { id: "concept", title: "Kavram Testi" },
  { id: "apply", title: "Uygulama Testi" },
  { id: "skill", title: "Beceri / Yeni Nesil Testi" },
] as const;

const OPTION_FACE = [
  "border-sky-300 bg-sky-100 text-sky-950",
  "border-amber-300 bg-amber-100 text-amber-950",
  "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950",
  "border-emerald-300 bg-emerald-100 text-emerald-950",
] as const;

const FINISH_BUTTON =
  "inline-flex cursor-pointer items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg h-12 px-8 rounded-xl font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-100";

function quizGroups(items: JuniorPracticeChoice[]): { title: string | null; items: JuniorPracticeChoice[] }[] {
  if (!items.some((item) => item.level)) {
    return [{ title: null, items }];
  }
  return QUIZ_LEVELS.map((level) => ({
    title: level.title,
    items: items.filter((item) => item.level === level.id),
  })).filter((group) => group.items.length > 0);
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function optionClass(index: number, selected: boolean): string {
  const face = selected
    ? "border-emerald-400 bg-emerald-50 text-emerald-950"
    : OPTION_FACE[index % OPTION_FACE.length];
  const picked = selected
    ? "ring-2 ring-emerald-500/55 shadow-sm"
    : "shadow-sm hover:-translate-y-0.5";
  return `relative my-1.5 flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold leading-snug transition sm:text-sm ${face} ${picked}`;
}

export function TopicQuiz({
  profileId,
  lessonKey,
  items,
  onCompleted,
  submitLocked = null,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorPracticeChoice[];
  onCompleted?: () => void;
  /** Puan kapısı. Sorular görünür kalır; gönderim bu cümle varken kapalıdır. */
  submitLocked?: string | null;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nextLesson = juniorNextLesson(lessonKey);
  const blocked = pending || Boolean(submitLocked) || !profileId;

  useEffect(() => {
    if (!report) {
      return;
    }
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setReport(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [report]);

  async function onSubmit() {
    primeActivityAudio();
    setPending(true);
    setError("");
    setReport(null);
    try {
      const answers = items.map((item) => {
        const choiceIndex = choices[item.id];
        return choiceIndex === undefined ? { id: item.id } : { id: item.id, choiceIndex };
      });
      const response = await fetch(
        JUNIOR_QUIZ_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profileId, lessonKey, answers }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string | null;
        data?: { correct?: number; total?: number; score?: number; notes?: Note[]; completed?: boolean };
      } | null;
      if (!response.ok || !body?.data) {
        setError(body?.error || "Cevaplar puanlanamadı.");
        return;
      }
      const correct = body.data.correct ?? 0;
      const total = body.data.total ?? items.length;
      const percent = typeof body.data.score === "number" ? body.data.score : total > 0 ? Math.round((correct / total) * 100) : 0;
      const notes = body.data.notes ?? [];
      setReport({ correct, total, percent, notes });
      recordQuizScore(profileId, lessonKey, percent);
      if (percent >= 50) {
        burstJuniorActivityConfetti();
        playApplauseSound();
      } else {
        playOopsSound();
      }
      if (body.data.completed) {
        onCompleted?.();
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  function retry() {
    setChoices({});
    setReport(null);
    setError("");
  }

  const groups = quizGroups(items);
  const numberById = new Map(
    groups.flatMap((group) => group.items).map((item, index) => [item.id, index + 1] as const),
  );
  const noteById = new Map((report?.notes ?? []).map((note) => [note.id, note]));

  return (
    <section className="rounded-[1.6rem] border border-fuchsia-200 bg-gradient-to-b from-fuchsia-50 via-white to-sky-50 p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{JUNIOR_QUIZ_CONTROL_LABEL}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Kavram, uygulama ve beceri testleri ayrı durur. Doğrular birikince ders tamamlanır. Puan sunucuda hesaplanır.
      </p>
      <div className="mt-3 grid gap-3">
        {groups.map((group) => (
          <div key={group.title ?? "bank"} className="grid gap-3">
            {group.title ? (
              <span className="inline-flex w-fit items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-violet-800">
                {group.title}
              </span>
            ) : null}
            {group.items.map((item) => {
              const number = numberById.get(item.id) ?? 0;
              const picked = choices[item.id];
              return (
                <article
                  key={item.id}
                  data-junior-quiz-card=""
                  className="rounded-xl border border-violet-200 bg-white p-3 shadow-sm"
                >
                  <p id={`junior-quiz-${item.id}`} className="text-sm font-extrabold leading-5 text-slate-900 sm:text-[15px] sm:leading-6">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                      {number}
                    </span>
                    {item.prompt}
                  </p>
                  <div role="radiogroup" aria-labelledby={`junior-quiz-${item.id}`} className="mt-2 grid gap-0">
                    {item.choices.map((choice, index) => {
                      const selected = picked === index;
                      return (
                        <button
                          key={`${item.id}-${index}`}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          data-junior-quiz-choice=""
                          data-junior-quiz-selected={selected ? "true" : "false"}
                          className={optionClass(index, selected)}
                          onClick={() => setChoices((current) => ({ ...current, [item.id]: index }))}
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[11px] font-extrabold sm:h-7 sm:w-7 sm:text-xs">
                            {optionLetter(index)}
                          </span>
                          <span className="min-w-0 flex-1 pr-1">{choice}</span>
                          {selected ? (
                            <span
                              data-junior-quiz-check=""
                              aria-hidden="true"
                              className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 p-1 text-[11px] font-black leading-none text-white shadow-sm sm:h-6 sm:w-6 sm:text-xs"
                            >
                              ✓
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
      {submitLocked ? <p className="mt-4 text-sm text-[var(--muted)]">{submitLocked}</p> : null}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          data-junior-quiz-finish=""
          className={FINISH_BUTTON}
          onClick={() => void onSubmit()}
          disabled={blocked}
        >
          {pending ? "Puanlanıyor…" : "Testi bitir"}
        </button>
      </div>
      {error ? <p className="mt-3 text-center text-sm font-semibold text-[var(--rose)]">{error}</p> : null}
      {report ? (
        <QuizReport
          dialogRef={dialogRef}
          report={report}
          items={items}
          choices={choices}
          noteById={noteById}
          nextLesson={nextLesson}
          onRetry={retry}
        />
      ) : null}
    </section>
  );
}

function QuizReport({
  dialogRef,
  report,
  items,
  choices,
  noteById,
  nextLesson,
  onRetry,
}: {
  dialogRef: RefObject<HTMLDivElement | null>;
  report: Report;
  items: JuniorPracticeChoice[];
  choices: Record<string, number>;
  noteById: Map<string, Note>;
  nextLesson: { key: string; title: string } | null;
  onRetry: () => void;
}) {
  const wrong = Math.max(report.total - report.correct, 0);
  const cheer = report.percent >= 50;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="junior-quiz-report-title"
        tabIndex={-1}
        data-junior-quiz-report=""
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border-4 border-amber-200 bg-gradient-to-b from-amber-50 via-white to-rose-50 px-5 py-6 shadow-2xl outline-none"
      >
        <p className="text-center text-4xl" aria-hidden="true">
          {cheer ? "🏆" : "📘"}
        </p>
        <h2 id="junior-quiz-report-title" className="mt-2 text-center text-2xl font-extrabold text-fuchsia-700">
          Test Sonuç Karnesi
        </h2>
        <p className="mt-3 text-center text-lg font-extrabold text-slate-900" data-junior-quiz-score="">
          {report.correct} / {report.total} Doğru - %{report.percent} Başarı
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-slate-600">
          {report.correct} doğru, {wrong} yanlış
          {cheer ? " 🎉" : ""}
        </p>
        <h3 className="mt-5 text-sm font-extrabold tracking-wide text-slate-800">Soru Analizi</h3>
        <ol className="mt-2 grid gap-3">
          {items.map((item, index) => {
            const note = noteById.get(item.id);
            const picked = choices[item.id];
            return (
              <li key={item.id} className="rounded-2xl border border-white/80 bg-white/80 p-3">
                <p className="text-sm font-extrabold text-slate-900">
                  <span className={note?.ok ? "text-emerald-700" : "text-rose-700"}>
                    {note?.ok ? "✓ Doğru" : "✗ Yanlış"}
                  </span>
                  <span className="mx-1 text-slate-400">{index + 1}.</span>
                  {item.prompt}
                </p>
                <ul className="mt-2 grid gap-2">
                  {item.choices.map((choice, choiceIndex) => {
                    const isPick = picked === choiceIndex;
                    const showRight = Boolean(note && !note.ok && note.answer === choice);
                    const face = showRight
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-400"
                      : isPick && note && !note.ok
                        ? "border-rose-400 bg-rose-50 text-rose-950"
                        : isPick && note?.ok
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                          : "border-slate-200 bg-white text-slate-700";
                    return (
                      <li
                        key={`${item.id}-${choiceIndex}`}
                        data-junior-quiz-right={showRight ? "" : undefined}
                        className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-semibold ${face}`}
                      >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold">
                          {optionLetter(choiceIndex)}
                        </span>
                        <span className="flex-1">{choice}</span>
                        {showRight ? <span className="text-xs font-extrabold text-emerald-700">Doğru seçenek</span> : null}
                      </li>
                    );
                  })}
                </ul>
                {note?.explanation ? <p className="mt-2 text-sm leading-6 text-slate-700">{note.explanation}</p> : null}
              </li>
            );
          })}
        </ol>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            data-junior-quiz-retry=""
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-bold text-rose-600 shadow ring-2 ring-rose-200"
            onClick={onRetry}
          >
            Yeniden Çöz
          </button>
          {nextLesson ? (
            <Link
              href={`/junior/ders/${nextLesson.key}`}
              data-junior-quiz-next=""
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 font-bold text-white shadow-lg"
            >
              Sonraki Konu
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

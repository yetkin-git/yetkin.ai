"use client";

import { useState, type FormEvent } from "react";
import { ACADEMY_LESSON_ASSISTANT_PATH, ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT } from "@/lib/academy/lesson-assistant-policy";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type LessonAssistantPanelProps = {
  courseSlug: string;
  lessonKey: string;
  currentTimeSec: number;
};

export function LessonAssistantPanel({
  courseSlug,
  lessonKey,
  currentTimeSec,
}: LessonAssistantPanelProps) {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number>(ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || pending) {
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        ACADEMY_LESSON_ASSISTANT_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            courseSlug,
            lessonKey,
            currentTimeSec,
            question: trimmed,
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        data?: { reply?: string; remaining?: number };
        error?: string;
      };
      if (!response.ok || body.ok === false) {
        setReply("");
        setError(typeof body.error === "string" ? body.error : "Cevap yazılamadı.");
        return;
      }
      setReply(body.data?.reply ?? "");
      if (typeof body.data?.remaining === "number") {
        setRemaining(body.data.remaining);
      }
      setQuestion("");
    } catch {
      setError("Cevap yazılamadı. Bir kez daha dene.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-card)]"
      data-academy-lesson-assistant=""
    >
      <h3 className="text-sm font-semibold text-slate-900">Takıldığın yeri sor</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Bu derste {remaining} sorun kaldı. Soru, bulunduğun saniyenin metnine bakar.
      </p>
      <form className="mt-3 flex flex-col gap-2" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={`lesson-ask-${lessonKey}`}>
          Ders sorusu
        </label>
        <textarea
          id={`lesson-ask-${lessonKey}`}
          value={question}
          maxLength={500}
          rows={2}
          disabled={pending || remaining <= 0}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Burada ne oldu?"
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-900"
        />
        <button
          type="submit"
          disabled={pending || remaining <= 0 || question.trim().length === 0}
          className="self-start rounded-full bg-[var(--safir-deep)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Bakıyorum..." : "Sor"}
        </button>
      </form>
      {reply ? <p className="mt-3 text-sm leading-6 text-slate-800">{reply}</p> : null}
      {error ? <p className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}
    </section>
  );
}

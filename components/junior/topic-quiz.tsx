"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { JUNIOR_QUIZ_PATH } from "@/lib/junior/limits";
import type { JuniorPracticeChoice } from "@/lib/junior/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Note = { id: string; ok: boolean; explanation: string };

export function TopicQuiz({
  profileId,
  lessonKey,
  items,
  onCompleted,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorPracticeChoice[];
  onCompleted?: () => void;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError("");
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
        data?: { correct?: number; total?: number; notes?: Note[]; completed?: boolean; advice?: string };
      } | null;
      if (!response.ok || !body?.data) {
        setError(body?.error || "Cevaplar puanlanamadı.");
        return;
      }
      setNotes(body.data.notes ?? []);
      if (body.data.completed) {
        setDone(true);
        setSummary(`${body.data.correct ?? 0} / ${body.data.total ?? 0} doğru. Bu ders tamamlandı.`);
        onCompleted?.();
        router.refresh();
        return;
      }
      setSummary(
        `${body.data.correct ?? 0} / ${body.data.total ?? 0} doğru. Barajın altında kaldın. ${body.data.advice ?? "Testi yeniden çöz."}`,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4">
      <h2 className="text-lg font-semibold">Konu Testi</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {items.length} soru var. Barajı geçince ders tamamlanır. Puan sunucuda hesaplanır.
      </p>
      <div className="mt-4 grid gap-4">
        {items.map((item, questionIndex) => (
          <fieldset key={item.id} className="grid gap-2">
            <legend className="text-sm font-semibold">
              {questionIndex + 1}. {item.prompt}
            </legend>
            {item.choices.map((choice, index) => (
              <label key={choice} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={item.id}
                  checked={choices[item.id] === index}
                  onChange={() => setChoices((current) => ({ ...current, [item.id]: index }))}
                />
                {choice}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <Button type="button" className="mt-4" onClick={() => void onSubmit()} disabled={pending}>
        Testi bitir
      </Button>
      {done ? <p className="mt-3 text-sm font-semibold">Tamamlandı</p> : null}
      {summary ? <p className="mt-3 text-sm font-medium">{summary}</p> : null}
      {notes.length > 0 ? (
        <ul className="mt-2 grid gap-2">
          {notes.map((note) => (
            <li key={note.id} className="text-sm">
              {note.ok ? "Doğru. " : "Eksik. "}
              {note.explanation}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
    </section>
  );
}

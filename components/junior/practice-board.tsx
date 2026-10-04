"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JUNIOR_PRACTICE_PATH } from "@/lib/junior/limits";
import type { JuniorPracticeItem } from "@/lib/junior/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Note = { id: string; ok: boolean; explanation: string };

export function PracticeBoard({
  profileId,
  lessonKey,
  items,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorPracticeItem[];
}) {
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [matches, setMatches] = useState<Record<string, Record<string, string>>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError("");
    try {
      const answers = items.map((item) => {
        if (item.kind === "choice") {
          const choiceIndex = choices[item.id];
          return choiceIndex === undefined ? { id: item.id } : { id: item.id, choiceIndex };
        }
        return { id: item.id, matches: matches[item.id] ?? {} };
      });
      const response = await fetch(
        JUNIOR_PRACTICE_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profileId, lessonKey, answers }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string | null;
        data?: { correct?: number; total?: number; notes?: Note[]; xpAwarded?: number };
      } | null;
      if (!response.ok || !body?.data) {
        setError(body?.error || "Cevaplar puanlanamadı.");
        return;
      }
      setNotes(body.data.notes ?? []);
      setSummary(`${body.data.correct ?? 0} / ${body.data.total ?? 0} doğru. Oyun puanı: ${body.data.xpAwarded ?? 0}.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4">
      <h2 className="text-lg font-semibold">Pekiştir</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Çoktan seçmeli ve eşleştirme sunucuda puanlanır.</p>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <fieldset key={item.id} className="grid gap-2">
            <legend className="text-sm font-semibold">{item.prompt}</legend>
            {item.kind === "choice"
              ? item.choices.map((choice, index) => (
                  <label key={choice} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={item.id}
                      checked={choices[item.id] === index}
                      onChange={() => setChoices((current) => ({ ...current, [item.id]: index }))}
                    />
                    {choice}
                  </label>
                ))
              : item.left.map((left) => (
                  <label key={left.id} className="grid gap-1 text-sm sm:grid-cols-[8rem_1fr] sm:items-center">
                    <span>{left.label}</span>
                    <select
                      value={matches[item.id]?.[left.id] ?? ""}
                      onChange={(event) =>
                        setMatches((current) => ({
                          ...current,
                          [item.id]: { ...current[item.id], [left.id]: event.target.value },
                        }))
                      }
                      className="rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
                    >
                      <option value="">Seç</option>
                      {item.right.map((right) => (
                        <option key={right.id} value={right.id}>
                          {right.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
          </fieldset>
        ))}
      </div>
      <Button type="button" className="mt-4" onClick={() => void onSubmit()} disabled={pending}>
        Cevapları gönder
      </Button>
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

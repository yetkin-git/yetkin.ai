"use client";

import { useEffect, useRef, useState } from "react";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import { playJuniorActivityMiss, playJuniorHintEffect, primeJuniorHintAudio } from "@/lib/junior/hint-effect";
import { JUNIOR_PRACTICE_PATH } from "@/lib/junior/limits";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type CardNote = { id: string; ok: boolean; answer?: string };
type Note = { id: string; ok: boolean; explanation: string; cards?: CardNote[] };
type Mark = "ok" | "miss";

const PASTEL = [
  "border-sky-300 bg-sky-100 text-sky-950",
  "border-amber-300 bg-amber-100 text-amber-950",
  "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950",
  "border-emerald-300 bg-emerald-100 text-emerald-950",
  "border-violet-300 bg-violet-100 text-violet-950",
  "border-orange-300 bg-orange-100 text-orange-950",
] as const;

const SECTION = {
  match: {
    emoji: "🎯",
    title: "1. EŞLEŞTİR",
    wash: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50",
  },
  cloze: {
    emoji: "✏️",
    title: "2. BOŞLUK DOLDUR",
    wash: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50",
  },
  order: {
    emoji: "🧩",
    title: "3. SIRAYA DİZ",
    wash: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
  },
} as const;

function gameCardClass(index: number, mark: Mark | null, picked = false): string {
  const face =
    mark === "ok"
      ? "border-emerald-500 bg-emerald-50 text-emerald-950"
      : mark === "miss"
        ? "animate-shake border-rose-500 bg-rose-50 text-rose-950"
        : `${PASTEL[index % PASTEL.length]} shadow-sm hover:-translate-y-0.5 ${picked ? "scale-[1.02] ring-2 ring-violet-500" : ""}`;
  const room = mark ? "pb-3 pr-28 pt-8" : "py-3";
  return `relative rounded-2xl border-2 px-4 text-left text-base font-semibold transition ${room} ${face}`;
}

function cardState(cards: CardNote[], id: string): { mark: Mark | null; answer?: string } {
  const row = cards.find((card) => card.id === id);
  if (!row) {
    return { mark: null };
  }
  return { mark: row.ok ? "ok" : "miss", answer: row.ok ? undefined : row.answer };
}

function MarkBadge({ mark }: { mark: Mark }) {
  const ok = mark === "ok";
  return (
    <span
      data-junior-card-badge={ok ? "ok" : "miss"}
      className={`pointer-events-none absolute right-2 top-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold text-white ${
        ok ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {ok ? "✓ Doğru" : "✗ Yanlış"}
    </span>
  );
}

function AnswerHint({ answer }: { answer?: string }) {
  if (!answer) {
    return null;
  }
  return (
    <p data-junior-answer-hint="" className="rounded-xl bg-rose-100 px-3 py-1.5 text-sm font-bold text-rose-700">
      Doğru cevap: {answer}
    </p>
  );
}

function GameHeading({ kind }: { kind: keyof typeof SECTION }) {
  const section = SECTION[kind];
  return (
    <h3 className="text-2xl font-extrabold tracking-wide text-slate-900 sm:text-3xl">
      <span aria-hidden="true">{section.emoji} </span>
      {section.title}
    </h3>
  );
}

function ResultLine({ note }: { note: Note | null }) {
  if (!note) {
    return null;
  }
  return (
    <p className={`text-sm font-semibold ${note.ok ? "text-emerald-700" : "text-rose-700"}`}>
      {note.ok ? "Doğru. " : "Yeniden dene. "}
      {note.explanation}
    </p>
  );
}

export function MatchBoard({
  left,
  right,
  value,
  onChange,
  mark,
  attempt,
  note,
  cards,
}: {
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const rightById = new Map(right.map((item) => [item.id, item.label]));
  return (
    <section
      className={`grid gap-4 rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-5 ${SECTION.match.wash}`}
      data-junior-match-board=""
      data-junior-activity-mark={mark ?? undefined}
    >
      <GameHeading kind="match" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-3">
          {left.map((item, index) => {
            const linked = rightById.get(value[item.id] ?? "");
            const state = cardState(cards, item.id);
            return (
              <div key={`${item.id}-${state.mark === "miss" ? attempt : "card"}`} className="grid gap-1.5">
                <button
                  type="button"
                  data-junior-card-mark={state.mark ?? undefined}
                  className={gameCardClass(index, state.mark, picked === item.id)}
                  onClick={() => setPicked(item.id)}
                >
                  {state.mark ? <MarkBadge mark={state.mark} /> : null}
                  <span className="block">{item.label}</span>
                  {linked ? (
                    <span className="mt-1 block text-sm font-bold opacity-80">↔ {linked}</span>
                  ) : null}
                </button>
                <AnswerHint answer={state.answer} />
              </div>
            );
          })}
        </div>
        <div className="grid gap-3">
          {right.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={gameCardClass(index + left.length, null)}
              onClick={() => {
                if (!picked) {
                  return;
                }
                onChange({ ...value, [picked]: item.id });
                setPicked(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <ResultLine note={note} />
    </section>
  );
}

export function OrderBoard({
  tiles,
  value,
  onChange,
  mark,
  attempt,
  note,
  cards,
}: {
  tiles: { id: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
}) {
  const order = value.length === tiles.length ? value : tiles.map((tile) => tile.id);
  const byId = new Map(tiles.map((tile) => [tile.id, tile]));

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) {
      return;
    }
    const next = [...order];
    const [picked] = next.splice(from, 1);
    if (!picked) {
      return;
    }
    next.splice(to, 0, picked);
    onChange(next);
  }

  return (
    <section
      className={`grid gap-4 rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-5 ${SECTION.order.wash}`}
      data-junior-order-board=""
      data-junior-activity-mark={mark ?? undefined}
    >
      <GameHeading kind="order" />
      <ol className="grid gap-3">
        {order.map((id, index) => {
          const tile = byId.get(id);
          if (!tile) {
            return null;
          }
          const state = cardState(cards, id);
          return (
            <li
              key={`${id}-${state.mark === "miss" ? attempt : "card"}`}
              draggable
              data-junior-card-mark={state.mark ?? undefined}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(index));
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(from)) {
                  move(from, index);
                }
              }}
              className={`${gameCardClass(index, state.mark)} flex cursor-grab items-center gap-3 active:cursor-grabbing`}
            >
              {state.mark ? <MarkBadge mark={state.mark} /> : null}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-extrabold">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">{tile.label}</span>
              <button
                type="button"
                className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold"
                aria-label={`${tile.label} yukarı`}
                onClick={() => move(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold"
                aria-label={`${tile.label} aşağı`}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </button>
            </li>
          );
        })}
      </ol>
      <ResultLine note={note} />
    </section>
  );
}

export function ClozeLine({
  before,
  after,
  value,
  onChange,
  mark,
  attempt,
  note,
  cards,
}: {
  before: string;
  after: string;
  value: string;
  onChange: (next: string) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
}) {
  const state = cards[0] ? cardState(cards, cards[0].id) : { mark: null as Mark | null, answer: undefined };
  const blank =
    state.mark === "ok"
      ? "border-solid border-emerald-500 bg-emerald-50"
      : state.mark === "miss"
        ? "border-solid border-rose-500 bg-rose-50"
        : "border-dashed border-violet-300 bg-white";
  return (
    <section
      className={`grid gap-4 rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-5 ${SECTION.cloze.wash}`}
      data-junior-cloze-line=""
      data-junior-activity-mark={mark ?? undefined}
    >
      <GameHeading kind="cloze" />
      <div key={state.mark === "miss" ? attempt : "card"} className="grid gap-1.5">
        <label
          data-junior-card-mark={state.mark ?? undefined}
          className={`${gameCardClass(2, state.mark)} flex flex-wrap items-center gap-2 text-lg leading-8`}
        >
          {state.mark ? <MarkBadge mark={state.mark} /> : null}
          <span>{before}</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Boşluk"
            aria-invalid={state.mark === "miss" ? true : undefined}
            className={`w-28 rounded-2xl border-2 px-3 py-2 text-center text-lg font-extrabold text-slate-900 outline-none ${blank}`}
            maxLength={40}
          />
          <span>{after}</span>
        </label>
        <AnswerHint answer={state.answer} />
      </div>
      <ResultLine note={note} />
    </section>
  );
}

export function ActivityRail({
  profileId,
  lessonKey,
  items,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorActivityPublic[];
}) {
  const [matches, setMatches] = useState<Record<string, Record<string, string>>>({});
  const [clozes, setClozes] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const cheerRef = useRef<HTMLButtonElement>(null);
  const noteById = new Map(notes.map((note) => [note.id, note]));

  function forget(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
    setSummary("");
  }

  useEffect(() => {
    if (!celebrate) {
      return;
    }
    cheerRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCelebrate(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [celebrate]);

  async function onSubmit() {
    primeJuniorHintAudio();
    setPending(true);
    setError("");
    setCelebrate(false);
    try {
      const answers = items.map((item) => {
        if (item.kind === "match") {
          return { id: item.id, matches: matches[item.id] ?? {} };
        }
        if (item.kind === "order") {
          return { id: item.id, order: orders[item.id] ?? item.tiles.map((tile) => tile.id) };
        }
        return { id: item.id, cloze: clozes[item.id] ?? "" };
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
        data?: { correct?: number; total?: number; notes?: Note[] };
      } | null;
      if (!response.ok || !body?.data) {
        setError(body?.error || "Etkinlik puanlanamadı.");
        return;
      }
      const nextNotes = body.data.notes ?? [];
      const correct = body.data.correct ?? 0;
      const total = body.data.total ?? items.length;
      const perfect = total > 0 && correct === total;
      setNotes(nextNotes);
      setAttempt((current) => current + 1);
      setSummary(perfect ? "" : `${correct} / ${total} doğru. Bir daha dene.`);
      if (perfect) {
        setCelebrate(true);
        burstJuniorActivityConfetti();
        playJuniorHintEffect("grasped");
        return;
      }
      playJuniorActivityMiss();
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-[2rem] border-2 border-fuchsia-200 bg-gradient-to-b from-fuchsia-50 via-white to-sky-50 p-4 shadow-sm sm:p-5"
      data-junior-activity-rail=""
    >
      {!profileId ? (
        <p className="mb-4 rounded-2xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-950">
          Puanın yazılması için veli girişi gerekir.
        </p>
      ) : null}
      <div className="grid gap-5">
        {items.map((item) => {
          const note = noteById.get(item.id) ?? null;
          const mark: Mark | null = note ? (note.ok ? "ok" : "miss") : null;
          const cards = note?.cards ?? [];
          if (item.kind === "match") {
            return (
              <MatchBoard
                key={item.id}
                left={item.left}
                right={item.right}
                value={matches[item.id] ?? {}}
                onChange={(next) => {
                  setMatches((current) => ({ ...current, [item.id]: next }));
                  forget(item.id);
                }}
                mark={mark}
                attempt={attempt}
                note={note}
                cards={cards}
              />
            );
          }
          if (item.kind === "order") {
            return (
              <OrderBoard
                key={item.id}
                tiles={item.tiles}
                value={orders[item.id] ?? item.tiles.map((tile) => tile.id)}
                onChange={(next) => {
                  setOrders((current) => ({ ...current, [item.id]: next }));
                  forget(item.id);
                }}
                mark={mark}
                attempt={attempt}
                note={note}
                cards={cards}
              />
            );
          }
          return (
            <ClozeLine
              key={item.id}
              before={item.before}
              after={item.after}
              value={clozes[item.id] ?? ""}
              onChange={(next) => {
                setClozes((current) => ({ ...current, [item.id]: next }));
                forget(item.id);
              }}
              mark={mark}
              attempt={attempt}
              note={note}
              cards={cards}
            />
          );
        })}
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          data-junior-activity-check=""
          className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-8 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onSubmit()}
          disabled={pending || !profileId}
        >
          {pending ? "Kontrol ediliyor…" : "Etkinliği kontrol et"}
        </button>
      </div>
      {summary ? (
        <p className="mt-4 text-center text-base font-extrabold text-rose-600" aria-live="polite">
          {summary}
        </p>
      ) : null}
      {error ? <p className="mt-3 text-center text-sm font-semibold text-rose-600">{error}</p> : null}
      {celebrate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/35 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="junior-activity-cheer"
            data-junior-activity-cheer=""
            className="w-full max-w-sm rounded-[2rem] border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-white px-6 py-8 text-center shadow-2xl"
          >
            <p id="junior-activity-cheer" className="text-3xl font-extrabold text-fuchsia-700">
              Harikasın! Tam Puan 🎉
            </p>
            <button
              ref={cheerRef}
              type="button"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-fuchsia-500 px-6 text-base font-extrabold text-white"
              onClick={() => setCelebrate(false)}
            >
              Devam
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

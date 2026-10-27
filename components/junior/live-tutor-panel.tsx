"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { getJuniorLessonBlueprint } from "@/lib/junior/lesson-engine";
import {
  JUNIOR_LIVE_TUTOR_LOGIN_HINT,
  JUNIOR_LIVE_TUTOR_PATH,
  JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
  JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  JUNIOR_LIVE_TUTOR_TEACHER,
  JUNIOR_LIVE_TUTOR_WELCOME,
} from "@/lib/junior/live-tutor-policy";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type JuniorTutorSceneContext = {
  lessonKey: string;
  cueIndex: number;
  title: string;
  subtitle: string;
};

type ChatRole = "user" | "assistant";

type ChatTurn = {
  id: string;
  role: ChatRole;
  content: string;
};

function newTurn(role: ChatRole, content: string): ChatTurn {
  return { id: crypto.randomUUID(), role, content };
}

const SCENE_EVENT = "junior:live-tutor-scene";

export function LiveTutorPanel({
  lessonKey,
  scene: sceneProp = null,
}: {
  lessonKey: string;
  scene?: JuniorTutorSceneContext | null;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [guestHint, setGuestHint] = useState(false);
  const [remaining, setRemaining] = useState<number>(JUNIOR_LIVE_TUTOR_QUESTION_LIMIT);
  const [scene, setScene] = useState<JuniorTutorSceneContext | null>(sceneProp);
  const blueprint = getJuniorLessonBlueprint(lessonKey);
  const welcome = blueprint?.tutor.welcomeMessage?.trim() || JUNIOR_LIVE_TUTOR_WELCOME;
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    newTurn("assistant", welcome),
  ]);

  useEffect(() => {
    setScene(sceneProp);
  }, [sceneProp]);

  useEffect(() => {
    function onScene(event: Event) {
      const detail = (event as CustomEvent<JuniorTutorSceneContext>).detail;
      if (!detail || detail.lessonKey !== lessonKey) {
        return;
      }
      setScene(detail);
    }
    window.addEventListener(SCENE_EVENT, onScene);
    return () => window.removeEventListener(SCENE_EVENT, onScene);
  }, [lessonKey]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages, pending]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || pending || remaining <= 0) {
      return;
    }
    setPending(true);
    setError("");
    setMessages((current) => [...current, newTurn("user", message)]);
    setInput("");

    const history = messages
      .filter((turn) => turn.content !== welcome)
      .slice(-6)
      .map((turn) => ({ role: turn.role, content: turn.content }));

    try {
      const response = await fetch(
        JUNIOR_LIVE_TUTOR_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lessonKey,
            message,
            history,
            activeSceneTitle: scene?.title ?? "",
            activeSceneSubtitle: scene?.subtitle ?? "",
            cueIndex: scene?.cueIndex ?? 0,
          }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        data?: {
          reply?: string;
          remaining?: number;
          limit?: number;
          guest?: boolean;
        };
      } | null;

      if (!response.ok || !body?.data?.reply) {
        setError(typeof body?.error === "string" ? body.error : "Cevap yazılamadı.");
        setMessages((current) => [
          ...current,
          newTurn("assistant", typeof body?.error === "string" ? body.error : "Bir kez daha dene."),
        ]);
        return;
      }

      if (typeof body.data.remaining === "number") {
        setRemaining(body.data.remaining);
      }
      if (body.data.guest) {
        setGuestHint(true);
      }
      setMessages((current) => [...current, newTurn("assistant", body.data!.reply!)]);
    } catch {
      setError("Bağlantı kopuk. Bir kez daha dene.");
      setMessages((current) => [...current, newTurn("assistant", "Bağlantı kopuk. Bir kez daha dene.")]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function onComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const quickChips =
    (blueprint?.tutor.quickChips.length ?? 0) > 0
      ? blueprint!.tutor.quickChips
      : JUNIOR_LIVE_TUTOR_QUICK_CHIPS;
  const teacherTitle = blueprint?.tutor.teacherName || JUNIOR_LIVE_TUTOR_TEACHER;

  const sceneLabel = scene?.title
    ? scene.subtitle
      ? `${scene.title} · ${scene.subtitle}`
      : scene.title
    : "Ders bağlamı hazır";

  return (
    <section
      data-junior-live-tutor=""
      aria-labelledby={titleId}
      className="flex min-h-[22rem] flex-col overflow-hidden rounded-[1.75rem] border-2 border-sky-200 bg-gradient-to-b from-sky-50 via-white to-emerald-50 shadow-sm"
    >
      <header className="flex items-center gap-3 border-b border-sky-100 bg-white/80 px-3.5 py-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-base font-black text-white shadow-sm ring-2 ring-white"
        >
          {teacherTitle.slice(0, 1).toLocaleUpperCase("tr-TR")}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
            {teacherTitle}
          </h2>
          <p className="truncate text-[11px] font-semibold text-sky-800" data-junior-tutor-scene="">
            {sceneLabel}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-900">
          {remaining} soru
        </span>
      </header>

      <div
        ref={scrollerRef}
        className="flex max-h-[min(28rem,52vh)] min-h-[12rem] flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3"
        data-junior-tutor-messages=""
      >
        {messages.map((turn) => (
          <div
            key={turn.id}
            className={`flex gap-2 ${turn.role === "user" ? "justify-end" : "justify-start"}`}
            data-junior-tutor-turn={turn.role}
          >
            {turn.role === "assistant" ? (
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[11px] font-black text-white"
              >
                S
              </span>
            ) : null}
            <p
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                turn.role === "user"
                  ? "rounded-br-md bg-gradient-to-br from-sky-500 to-emerald-500 text-white"
                  : "rounded-bl-md border border-sky-100 bg-white text-slate-800 shadow-sm"
              }`}
            >
              {turn.content}
            </p>
          </div>
        ))}
        {pending ? (
          <p className="pl-9 text-xs font-semibold text-sky-700" aria-live="polite">
            Selim düşünüyor…
          </p>
        ) : null}
      </div>

      <div className="border-t border-sky-100 bg-white/90 px-3 py-2.5">
        <div className="mb-2 flex flex-wrap gap-1.5" data-junior-tutor-chips="">
          {quickChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              data-junior-tutor-chip={chip.id}
              disabled={pending || remaining <= 0}
              onClick={() => void sendMessage(chip.label)}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-left text-[11px] font-bold text-sky-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true">{chip.emoji}</span>
              <span className="truncate">{chip.label}</span>
            </button>
          ))}
        </div>
        {guestHint ? (
          <p className="mb-2 text-[11px] font-semibold text-amber-800">{JUNIOR_LIVE_TUTOR_LOGIN_HINT}</p>
        ) : null}
        {error ? <p className="mb-2 text-[11px] font-semibold text-rose-700">{error}</p> : null}
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <label className="sr-only" htmlFor={`junior-tutor-input-${lessonKey}`}>
            Selim Öğretmen&apos;e sor
          </label>
          <textarea
            id={`junior-tutor-input-${lessonKey}`}
            ref={inputRef}
            value={input}
            rows={2}
            maxLength={500}
            disabled={pending || remaining <= 0}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onComposerKey}
            placeholder="Takıldığın yeri yaz…"
            data-junior-tutor-input=""
            className="min-h-[2.75rem] w-full resize-none rounded-xl border border-sky-200 bg-sky-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:opacity-60"
          />
          <button
            type="submit"
            data-junior-tutor-send=""
            disabled={pending || remaining <= 0 || !input.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-black text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
            aria-label="Gönder"
          >
            →
          </button>
        </form>
      </div>
    </section>
  );
}

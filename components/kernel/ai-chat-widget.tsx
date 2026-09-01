"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import { UX_SEN, railCitizenHttpError } from "@/lib/copy/sen-voice/ux";
import { ASSISTANT_CHAT_PATH } from "@/lib/kernel/ai/assistant-chat-client";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { cn } from "@/components/ui/cn";
import { IconClose, IconMessage, IconSend } from "@/components/ui/icons";

type ChatRole = "user" | "assistant";

type ChatTurn = {
  id: string;
  role: ChatRole;
  content: string;
};

function newTurn(role: ChatRole, content: string): ChatTurn {
  return { id: crypto.randomUUID(), role, content };
}

export function AiChatWidget({
  dock = "default",
}: {
  dock?: "default" | "footer";
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(5);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    newTurn("assistant", ASSISTANT_SEN.welcome),
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const node = inputRef.current;
    node?.focus();
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [open, messages, pending]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || pending || limitReached) {
      return;
    }
    setPending(true);
    setError(null);
    setNeedsLogin(false);
    setMessages((current) => [...current, newTurn("user", message)]);
    setInput("");

    const history = messages
      .filter((turn) => turn.content !== ASSISTANT_SEN.welcome)
      .slice(-8)
      .map((turn) => ({ role: turn.role, content: turn.content }));

    try {
      const response = await fetch(
        ASSISTANT_CHAT_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, history }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      const mapped = railCitizenHttpError(envelope.status, envelope.error);
      if (envelope.status === 401) {
        setNeedsLogin(true);
        setError(mapped);
        setPending(false);
        return;
      }
      if (!envelope.ok) {
        const notice = envelope.error ?? mapped;
        if (envelope.status === 429 || notice === ASSISTANT_SEN.limitReached) {
          setLimitReached(true);
          setRemaining(0);
        }
        setError(notice);
        setMessages((current) => [...current, newTurn("assistant", notice)]);
        setPending(false);
        return;
      }
      const reply = typeof envelope.body.reply === "string" ? envelope.body.reply.trim() : "";
      const nextRemaining =
        typeof envelope.body.remaining === "number" ? envelope.body.remaining : remaining;
      const nextLimit = typeof envelope.body.limit === "number" ? envelope.body.limit : limit;
      if (typeof nextRemaining === "number") {
        setRemaining(nextRemaining);
        if (nextRemaining <= 0) {
          setLimitReached(true);
        }
      }
      setLimit(nextLimit);
      setMessages((current) => [
        ...current,
        newTurn("assistant", reply || ASSISTANT_SEN.unavailable),
      ]);
    } catch {
      setError(UX_SEN.http.network);
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

  const dockClass =
    dock === "footer"
      ? "bottom-16 right-4 sm:bottom-[4.5rem] sm:right-6"
      : "bottom-6 right-6";

  return (
    <div
      data-assistant-fab=""
      className={cn("pointer-events-none fixed z-50 flex flex-col items-end gap-3", dockClass)}
    >
      <div
        id={titleId}
        role="dialog"
        aria-labelledby={`${titleId}-heading`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={cn(
          "absolute bottom-[calc(100%+0.75rem)] right-0 origin-bottom-right overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)] transition duration-200 ease-out motion-reduce:transition-none",
          "w-[min(22rem,calc(100vw-2rem))] sm:w-[22rem]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-[var(--violet)] to-[var(--safir)] px-4 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <IconMessage className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${titleId}-heading`} className="truncate text-sm font-semibold tracking-tight">
              {ASSISTANT_SEN.title}
            </h2>
            <p className="truncate text-[11px] text-white/75">{ASSISTANT_SEN.role}</p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label={ASSISTANT_SEN.closeLabel}
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="flex max-h-[min(22rem,52vh)] flex-col gap-2.5 overflow-y-auto bg-[var(--surface-muted)] px-3 py-3"
        >
          {messages.map((turn) => (
            <div
              key={turn.id}
              className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}
            >
              <p
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                  turn.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-[var(--violet)] to-[var(--safir)] text-white"
                    : "rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
                )}
              >
                {turn.content}
              </p>
            </div>
          ))}
          {pending ? (
            <p className="text-xs text-[var(--muted)]">{ASSISTANT_SEN.sending}</p>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Link
              href="/academy"
              className="inline-flex min-h-8 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-[11px] font-medium text-[var(--foreground)] hover:border-[var(--safir)]"
              onClick={() => setOpen(false)}
            >
              {ASSISTANT_SEN.academyCta}
            </Link>
            <Link
              href="/career"
              className="inline-flex min-h-8 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 text-[11px] font-medium text-[var(--foreground)] hover:border-[var(--safir)]"
              onClick={() => setOpen(false)}
            >
              {ASSISTANT_SEN.careerCta}
            </Link>
          </div>
          <p className="mb-2 text-[11px] text-[var(--muted)]">
            {limitReached
              ? ASSISTANT_SEN.limitReached
              : remaining == null
                ? ASSISTANT_SEN.quotaHint
                : ASSISTANT_SEN.remaining(remaining, limit)}
          </p>
          {error && needsLogin ? (
            <p className="mb-2 text-xs text-[var(--amber)]">
              {error}{" "}
              <Link href="/login" className="font-semibold underline">
                {ASSISTANT_SEN.loginCta}
              </Link>
            </p>
          ) : null}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onComposerKey}
              placeholder={ASSISTANT_SEN.placeholder}
              rows={2}
              maxLength={2000}
              disabled={pending || limitReached}
              className="min-h-[2.75rem] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-base outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--safir)] focus:ring-4 focus:ring-[var(--safir-soft)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || limitReached || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--violet)] to-[var(--safir)] text-white shadow-[0_8px_18px_rgba(109,92,255,0.35)] disabled:opacity-50"
              aria-label={ASSISTANT_SEN.send}
            >
              <IconSend className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={titleId}
        aria-label={open ? ASSISTANT_SEN.closeLabel : ASSISTANT_SEN.openLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "assistant-fab-button pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full text-white",
          "bg-gradient-to-br from-[var(--violet)] to-[var(--safir)]",
          "shadow-[0_10px_28px_rgba(109,92,255,0.45),0_0_32px_rgba(26,140,255,0.35)]",
          "transition duration-200 hover:brightness-110 motion-reduce:transition-none",
        )}
      >
        <span
          aria-hidden
          className="assistant-fab-pulse absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),transparent_68%)] motion-reduce:animate-none"
        />
        {open ? <IconClose className="relative h-6 w-6" /> : <IconMessage className="relative h-6 w-6" />}
      </button>
    </div>
  );
}

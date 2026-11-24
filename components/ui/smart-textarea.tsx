"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type TextareaHTMLAttributes,
} from "react";
import { IconCheck } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/cn";
import {
  FORM_COACH_MAX_INPUT_CHARS,
  FORM_COACH_MIN_CHARS_FOR_API,
  FORM_COACH_PATH,
  type FormCoachContext,
} from "@/lib/kernel/ai/form-coach-client";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { assessIdeaDetail } from "@/lib/yetkinhibe/idea-detail";

const DEBOUNCE_MS = 2_000;

const DEFAULT_SOFT = "Biraz daha detay ekleyin…";
const DEFAULT_READY = "✓ Temel detaylar yeterli";

export type SmartTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Form bağlamı — koç ipucunu buna göre üretir. */
  context?: FormCoachContext;
  /** false ise yalnız istemci eşiği çalışır; API çağrılmaz. */
  coachEnabled?: boolean;
  softHint?: string;
  readyHint?: string;
};

/**
 * Hibrit akıllı textarea.
 * 1) Anlık istemci eşiği (20 karakter + 3 kelime) — 0 API maliyeti.
 * 2) onBlur veya 2 sn debounce (≥30 karakter, metin değişmişse) — /api/ai/form-coach.
 */
export function SmartTextarea({
  className = "",
  context = "general",
  coachEnabled = true,
  softHint = DEFAULT_SOFT,
  readyHint = DEFAULT_READY,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder = "Metnini buraya yaz…",
  ...props
}: SmartTextareaProps) {
  const [uncontrolled, setUncontrolled] = useState(
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const controlled = value !== undefined;
  const text = controlled ? String(value ?? "") : uncontrolled;
  const detail = assessIdeaDetail(text);

  const [coachTip, setCoachTip] = useState("");
  const [coachPending, setCoachPending] = useState(false);
  const lastCoachedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  function scheduleCoach(nextText: string) {
    if (!coachEnabled) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const trimmed = nextText.trim();
    if (trimmed.length < FORM_COACH_MIN_CHARS_FOR_API) {
      return;
    }
    if (trimmed === lastCoachedRef.current) {
      return;
    }
    debounceRef.current = setTimeout(() => {
      void requestCoach(trimmed);
    }, DEBOUNCE_MS);
  }

  async function requestCoach(raw: string) {
    if (!coachEnabled) {
      return;
    }
    const trimmed = raw.trim().slice(0, FORM_COACH_MAX_INPUT_CHARS);
    if (trimmed.length < FORM_COACH_MIN_CHARS_FOR_API) {
      return;
    }
    if (trimmed === lastCoachedRef.current) {
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setCoachPending(true);
    try {
      const response = await fetch(
        FORM_COACH_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: trimmed, context }),
          signal: controller.signal,
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        data?: { tip?: string };
      } | null;
      if (!response.ok || body?.ok === false || typeof body?.data?.tip !== "string") {
        return;
      }
      lastCoachedRef.current = trimmed;
      setCoachTip(body.data.tip);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    } finally {
      if (abortRef.current === controller) {
        setCoachPending(false);
      }
    }
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    void requestCoach(event.currentTarget.value);
    onBlur?.(event);
  }

  return (
    <div className="relative" data-smart-textarea="" data-smart-context={context}>
      <span className="relative block">
        <Textarea
          {...props}
          value={controlled ? value : undefined}
          defaultValue={controlled ? undefined : defaultValue}
          placeholder={placeholder}
          className={cn(
            "pr-10 not-italic placeholder:font-normal placeholder:italic placeholder:text-slate-400",
            detail === "ready" ? "border-emerald-400 focus:border-emerald-500" : "",
            className,
          )}
          onChange={(event) => {
            if (!controlled) {
              setUncontrolled(event.target.value);
            }
            setCoachTip("");
            onChange?.(event);
            scheduleCoach(event.target.value);
          }}
          onBlur={handleBlur}
        />
        {detail === "ready" ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
          >
            <IconCheck className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </span>
      {detail === "short" ? (
        <p className="mt-1.5 text-sm text-slate-500" data-smart-soft="">
          {softHint}
        </p>
      ) : null}
      {detail === "ready" && !coachTip ? (
        <p className="mt-1.5 text-sm font-medium text-emerald-700" data-smart-ready="">
          {readyHint}
        </p>
      ) : null}
      {coachPending ? (
        <p className="mt-1.5 text-sm text-slate-500" data-smart-coach-pending="">
          İpucu hazırlanıyor…
        </p>
      ) : null}
      {coachTip ? (
        <p className="mt-1.5 text-sm text-[var(--foreground)]" data-smart-coach-tip="" role="status">
          {coachTip}
        </p>
      ) : null}
    </div>
  );
}

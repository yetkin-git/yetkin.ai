"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { IconClose } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";

export type ActionBridgeTone = "emerald" | "safir" | "amber";

export type ActionBridgePayload = {
  title: string;
  body?: string;
  href?: string;
  cta?: string;
  tone?: ActionBridgeTone;
  ttlMs?: number;
};

export type ActionBridgeToast = ActionBridgePayload & { id: string };

type ActionBridgeValue = {
  push: (toast: ActionBridgePayload) => void;
};

const ActionBridgeContext = createContext<ActionBridgeValue | null>(null);
const MAX_VISIBLE = 3;
const DEFAULT_TTL_MS = 9_000;

export function ActionBridgeProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActionBridgeToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((row) => row.id !== id));
  }, []);

  const push = useCallback((toast: ActionBridgePayload) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { ...toast, id }]);
    const ttl = toast.ttlMs ?? DEFAULT_TTL_MS;
    window.setTimeout(() => {
      setToasts((current) => current.filter((row) => row.id !== id));
    }, ttl);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ActionBridgeContext.Provider value={value}>
      {children}
      <div className="action-bridge-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            role="status"
            className={cn(
              "action-bridge-toast rounded-[var(--radius-card)] border bg-[var(--surface)] p-4 shadow-[var(--shadow-lift)]",
              toast.tone === "amber"
                ? "border-[var(--amber)]/40"
                : toast.tone === "safir"
                  ? "border-[var(--safir)]/35"
                  : "border-[var(--emerald)]/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {UX_SEN.bridge.kicker}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-[var(--foreground)]">{toast.title}</p>
                {toast.body ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{toast.body}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                onClick={() => dismiss(toast.id)}
                aria-label={UX_SEN.bridge.dismiss}
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            {toast.href && toast.cta ? (
              <Link
                href={toast.href}
                className="mt-3 inline-flex text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                onClick={() => dismiss(toast.id)}
              >
                {toast.cta}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </ActionBridgeContext.Provider>
  );
}

export function useActionBridge(): ActionBridgeValue {
  const ctx = useContext(ActionBridgeContext);
  if (!ctx) {
    throw new Error("ActionBridgeProvider gerekli.");
  }
  return ctx;
}

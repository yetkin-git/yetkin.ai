"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { COOKIE_CONSENT_COPY } from "@/lib/copy/legal-launch";
import {
  persistCookieConsent,
  type CookieConsentChoice,
} from "@/lib/kernel/telemetry/cookie-consent";

/** Alt şerit. Tercih yokken görünür; seçimden sonra kapanır. Sayfayı kilitlemez. */
export function CookieConsentBanner({
  initialChoice,
}: {
  initialChoice: CookieConsentChoice | null;
}) {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(initialChoice);
  if (choice) {
    return null;
  }

  function choose(next: CookieConsentChoice) {
    persistCookieConsent(next);
    setChoice(next);
  }

  return (
    <div
      role="dialog"
      aria-label={COOKIE_CONSENT_COPY.title}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{COOKIE_CONSENT_COPY.title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">{COOKIE_CONSENT_COPY.necessaryLegend}. </span>
            {COOKIE_CONSENT_COPY.body}{" "}
            <Link href={COOKIE_CONSENT_COPY.policyHref} className="font-semibold text-[var(--safir-deep)] hover:underline">
              {COOKIE_CONSENT_COPY.policyLabel}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className={buttonClassName("outline", "sm")}
            onClick={() => choose("necessary")}
          >
            {COOKIE_CONSENT_COPY.necessaryOnly}
          </button>
          <button
            type="button"
            className={buttonClassName("primary", "sm")}
            onClick={() => choose("analytics")}
          >
            {COOKIE_CONSENT_COPY.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

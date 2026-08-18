"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconClose } from "@/components/ui/icons";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import {
  computeWalletShortfallMinor,
  isQuickTopUpCapped,
  isQuickTopUpMinLift,
  suggestQuickTopUpAmountMinor,
} from "@/lib/kernel/payments/quick-top-up";

const POLL_MS = 2_500;
const POLL_MAX_MS = 90_000;

export function QuickTopUpModal({
  open,
  requiredMinor,
  currencyCode = SETTLEMENT_CURRENCY,
  onClose,
  onFunded,
}: {
  open: boolean;
  requiredMinor: number;
  currencyCode?: CurrencyCode;
  onClose: () => void;
  onFunded: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <QuickTopUpDialog
      requiredMinor={requiredMinor}
      currencyCode={currencyCode}
      onClose={onClose}
      onFunded={onFunded}
    />
  );
}

function QuickTopUpDialog({
  requiredMinor,
  currencyCode,
  onClose,
  onFunded,
}: {
  requiredMinor: number;
  currencyCode: CurrencyCode;
  onClose: () => void;
  onFunded: () => void;
}) {
  const titleId = useId();
  const copy = UX_SEN.topUp;
  const idempotency = useIdempotencyKey();
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [amountMajor, setAmountMajor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [watchStrip, setWatchStrip] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const onFundedRef = useRef(onFunded);

  const shortfall = computeWalletShortfallMinor(requiredMinor, balanceMinor ?? 0);
  const suggested = suggestQuickTopUpAmountMinor(shortfall);
  const minLabel = formatMinor(WALLET_TOP_UP_MIN_MINOR, currencyCode);
  const maxLabel = formatMinor(WALLET_TOP_UP_MAX_MINOR, currencyCode);
  const waitingClearing = watchStrip && !timedOut;

  useEffect(() => {
    onFundedRef.current = onFunded;
  }, [onFunded]);

  useEffect(() => {
    let cancelled = false;
    void fetchWalletStripClient().then((strip) => {
      if (cancelled) {
        return;
      }
      setBalanceMinor(strip.amountMinor);
      if (strip.live && strip.amountMinor >= requiredMinor) {
        onFundedRef.current();
        return;
      }
      const gap = computeWalletShortfallMinor(requiredMinor, strip.amountMinor);
      setAmountMajor(String(suggestQuickTopUpAmountMinor(gap) / 100));
    });
    return () => {
      cancelled = true;
    };
  }, [requiredMinor]);

  useEffect(() => {
    if (!watchStrip) {
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - started >= POLL_MAX_MS) {
        window.clearInterval(timer);
        setTimedOut(true);
        return;
      }
      void fetchWalletStripClient().then((strip) => {
        setBalanceMinor(strip.amountMinor);
        if (strip.live && strip.amountMinor >= requiredMinor) {
          window.clearInterval(timer);
          onFundedRef.current();
        }
      });
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [watchStrip, requiredMinor]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setIframeUrl(null);
    setTimedOut(false);
    setWatchStrip(false);
    const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
    const response = await fetch("/api/wallet/top-up", {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ amountMinor }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      iframeUrl?: string;
      alreadySettled?: boolean;
    };
    setPending(false);
    if (body.ok && body.alreadySettled) {
      idempotency.rotate();
      const strip = await fetchWalletStripClient();
      setBalanceMinor(strip.amountMinor);
      if (strip.amountMinor >= requiredMinor) {
        onFundedRef.current();
      } else {
        setWatchStrip(true);
      }
      return;
    }
    if (!body.ok || !body.iframeUrl) {
      idempotency.rotate();
      setError(body.error ?? copy.fail);
      return;
    }
    idempotency.rotate();
    setIframeUrl(body.iframeUrl);
    setWatchStrip(true);
  }

  return (
    <div className="quick-top-up-overlay" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="quick-top-up-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.eyebrow}</p>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            onClick={onClose}
            aria-label={copy.close}
          >
            <IconClose className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-2 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">{copy.required(formatMinor(requiredMinor, currencyCode))}</p>
          {balanceMinor != null ? <p>{copy.balance(formatMinor(balanceMinor, currencyCode))}</p> : null}
          {shortfall > 0 ? (
            <p className="text-[var(--rose)]" aria-live="polite">
              {copy.shortfall(formatMinor(shortfall, currencyCode))}
            </p>
          ) : null}
          <p>{copy.bandHint(minLabel, maxLabel)}</p>
          {isQuickTopUpMinLift(shortfall, suggested) ? <p>{copy.minLift(formatMinor(suggested, currencyCode))}</p> : null}
          {isQuickTopUpCapped(shortfall, suggested) ? <p>{copy.capHint(maxLabel)}</p> : null}
        </div>
        <form onSubmit={(event) => void onSubmit(event)} className="mt-4 space-y-3">
          <label className="block text-sm text-[var(--foreground)]">
            {copy.amountLabel}
            <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
          </label>
          {error ? (
            <p aria-live="assertive" className="text-sm text-[var(--rose)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </Button>
        </form>
        {iframeUrl ? (
          <iframe
            title={copy.iframeTitle}
            src={iframeUrl}
            className="mt-4 h-[min(24rem,55vh)] w-full rounded-xl border border-[var(--border)]"
          />
        ) : null}
        {waitingClearing ? (
          <p aria-live="polite" className="mt-3 text-xs text-[var(--muted)]">
            {copy.waitingClearing}
          </p>
        ) : null}
        {timedOut ? (
          <p aria-live="polite" className="mt-2 text-xs text-[var(--amber)]">
            {copy.timeout}{" "}
            <Link href={WALLET_SURFACE_PATH} className="font-semibold text-[var(--safir-deep)] hover:underline">
              {copy.cuzdanCta}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

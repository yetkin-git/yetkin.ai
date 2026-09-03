"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconClose } from "@/components/ui/icons";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import {
  computeWalletShortfallMinor,
  isQuickTopUpCapped,
  isQuickTopUpMinLift,
  suggestQuickTopUpAmountMinor,
} from "@/lib/kernel/payments/quick-top-up";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { LEGAL_CHECKOUT_CONSENT_COPY } from "@/lib/copy/legal-launch";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

const POLL_MS = 2_500;
const POLL_MAX_MS = 90_000;

export function QuickTopUpModal({
  open,
  requiredMinor,
  currencyCode = SETTLEMENT_CURRENCY,
  lockSuggestedAmount = false,
  onClose,
  onFunded,
}: {
  open: boolean;
  requiredMinor: number;
  currencyCode?: CurrencyCode;
  /** Akademi kapısı — kullanıcı PayTR tutarını kart fiyatından sapıtamaz. */
  lockSuggestedAmount?: boolean;
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
      lockSuggestedAmount={lockSuggestedAmount}
      onClose={onClose}
      onFunded={onFunded}
    />
  );
}

function QuickTopUpDialog({
  requiredMinor,
  currencyCode,
  lockSuggestedAmount,
  onClose,
  onFunded,
}: {
  requiredMinor: number;
  currencyCode: CurrencyCode;
  lockSuggestedAmount: boolean;
  onClose: () => void;
  onFunded: () => void;
}) {
  const titleId = useId();
  const copy = UX_SEN.topUp;
  const report = useCitizenWriteFeedback();
  const idempotency = useIdempotencyKey();
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [amountMajor, setAmountMajor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [watchStrip, setWatchStrip] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [sandboxLive, setSandboxLive] = useState(false);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const billing = useCheckoutBilling();
  const onFundedRef = useRef(onFunded);

  const shortfall = computeWalletShortfallMinor(requiredMinor, balanceMinor ?? 0);
  const suggested = suggestQuickTopUpAmountMinor(shortfall);
  const _minLabel = formatMinor(WALLET_TOP_UP_MIN_MINOR, currencyCode);
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
    if (!distanceAccepted || !digitalAccepted) {
      setError(LEGAL_CHECKOUT_CONSENT_COPY.required);
      return;
    }
    const billingPayload = billing.payload();
    if (!billingPayload.ok) {
      setError(billingPayload.error);
      return;
    }
    setPending(true);
    setError(null);
    setIframeUrl(null);
    setTimedOut(false);
    setWatchStrip(false);
    try {
      const amountMinor = lockSuggestedAmount
        ? suggested
        : Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
      const response = await fetch(
        "/api/wallet/top-up",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({
            amountMinor,
            distanceContractAccepted: true,
            digitalImmediatePerformanceAccepted: true,
            consentVersion: CHECKOUT_LEGAL_CONSENT_VERSION,
            billing: billingPayload.billing,
          }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      const iframe = typeof envelope.body.iframeUrl === "string" ? envelope.body.iframeUrl : null;
      if (envelope.body.sandboxMode === true) {
        setSandboxLive(true);
      }
      setPending(false);
      if (envelope.ok && envelope.body.mockCheckout === true) {
        idempotency.rotate();
        setError(copy.mockNoCredit);
        return;
      }
      if (envelope.ok && envelope.body.alreadySettled === true) {
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
      if (!envelope.ok || !iframe) {
        idempotency.rotate();
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      idempotency.rotate();
      setIframeUrl(iframe);
      setWatchStrip(true);
    } catch {
      setPending(false);
      idempotency.rotate();
      setError(UX_SEN.http.network);
    }
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
          {lockSuggestedAmount ? <p>{copy.amountLocked}</p> : null}
          {sandboxLive ? <p className="text-[var(--amber)]">{copy.sandboxHint}</p> : null}
          {isQuickTopUpMinLift(shortfall, suggested) ? <p>{copy.minLift(formatMinor(suggested, currencyCode))}</p> : null}
          {isQuickTopUpCapped(shortfall, suggested) ? <p>{copy.capHint(maxLabel)}</p> : null}
        </div>
        <form onSubmit={(event) => void onSubmit(event)} className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {copy.amountLabel}
            <Input
              value={amountMajor}
              onChange={(event) => setAmountMajor(event.target.value)}
              required
              readOnly={lockSuggestedAmount}
            />
          </label>
          <CheckoutBillingFields value={billing.form} onChange={billing.setForm} hadSaved={billing.hadSaved} />
          <CheckoutConsentFields
            distanceAccepted={distanceAccepted}
            digitalAccepted={digitalAccepted}
            onDistanceChange={setDistanceAccepted}
            onDigitalChange={setDigitalAccepted}
            showWalletHint
          />
          {error ? (
            <p aria-live="assertive" className="text-sm text-[var(--rose)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || !distanceAccepted || !digitalAccepted}>
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
          <p aria-live="polite" className="mt-3 text-xs text-slate-600">
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

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { WALLET_TOP_UP_MAX_MINOR, WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { LEGAL_CHECKOUT_CONSENT_COPY } from "@/lib/copy/legal-launch";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

const POLL_MS = 2_500;
const POLL_MAX_MS = 90_000;

export function WalletTopUpForm({
  enabled = true,
  paymentsReady = true,
  sandbox = false,
}: {
  enabled?: boolean;
  paymentsReady?: boolean;
  sandbox?: boolean;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const copy = UX_SEN.topUp;
  const [amountMajor, setAmountMajor] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waitingClearing, setWaitingClearing] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [sandboxLive, setSandboxLive] = useState(sandbox);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const billing = useCheckoutBilling();
  const baselineRef = useRef<number | null>(null);
  const idempotency = useIdempotencyKey();
  const minLabel = formatMinor(WALLET_TOP_UP_MIN_MINOR, SETTLEMENT_CURRENCY);
  const maxLabel = formatMinor(WALLET_TOP_UP_MAX_MINOR, SETTLEMENT_CURRENCY);

  useEffect(() => {
    if (!iframeUrl) {
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (Date.now() - started >= POLL_MAX_MS) {
        window.clearInterval(timer);
        setWaitingClearing(false);
        setTimedOut(true);
        return;
      }
      void fetchWalletStripClient().then((strip) => {
        const baseline = baselineRef.current;
        if (strip.live && baseline != null && strip.amountMinor > baseline) {
          window.clearInterval(timer);
          setWaitingClearing(false);
          setTimedOut(false);
          setIframeUrl(null);
          push({
            title: UX_SEN.bridge.topUpSettled.title,
            body: UX_SEN.bridge.topUpSettled.body,
            href: UX_SEN.bridge.topUpHref,
            cta: UX_SEN.bridge.topUpSettled.cta,
            tone: "emerald",
          });
          router.refresh();
        }
      });
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [iframeUrl, push, router]);

  if (!enabled) {
    return <p className="text-sm text-[var(--muted)]">{CUZDAN_SEN.topUpAuth}</p>;
  }

  if (!paymentsReady) {
    return (
      <div className="rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">{CUZDAN_SEN.paymentsUnconfigured}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{CUZDAN_SEN.paymentsUnconfiguredBody}</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex text-sm font-semibold text-[var(--safir-deep)] hover:underline"
        >
          {CUZDAN_SEN.paymentsUnconfiguredCta}
        </Link>
      </div>
    );
  }

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
    setWaitingClearing(false);
    setTimedOut(false);
    try {
      const strip = await fetchWalletStripClient();
      baselineRef.current = strip.amountMinor;
      const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
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
        setError(null);
        push({
          title: UX_SEN.bridge.topUpSettled.title,
          body: UX_SEN.bridge.topUpSettled.body,
          href: UX_SEN.bridge.topUpHref,
          cta: UX_SEN.bridge.topUpSettled.cta,
          tone: "emerald",
        });
        router.refresh();
        return;
      }
      if (!envelope.ok || !iframe) {
        idempotency.rotate();
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      idempotency.rotate();
      setIframeUrl(iframe);
      setWaitingClearing(true);
    } catch {
      setPending(false);
      idempotency.rotate();
      setError(UX_SEN.http.network);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium">
        {copy.amountLabel}
        <Input value={amountMajor} onChange={(event) => setAmountMajor(event.target.value)} required />
      </label>
      <p className="text-xs text-slate-600">{CUZDAN_SEN.topUpBand(minLabel, maxLabel)}</p>
      <CheckoutBillingFields value={billing.form} onChange={billing.setForm} hadSaved={billing.hadSaved} />
      <CheckoutConsentFields
        distanceAccepted={distanceAccepted}
        digitalAccepted={digitalAccepted}
        onDistanceChange={setDistanceAccepted}
        onDigitalChange={setDigitalAccepted}
        showWalletHint
      />
      {sandboxLive ? (
        <p className="text-xs text-[var(--amber)]">{CUZDAN_SEN.sandboxHint}</p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending || !distanceAccepted || !digitalAccepted}>
        {pending ? copy.pending : copy.submit}
      </Button>
      {iframeUrl ? (
        <iframe
          title={copy.iframeTitle}
          src={iframeUrl}
          className="mt-3 h-[min(24rem,55vh)] w-full rounded-md border border-[var(--border)]"
        />
      ) : null}
      {waitingClearing ? (
        <p aria-live="polite" className="text-xs text-slate-600">
          {copy.waitingClearing}
        </p>
      ) : null}
      {timedOut ? (
        <p aria-live="polite" className="text-xs text-[var(--amber)]">
          {copy.timeout}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { useActionBridge } from "@/components/ui/action-bridge";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { SettlementSteps } from "@/components/academy/settlement-steps";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { stripZeroKurusFromTryLabel } from "@/lib/kernel/money/format";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import type { AcademyPurchasePath } from "@/lib/academy/purchase-path";
import { academyCardOfferPaths } from "@/lib/academy/purchase-path";
import { academyPaytrTopUpMinor } from "@/lib/academy/catalog-pricing";
import { ACADEMY_CHECKOUT_HASH, ACADEMY_HERO_PAYTR_EVENT } from "@/lib/academy/storefront-cta";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { SecurePaymentMarks } from "@/components/legal/secure-payment-marks";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { LEGAL_CHECKOUT_CONSENT_COPY } from "@/lib/copy/legal-launch";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import type { CheckoutBillingInfo } from "@/lib/kernel/identity/billing-info";

function revealCheckoutGap() {
  document.getElementById(ACADEMY_CHECKOUT_HASH)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function PurchaseButton({
  courseId,
  courseSlug,
  lockMinutes,
  priceMinor,
  priceLabel,
  currencyCode = SETTLEMENT_CURRENCY,
  walletMinor = null,
  trainingHref,
  examHref,
  courseLevel,
  paymentsReady = true,
}: {
  courseId: string;
  /** SKU slug — kasa özeti mühürlü ses vaadini yalnız ilgili kursta basar. */
  courseSlug?: string;
  lockMinutes: number;
  priceMinor?: number | null;
  priceLabel?: string | null;
  currencyCode?: CurrencyCode;
  walletMinor?: number | null;
  /** Eğitim yolu — oynatıcı. */
  trainingHref?: string;
  /** Doğrudan sınav/vize yolu — kurs sayfası sınav kapısı. */
  examHref?: string;
  courseLevel?: string | null;
  paymentsReady?: boolean;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const report = useCitizenWriteFeedback();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "locking" | "settling">("idle");
  const [activePath, setActivePath] = useState<AcademyPurchasePath | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [paytrIframeUrl, setPaytrIframeUrl] = useState<string | null>(null);
  const [paytrPending, setPaytrPending] = useState(false);
  const [checkoutBilling, setCheckoutBilling] = useState<CheckoutBillingInfo | null>(null);
  const [queuePaytr, setQueuePaytr] = useState(false);
  const paytrInFlight = useRef(false);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const billing = useCheckoutBilling();
  const idempotency = useIdempotencyKey();
  const consentReady = distanceAccepted && digitalAccepted;
  const pending = phase !== "idle";
  const requiredMinor = priceMinor && priceMinor > 0 ? priceMinor : WALLET_TOP_UP_MIN_MINOR;
  const needsTopUp =
    typeof walletMinor === "number" && typeof priceMinor === "number" && priceMinor > 0 && walletMinor < priceMinor;
  /** Faz 1 — kasa tek kapı: eğitimi al. Exam CTA motor sicilinde durur, UI'da yok. */
  const offers = academyCardOfferPaths(courseSlug).filter((offer) => offer.path !== "exam");

  const onBuy = useCallback(
    async (path: AcademyPurchasePath, billingInfo: CheckoutBillingInfo) => {
      setActivePath(path);
      setPhase("locking");
      setError(null);
      const successHref = path === "exam" ? examHref : trainingHref;
      try {
        const lockResponse = await fetch(
          `/api/academy/courses/${courseId}/lock`,
          withRailApiVersion({ method: "POST" }),
        );
        const lockEnvelope = await readCitizenEnvelope(lockResponse);
        const lock = lockEnvelope.body.lock;
        const lockId =
          lock && typeof lock === "object" && "id" in lock && typeof lock.id === "string" ? lock.id : null;
        if (!lockEnvelope.ok || !lockId) {
          setPhase("idle");
          setActivePath(null);
          setError(report(lockEnvelope.status, lockEnvelope.error, ACADEMY_SEN.purchase.lockFail));
          return;
        }
        setPhase("settling");
        const buyResponse = await fetch(
          `/api/academy/courses/${courseId}/purchase`,
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json", ...idempotency.headers() },
            body: JSON.stringify({
              lockId,
              level: courseLevel ?? undefined,
              path,
              distanceContractAccepted: true,
              digitalImmediatePerformanceAccepted: true,
              consentVersion: CHECKOUT_LEGAL_CONSENT_VERSION,
              billing: billingInfo,
            }),
          }),
        );
        const buyEnvelope = await readCitizenEnvelope(buyResponse);
        const purchase = buyEnvelope.body.purchase;
        const purchaseOk =
          buyEnvelope.ok &&
          purchase &&
          typeof purchase === "object" &&
          "id" in purchase &&
          typeof purchase.id === "string";
        if (!purchaseOk) {
          setPhase("idle");
          setActivePath(null);
          const message = report(buyEnvelope.status, buyEnvelope.error, ACADEMY_SEN.purchase.buyFail);
          setError(message);
          if (isInsufficientBalanceError(buyEnvelope.error) || isInsufficientBalanceError(message)) {
            return "shortfall" as const;
          }
          return;
        }
        push({
          title: UX_SEN.bridge.purchaseAcademy.title,
          body: UX_SEN.bridge.purchaseAcademy.body,
          href: successHref,
          cta: successHref ? UX_SEN.bridge.purchaseAcademy.cta : undefined,
          tone: "emerald",
        });
        if (successHref) {
          router.push(successHref);
        } else {
          router.refresh();
        }
      } catch {
        setPhase("idle");
        setActivePath(null);
        setError(UX_SEN.http.network);
      }
    },
    [courseId, courseLevel, examHref, idempotency, push, report, router, trainingHref],
  );

  const reportPaytrIframeError = useCallback(
    (message: string, detail?: unknown) => {
      console.error("PayTR iFrame alınamadı:", message, detail);
      push({
        title: UX_SEN.topUp.iframeFailTitle,
        body: message,
        tone: "amber",
      });
      setError(message);
    },
    [push],
  );

  const requestPaytrIframe = useCallback(
    async (billingInfo: CheckoutBillingInfo, amountMinor: number): Promise<string | "settled" | null> => {
      try {
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
              billing: billingInfo,
            }),
          }),
        );
        const envelope = await readCitizenEnvelope(response);
        const iframe = readPaytrIframeSrcFromCheckout(envelope.body);
        if (envelope.ok && envelope.body.mockCheckout === true) {
          idempotency.rotate();
          reportPaytrIframeError(UX_SEN.topUp.mockNoCredit, envelope.body);
          return null;
        }
        if (envelope.ok && envelope.body.alreadySettled === true) {
          idempotency.rotate();
          return "settled";
        }
        if (!envelope.ok || !iframe) {
          idempotency.rotate();
          const message = report(envelope.status, envelope.error, UX_SEN.topUp.fail);
          reportPaytrIframeError(message, envelope.error ?? envelope.body);
          return null;
        }
        idempotency.rotate();
        return iframe;
      } catch (err) {
        idempotency.rotate();
        reportPaytrIframeError(UX_SEN.http.network, err);
        return null;
      }
    },
    [idempotency, report, reportPaytrIframeError],
  );

  const startPaytrCheckout = useCallback(async () => {
    if (pending || paytrInFlight.current) {
      return;
    }
    setActivePath("training");
    if (!paymentsReady) {
      reportPaytrIframeError(ACADEMY_SEN.purchase.closedBody);
      return;
    }
    if (!billing.hydrated) {
      setQueuePaytr(true);
      return;
    }
    if (!consentReady) {
      setError(LEGAL_CHECKOUT_CONSENT_COPY.required);
      revealCheckoutGap();
      return;
    }
    const billingPayload = billing.payload();
    if (!billingPayload.ok) {
      setError(billingPayload.error);
      revealCheckoutGap();
      return;
    }
    setCheckoutBilling(billingPayload.billing);
    const walletForPaytr = typeof walletMinor === "number" ? walletMinor : 0;
    const amountMinor = academyPaytrTopUpMinor(requiredMinor, walletForPaytr);
    if (amountMinor === 0) {
      void onBuy("training", billingPayload.billing);
      return;
    }
    paytrInFlight.current = true;
    setError(null);
    setPaytrIframeUrl(null);
    setPaytrPending(true);
    setTopUpOpen(true);
    try {
      const iframe = await requestPaytrIframe(billingPayload.billing, amountMinor);
      if (iframe === "settled") {
        setTopUpOpen(false);
        const buyResult = await onBuy("training", billingPayload.billing);
        if (buyResult === "shortfall") {
          setTopUpOpen(true);
        }
        return;
      }
      if (iframe) {
        setPaytrIframeUrl(iframe);
      }
    } finally {
      paytrInFlight.current = false;
      setPaytrPending(false);
    }
  }, [
    billing,
    consentReady,
    onBuy,
    paymentsReady,
    pending,
    reportPaytrIframeError,
    requestPaytrIframe,
    requiredMinor,
    walletMinor,
  ]);

  useEffect(() => {
    if (!queuePaytr || !billing.hydrated) {
      return;
    }
    setQueuePaytr(false);
    void startPaytrCheckout();
  }, [billing.hydrated, queuePaytr, startPaytrCheckout]);

  useEffect(() => {
    function onHeroPaytr() {
      void startPaytrCheckout();
    }
    window.addEventListener(ACADEMY_HERO_PAYTR_EVENT, onHeroPaytr);
    return () => window.removeEventListener(ACADEMY_HERO_PAYTR_EVENT, onHeroPaytr);
  }, [startPaytrCheckout]);

  const status =
    phase === "locking"
      ? ACADEMY_SEN.purchase.locking(lockMinutes)
      : phase === "settling"
        ? ACADEMY_SEN.purchase.settling
        : null;
  const shortfall = needsTopUp || isInsufficientBalanceError(error);
  const paymentsClosed = !paymentsReady;
  const cardClosed = paymentsClosed && shortfall;

  function ctaFor(path: AcademyPurchasePath): string {
    if (pending && activePath === path) {
      return ACADEMY_SEN.purchase.pendingCta;
    }
    if (cardClosed) {
      return ACADEMY_SEN.purchase.closed;
    }
    const display = priceLabel ? stripZeroKurusFromTryLabel(priceLabel) : null;
    if (path === "exam") {
      return display ? ACADEMY_SEN.purchase.ctaExam(display) : ACADEMY_SEN.purchase.ctaExamIdle;
    }
    return display ? ACADEMY_SEN.purchase.cta(display) : ACADEMY_SEN.purchase.ctaIdle;
  }

  return (
    <div className="space-y-4" data-checkout-tik-tak="">
      {paymentsClosed ? (
        <div className="rounded-2xl border border-[var(--amber)]/40 bg-[color-mix(in_srgb,var(--amber)_8%,var(--surface))] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">{ACADEMY_SEN.purchase.closed}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{ACADEMY_SEN.purchase.closedBody}</p>
        </div>
      ) : null}
      {phase !== "idle" ? (
        <SettlementSteps
          lockMinutes={lockMinutes}
          active={phase === "locking" ? "lock" : phase === "settling" ? "settle" : null}
        />
      ) : null}
      <CheckoutBillingFields
        value={billing.form}
        onChange={billing.setForm}
        hadSaved={billing.hadSaved}
        collapsible
      />
      {offers[0] ? (
        <p className="text-xs leading-relaxed text-[var(--muted)]">{offers[0].summary}</p>
      ) : null}
      <CheckoutConsentFields
        distanceAccepted={distanceAccepted}
        digitalAccepted={digitalAccepted}
        onDistanceChange={setDistanceAccepted}
        onDigitalChange={setDigitalAccepted}
      />
      {offers.map((offer) => (
        <Button
          key={offer.path}
          type="button"
          size="lg"
          className="w-full"
          variant={offer.path === "exam" ? "secondary" : "primary"}
          data-checkout-pay-cta=""
          onClick={() => {
            if (cardClosed) {
              return;
            }
            void startPaytrCheckout();
          }}
          disabled={pending || cardClosed || paytrPending}
        >
          {ctaFor(offer.path)}
        </Button>
      ))}
      <SecurePaymentMarks compact />
      {status ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {status}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-slate-600">{ACADEMY_SEN.purchase.licenseNote}</p>
      <QuickTopUpModal
        open={paymentsReady && topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={currencyCode}
        lockSuggestedAmount
        tokenPending={paytrPending}
        presetIframeUrl={paytrIframeUrl}
        presetBilling={checkoutBilling}
        onClose={() => {
          setTopUpOpen(false);
          setPaytrPending(false);
          setPaytrIframeUrl(null);
        }}
        onFunded={() => {
          setTopUpOpen(false);
          setPaytrPending(false);
          setPaytrIframeUrl(null);
          push({ title: UX_SEN.topUp.funded, tone: "emerald" });
          if (checkoutBilling) {
            void onBuy(activePath ?? "training", checkoutBilling);
          }
        }}
      />
    </div>
  );
}

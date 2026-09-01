"use client";

import { useCallback, useState } from "react";
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
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import type { AcademyPurchasePath } from "@/lib/academy/purchase-path";
import { academyCardOfferPaths } from "@/lib/academy/purchase-path";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { LEGAL_CHECKOUT_CONSENT_COPY } from "@/lib/copy/legal-launch";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

export function PurchaseButton({
  courseId,
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
  const offers = academyCardOfferPaths().filter((offer) => offer.path !== "exam");

  const onBuy = useCallback(
    async (path: AcademyPurchasePath) => {
      if (!distanceAccepted || !digitalAccepted) {
        setError(LEGAL_CHECKOUT_CONSENT_COPY.required);
        return;
      }
      const billingPayload = billing.payload();
      if (!billingPayload.ok) {
        setError(billingPayload.error);
        return;
      }
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
              billing: billingPayload.billing,
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
            if (paymentsReady) {
              setTopUpOpen(true);
            }
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
    [billing, consentReady, courseId, courseLevel, examHref, idempotency, paymentsReady, push, report, router, trainingHref],
  );

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
    if (shortfall) {
      return ACADEMY_SEN.purchase.ctaTopUp;
    }
    if (path === "exam") {
      return priceLabel ? ACADEMY_SEN.purchase.ctaExam(priceLabel) : ACADEMY_SEN.purchase.ctaExamIdle;
    }
    return priceLabel ? ACADEMY_SEN.purchase.cta(priceLabel) : ACADEMY_SEN.purchase.ctaIdle;
  }

  return (
    <div className="space-y-4">
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
      <CheckoutBillingFields value={billing.form} onChange={billing.setForm} hadSaved={billing.hadSaved} />
      <CheckoutConsentFields
        distanceAccepted={distanceAccepted}
        digitalAccepted={digitalAccepted}
        onDistanceChange={setDistanceAccepted}
        onDigitalChange={setDigitalAccepted}
      />
      <div className="grid gap-3">
        {offers.map((offer) => (
          <div
            key={offer.path}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">{offer.cta}</p>
            <p className="flex-1 text-xs leading-relaxed text-[var(--muted)]">{offer.summary}</p>
            <Button
              type="button"
              variant={offer.path === "exam" ? "secondary" : "primary"}
              onClick={() => {
                if (cardClosed) {
                  return;
                }
                if (!consentReady) {
                  setError(LEGAL_CHECKOUT_CONSENT_COPY.required);
                  return;
                }
                const billingPayload = billing.payload();
                if (!billingPayload.ok) {
                  setError(billingPayload.error);
                  return;
                }
                if (shortfall && phase === "idle") {
                  setActivePath(offer.path);
                  setTopUpOpen(true);
                  return;
                }
                void onBuy(offer.path);
              }}
              disabled={pending || cardClosed}
            >
              {ctaFor(offer.path)}
            </Button>
          </div>
        ))}
      </div>
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
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          push({ title: UX_SEN.topUp.funded, tone: "emerald" });
          void onBuy(activePath ?? "training");
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import { formatMinor } from "@/lib/kernel/money/format";
import { COMMERCE_TRIAL_VERIFY_MINOR } from "@/lib/commerce/subscription-lifecycle";
import type { CockpitLicense } from "@/lib/commerce/cockpit-types";

/**
 * Lisans ekranı.
 *
 * Dürüstlük kuralı: ekranda yazan tutar ile çekilen tutar aynıdır.
 * İlk kez deneme hakkı olan kullanıcıya **1,00 TL kart doğrulama** tutarı ve
 * "30 Gün Ücretsiz Başlat (1 TL Doğrulama)" butonu basılır; katalog tutarı
 * yalnız yenileme satırı olarak görünür.
 *
 * `TRIALING` durumunda "Lisans açık" yazmaz: "Ücretsiz Deneme Aktif — Kalan X Gün".
 */
export function LicenseCheckout({
  storeId,
  license,
  expiresLabel,
  amountLabel,
}: {
  storeId: string;
  license: CockpitLicense;
  expiresLabel: string | null;
  amountLabel: string | null;
}) {
  const copy = SEN_VOICE.magazam;
  const router = useRouter();
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [settled, setSettled] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const catalogOpen = amountLabel != null;

  const trialing = license.status === "TRIALING" && license.phase === "open";
  const activePaid = license.status === "ACTIVE" && license.phase === "open";
  const trialOffer = license.trialEligible && !trialing && !activePaid;
  const verifyAmountLabel = formatMinor(COMMERCE_TRIAL_VERIFY_MINOR, "TRY");

  const ready =
    catalogOpen && license.billingReady && distanceAccepted && digitalAccepted && !pending;

  /** Buton metni: deneme → yenileme → ilk lisans. */
  const submitLabel = pending
    ? copy.saving
    : trialOffer
      ? copy.trialCta
      : trialing || activePaid || license.phase === "closed"
        ? copy.renew
        : copy.pay;

  async function pay() {
    if (!ready) {
      return;
    }
    setPending(true);
    setError("");
    setIframeUrl(null);
    setSettled("");
    const result = await commerceMutate<Record<string, unknown>>(
      `/api/commerce/stores/${storeId}/subscription`,
      "POST",
      { ...CHECKOUT_LEGAL_CONSENT_PAYLOAD },
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error === copy.windowFailed ? copy.windowFailed : result.error);
      return;
    }
    if (result.data.kind === "settled") {
      setSettled(copy.settled);
      router.refresh();
      return;
    }
    const iframe = readPaytrIframeSrcFromCheckout(result.data);
    if (!iframe) {
      setError(copy.windowFailed);
      return;
    }
    setIframeUrl(iframe);
  }

  return (
    <div className="grid gap-4">
      {/* Deneme teklifi — yalnız hak gerçekten açıkken basılır. */}
      {trialOffer ? (
        <section
          data-license-trial-offer=""
          className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4"
        >
          <p className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white">
            {copy.trialBadge}
          </p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {copy.trialTitle}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{copy.trialBody}</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-3 ring-1 ring-emerald-200">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {copy.trialVerifyLabel}
              </dt>
              <dd
                className="mt-1 text-2xl font-bold tabular-nums text-[var(--emerald)]"
                data-license-trial-amount=""
              >
                {verifyAmountLabel}
              </dd>
            </div>
            <div className="rounded-xl bg-white/80 p-3 ring-1 ring-[var(--border)]">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {copy.trialRenewalLabel}
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-[var(--foreground)]">
                {amountLabel ? `${amountLabel} / Ay` : copy.catalogClosed}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs font-medium text-[var(--emerald)]">{copy.trialCancelLine}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{copy.trialHonestyLine}</p>
        </section>
      ) : null}

      {/* Deneme açık: kalan gün. "Lisans açık" yazmaz. */}
      {trialing ? (
        <section
          data-license-trial-state="active"
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4"
        >
          <p className="text-base font-semibold text-emerald-900">
            {license.trialDaysLeft != null && license.trialDaysLeft > 0
              ? copy.trialRemaining(license.trialDaysLeft)
              : copy.trialEnded}
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            {copy.trialKeepNote} {license.cancelAtPeriodEnd ? copy.cancelPending : ""}
          </p>
        </section>
      ) : null}

      {/* Deneme kapalıysa gerekçesi görünür; sessiz tam fiyat yok. */}
      {!trialOffer && !trialing && !activePaid ? (
        license.trialBlockedReason === "no_key" ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950" data-license-trial-blocked="no_key">
            {copy.billingMissingTrial}
          </p>
        ) : license.trialBlockedReason === "consumed" ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6" data-license-trial-blocked="consumed">
            Bu vergi kimliğiyle ücretsiz deneme daha önce kullanıldı. Lisans katalogdaki aylık tutarla açılır.
          </p>
        ) : license.trialBlockedReason === "held" ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6" data-license-trial-blocked="held">
            Bu vergi kimliği için açık bir ödeme penceresi var. Pencereyi tamamla veya bir saat sonra yeniden dene.
          </p>
        ) : null
      ) : null}

      {expiresLabel ? (
        <p className="text-sm">
          {copy.expires}: {expiresLabel}
        </p>
      ) : null}
      {catalogOpen ? (
        <p className="text-sm">
          {copy.amount}: {amountLabel}
          <span className="ml-1 text-xs text-[var(--muted)]">/ Ay</span>
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)]">{copy.catalogClosed}</p>
      )}
      {license.billingReady ? null : (
        <div className="grid gap-2">
          <p className="text-sm">{copy.billingMissing}</p>
          <LinkButton href="/profil" variant="outline" size="sm">
            {copy.billingLink}
          </LinkButton>
        </div>
      )}
      <CheckoutConsentFields
        distanceAccepted={distanceAccepted}
        digitalAccepted={digitalAccepted}
        onDistanceChange={setDistanceAccepted}
        onDigitalChange={setDigitalAccepted}
      />
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {settled ? <p className="text-sm text-[var(--emerald)]">{settled}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void pay()} disabled={!ready} data-license-submit="">
          {submitLabel}
        </Button>
        {error ? (
          <Button type="button" variant="outline" onClick={() => void pay()} disabled={!ready}>
            {copy.retry}
          </Button>
        ) : null}
      </div>
      {license.phase === "open" && !license.cancelAtPeriodEnd ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setPending(true);
            setError("");
            void commerceMutate(`/api/commerce/stores/${storeId}/subscription`, "DELETE").then((result) => {
              setPending(false);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setCancelNote(copy.cancelDone);
              router.refresh();
            });
          }}
        >
          {copy.cancel}
        </Button>
      ) : null}
      {license.cancelAtPeriodEnd ? <p className="text-sm">{copy.cancelPending}</p> : null}
      {cancelNote ? <p className="text-sm">{cancelNote}</p> : null}
      {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title={copy.iframeTitle} /> : null}
    </div>
  );
}

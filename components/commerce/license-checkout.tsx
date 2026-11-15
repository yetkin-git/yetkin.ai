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
import type { CockpitLicense } from "@/lib/commerce/cockpit-types";

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
  const catalogOpen = amountLabel != null;
  const ready = catalogOpen && license.billingReady && distanceAccepted && digitalAccepted && !pending;

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
      {expiresLabel ? (
        <p className="text-sm">
          {copy.expires}: {expiresLabel}
        </p>
      ) : null}
      {catalogOpen ? (
        <p className="text-sm">
          {copy.amount}: {amountLabel}
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
        <Button type="button" onClick={() => void pay()} disabled={!ready}>
          {pending ? copy.saving : license.phase === "open" || license.phase === "closed" ? copy.renew : copy.pay}
        </Button>
        {error ? (
          <Button type="button" variant="outline" onClick={() => void pay()} disabled={!ready}>
            {copy.retry}
          </Button>
        ) : null}
      </div>
      {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title={copy.iframeTitle} /> : null}
    </div>
  );
}

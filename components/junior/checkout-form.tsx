"use client";

import { useState } from "react";
import Link from "next/link";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { SecurePaymentMarks } from "@/components/legal/secure-payment-marks";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { Button } from "@/components/ui/button";
import { JUNIOR_GUARDIAN_NOTICE_HREF, JUNIOR_GUARDIAN_NOTICE_TITLE } from "@/lib/copy/junior-guardian-notice";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { JUNIOR_GUARDIAN_NOTICE } from "@/lib/junior/guardian-notice";
import { JUNIOR_CHECKOUT_PATH } from "@/lib/junior/limits";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

function humanCheckoutError(raw: string): string {
  if (
    raw === "not_configured" ||
    raw === "Bu oda üretimde kapalı." ||
    raw === "pay_api_error" ||
    raw === "missing_credentials"
  ) {
    return "Ödeme ekranı şu an açılamadı. Bağlantını kontrol edip biraz sonra yeniden dene.";
  }
  return raw;
}

export function CheckoutForm({
  alreadyActive,
  checkoutOpen,
}: {
  alreadyActive: boolean;
  checkoutOpen: boolean;
}) {
  const billing = useCheckoutBilling();
  const idempotency = useIdempotencyKey();
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const [guardianAccepted, setGuardianAccepted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const consentReady = distanceAccepted && digitalAccepted && guardianAccepted;

  if (alreadyActive) {
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6">
        Yıllık paket açık. Üç seçmeli ders hakkın duruyor. Kilitli konular, seçtiğin derslerde açılır.
      </p>
    );
  }

  if (!checkoutOpen) {
    return (
      <section className="grid gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-6">
        <h2 className="text-lg font-semibold">Ödeme hattı kapalı</h2>
        <p>
          Gerçek PayTR mağaza hattı bağlanana kadar yıllık paket satışı açılmaz. Deneme mağaza anahtarı satışı açmaz.
          Canlı ödeme anahtarı olmadan tahsilat yoktur. Kart bilgisi bu ekranda yazılmaz.
        </p>
      </section>
    );
  }

  async function onPay() {
    if (!consentReady || pending) {
      setError("Mesafeli satış, anında ifa ve veli onayı tamamlanmadan ödeme ekranı açılmaz.");
      return;
    }
    const invoice = billing.payload();
    if (!invoice.ok) {
      setError(invoice.error);
      return;
    }
    setPending(true);
    setError("");
    setIframeUrl(null);
    try {
      const response = await fetch(
        JUNIOR_CHECKOUT_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({
            distanceContractAccepted: true,
            digitalImmediatePerformanceAccepted: true,
            consentVersion: CHECKOUT_LEGAL_CONSENT_VERSION,
            guardianConsentAccepted: true,
            guardianNoticeVersion: JUNIOR_GUARDIAN_NOTICE.version,
            billing: invoice.billing,
          }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      const iframe = readPaytrIframeSrcFromCheckout(envelope.body);
      if (!envelope.ok || !iframe) {
        idempotency.rotate();
        setError(humanCheckoutError(envelope.error || "Ödeme ekranı şu an açılamadı. Bağlantını kontrol edip biraz sonra yeniden dene."));
        return;
      }
      idempotency.rotate();
      setIframeUrl(iframe);
    } catch {
      idempotency.rotate();
      setError(UX_SEN.http.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-6">
      <div>
        <h2 className="text-lg font-semibold">Güvenli ödeme</h2>
        <p className="text-[var(--muted)]">
          Kart bilgisi bu sayfada yazılmaz. Üç onay tamamlanmadan ödeme ekranı yüklenmez.
        </p>
      </div>
      <CheckoutBillingFields value={billing.form} onChange={billing.setForm} hadSaved={billing.hadSaved} collapsible />
      <CheckoutConsentFields
        distanceAccepted={distanceAccepted}
        digitalAccepted={digitalAccepted}
        onDistanceChange={setDistanceAccepted}
        onDigitalChange={setDigitalAccepted}
      />
      <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3 text-xs leading-relaxed">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--safir)]"
          checked={guardianAccepted}
          onChange={(event) => setGuardianAccepted(event.target.checked)}
        />
        <span>
          <Link href={JUNIOR_GUARDIAN_NOTICE_HREF} className="font-semibold text-[var(--safir-deep)] hover:underline">
            {JUNIOR_GUARDIAN_NOTICE_TITLE}
          </Link>
          {" metnini okudum. Çocuk profili benim hesabımın altındadır. Bu onayı veriyorum."}
        </span>
      </label>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={pending || !consentReady || !billing.complete} onClick={() => void onPay()}>
          {pending ? "Ödeme ekranı hazırlanıyor" : "Ödemeye geç"}
        </Button>
        <SecurePaymentMarks />
      </div>
      {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title="Güvenli ödeme" /> : null}
    </section>
  );
}

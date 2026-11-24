"use client";

import { useState } from "react";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import {
  EMPTY_CHECKOUT_BILLING_FORM,
  normalizeBillingInput,
  type CheckoutBillingFormState,
} from "@/lib/kernel/identity/billing-info";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/**
 * Faz 3 / §4.1 — **kayıt olmadan Pro'ya geç** kartı.
 *
 * Fiyat metni burada sabit yazılmaz: sunucu `/api/tezgah/offers` katalog tutarını
 * verir; kart o tutarı basar. Katalog satırı yoksa satın alma kapalıdır ve kart
 * "kapalı" der — uydurma fiyat yok.
 *
 * Dürüstlük: form "hesabın ödeme onayından sonra açılır" yazar. Ödeme öncesi
 * Supabase kaydı **yoktur**; bu yüzden kullanıcıdan şifre istenmez. Şifre,
 * e-postadaki `/claim/[token]` bağlantısında belirlenir.
 */
export function TezgahGuestCheckoutCard() {
  const [open, setOpen] = useState(false);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [billing, setBilling] = useState<CheckoutBillingFormState>(EMPTY_CHECKOUT_BILLING_FORM);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  async function loadOffer() {
    setOpen(true);
    setError("");
    try {
      const response = await fetch("/api/tezgah/offers", withRailApiVersion({ method: "GET" }));
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        data?: { pro?: { open?: boolean; priceLabel?: string | null } };
      } | null;
      const pro = body?.data?.pro;
      setPriceLabel(pro?.open && pro.priceLabel ? pro.priceLabel : null);
    } catch {
      setPriceLabel(null);
    }
  }

  const billingReady = normalizeBillingInput(billing).ok;
  const ready =
    Boolean(priceLabel) && billingReady && email.trim().length > 0 && distanceAccepted && digitalAccepted && !pending;

  async function pay() {
    if (!ready) {
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    setIframeUrl(null);
    const normalized = normalizeBillingInput(billing);
    if (!normalized.ok) {
      setError(normalized.error);
      setPending(false);
      return;
    }
    try {
      const response = await fetch(
        "/api/tezgah/guest-checkout",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            email,
            billing: normalized.billing,
            ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
          }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        data?: Record<string, unknown>;
      } | null;
      if (!response.ok || body?.ok === false || !body?.data) {
        setError(typeof body?.error === "string" ? body.error : "Ödeme penceresi açılmadı.");
        return;
      }
      const iframe = readPaytrIframeSrcFromCheckout(body.data);
      if (!iframe) {
        setError("Ödeme penceresi açılmadı.");
        return;
      }
      setIframeUrl(iframe);
      setNotice("Ödeme onaylandığında e-postana hesabını açacağın tek kullanımlık bağlantı gelir.");
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div data-tezgah-guest-checkout-cta="">
        <Button type="button" variant="success" onClick={() => void loadOffer()}>
          Kayıt Olmadan Hemen Pro&apos;ya Geç
        </Button>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          E-posta ve fatura künyesi yeterli. Ödeme onayından önce hesap açılmaz.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
      data-tezgah-guest-checkout=""
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Misafir ödeme
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--foreground)]">
            {priceLabel ? `Tezgâh Pro — ${priceLabel}/ay` : "Katalog fiyatı yükleniyor"}
          </h3>
        </div>
      </div>

      {priceLabel ? (
        <div className="mt-4 grid gap-3">
          <Label>
            E-posta
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              maxLength={320}
              required
              placeholder="ornek@eposta.com"
            />
            <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">
              Bağlantı bu adrese gelir. Bu e-posta bir hesaba bağlıysa misafir ödeme kapalıdır; giriş yapıp oradan aç.
            </span>
          </Label>
          <CheckoutBillingFields value={billing} onChange={setBilling} />
          <CheckoutConsentFields
            distanceAccepted={distanceAccepted}
            digitalAccepted={digitalAccepted}
            onDistanceChange={setDistanceAccepted}
            onDigitalChange={setDigitalAccepted}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={!ready} onClick={() => void pay()}>
              {pending ? "Ödeme açılıyor" : `${priceLabel}/ay ile öde`}
            </Button>
          </div>
          {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
          {notice ? <p className="text-sm text-[var(--emerald)]">{notice}</p> : null}
          {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title="Tezgâh Pro ödemesi" /> : null}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Katalogda aktif fiyat satırı yok; kayıtsız ödeme kapalı. Sınav ve ücretsiz kredin kullanılabilir durumda.
        </p>
      )}
    </div>
  );
}

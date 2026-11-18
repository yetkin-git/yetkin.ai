"use client";

import { useEffect, useState } from "react";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { TEZGAH_CATALOG_CLOSED_MESSAGE, TEZGAH_MEMBER_PAID_MESSAGE } from "@/lib/tezgah/catalog";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type OfferCard = { open: boolean; priceLabel: string | null };

type Offers = {
  pro: OfferCard;
  creditPack: OfferCard & { credits: number };
  proActive: boolean;
  billingReady: boolean;
};

export function TezgahUpgradeCard() {
  const [offers, setOffers] = useState<Offers | null>(null);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/tezgah/offers", withRailApiVersion({ method: "GET" }))
      .then((response) => response.json())
      .then((body: { ok?: boolean; data?: Offers }) => {
        if (!cancelled && body.ok !== false && body.data) {
          setOffers(body.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOffers(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const paywall = Boolean(offers?.pro.open || offers?.creditPack.open);
  const ready = paywall && offers?.billingReady && distanceAccepted && digitalAccepted && !pending;

  async function pay(kind: "pro" | "credit-pack") {
    if (!ready) {
      return;
    }
    setPending(true);
    setError("");
    setIframeUrl(null);
    try {
      const response = await fetch(
        "/api/tezgah/checkout",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({ kind, ...CHECKOUT_LEGAL_CONSENT_PAYLOAD }),
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
      if (body.data.kind === "settled") {
        setError("");
        window.location.reload();
        return;
      }
      const iframe = readPaytrIframeSrcFromCheckout(body.data);
      if (!iframe) {
        setError("Ödeme penceresi açılmadı.");
        return;
      }
      setIframeUrl(iframe);
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="print:hidden">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Günlük hak</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
          {paywall ? TEZGAH_MEMBER_PAID_MESSAGE : TEZGAH_CATALOG_CLOSED_MESSAGE}
        </h2>
        {paywall && offers ? (
          <div className="mt-4 grid gap-3">
            {offers.billingReady ? null : (
              <div className="grid gap-2">
                <p className="text-sm text-[var(--muted)]">Fatura künyesi olmadan tahsilat açılmaz.</p>
                <LinkButton href="/profil" variant="outline" size="sm">
                  Fatura künyesi
                </LinkButton>
              </div>
            )}
            <CheckoutConsentFields
              distanceAccepted={distanceAccepted}
              digitalAccepted={digitalAccepted}
              onDistanceChange={setDistanceAccepted}
              onDigitalChange={setDigitalAccepted}
            />
            <div className="flex flex-wrap gap-2">
              {offers.pro.open ? (
                <Button type="button" disabled={!ready} onClick={() => void pay("pro")}>
                  Tezgâh Pro {offers.pro.priceLabel}
                </Button>
              ) : null}
              {offers.creditPack.open ? (
                <Button type="button" variant="outline" disabled={!ready} onClick={() => void pay("credit-pack")}>
                  {offers.creditPack.credits} kredi {offers.creditPack.priceLabel}
                </Button>
              ) : null}
            </div>
            {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
            {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title="Tezgâh ödemesi" /> : null}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Ücretsiz hakkınız İstanbul gece yarısında yenilenir. Katalogda fiyat satırı olmadığı için satın alma kapalıdır.
          </p>
        )}
      </div>
    </div>
  );
}

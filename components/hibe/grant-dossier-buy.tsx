"use client";

import { useState } from "react";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/**
 * Tam dosya için doğrudan PayTR. Tutar katalogdadır; istek tutar taşımaz.
 * Bakiye yetersizse cüzdan yolu ayrıca görünür.
 */
export function HibeGrantDossierBuy({ priceLabel }: { priceLabel: string | null }) {
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");

  async function buy() {
    if (pending || !consent || !priceLabel) {
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        "/api/tezgah/checkout",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            kind: "grant-dossier",
            ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { kind?: string; iframeUrl?: string };
      };
      if (!response.ok || body.ok === false) {
        setError(typeof body.error === "string" ? body.error : "Ödeme penceresi açılmadı.");
        return;
      }
      if (body.data?.kind === "iframe" && typeof body.data.iframeUrl === "string") {
        setIframeUrl(body.data.iframeUrl);
        return;
      }
      setError("Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.");
    } catch {
      setError("Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  if (!priceLabel) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2" data-hibe-buy="">
      <label className="flex items-start gap-2 text-xs leading-5">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>Mesafeli satış sözleşmesini ve dijital içeriğin anında ifasını kabul ediyorum.</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!consent || pending}
          onClick={() => void buy()}
          className="inline-flex h-10 items-center rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Ödeme açılıyor…" : "Tam Dosyayı Satın Al (PayTR)"}
        </button>
        <a href="/cuzdan" className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold">
          Cüzdana bakiye yükle
        </a>
      </div>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {iframeUrl ? (
        <iframe title="PayTR ödeme" src={iframeUrl} className="h-[520px] w-full rounded-xl border border-[var(--border)]" />
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import type { AmountMinor } from "@/lib/kernel/money/amount-minor";

/**
 * Faz 3 / §4.3 — kamuya açık yayın CTA'sı.
 *
 * Metin **sen** aksında ve dürüsttür: para puanı değil **yayını** satın alır.
 * Tutar katalogdan okunur (prop); tutar yoksa katalog açık değildir ve CTA fiyat basmaz.
 *
 * **F2.4 düzeltmesi:** Bu bileşen önceden yalnız `/career#yetkincv` bağlantısı basıyordu.
 * Oysa `POST /api/career/yetkincv/purchase` rotası hiçbir istemciden çağrılmıyordu;
 * yani 290 TL'lik yayın ürünü **hiç satılamıyordu**. Artık CTA gerçek tahsilatı başlatır
 * (rıza + Idempotency-Key + PayTR iframe) ve yayın zaten açıksa satın alma basmaz.
 */
export const YETKINCV_PUBLICATION_CTA_LABEL =
  "Kamuya Açık Kariyer Kartını ve Uzman Dizini Görünürlüğünü Aç" as const;

export function YetkinCvPublicationCta({
  certificateHash,
  amountMinor = null,
  signedIn = false,
  published = false,
}: {
  certificateHash: string;
  /** Katalog `career/yetkincv-exam` tutarı. `null` = satır yok, satın alma kapalı. */
  amountMinor?: AmountMinor | null;
  /** Oturum varsa doğrudan satın alma açılır; misafir kayda yönlenir. */
  signedIn?: boolean;
  /** Yayın zaten açıksa ikinci kez ücret alınmaz. */
  published?: boolean;
}) {
  const priceLabel = amountMinor != null ? formatAmountMinorAsWholeTry(amountMinor) : null;
  const signInHref = `/register?next=%2Fcareer%23yetkincv` as Route;
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
        "/api/career/yetkincv/purchase",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify(CHECKOUT_LEGAL_CONSENT_PAYLOAD),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        data?: { kind?: string; iframeUrl?: string; merchantOid?: string };
      } | null;
      if (!response.ok || body == null || body.ok === false) {
        setError(
          typeof body?.error === "string" ? body.error : "Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.",
        );
        return;
      }
      // CLEARED döndüyse (idempotent tekrar) ikinci tahsilat yok; sayfa tazelenir.
      if (body.data?.kind === "settled") {
        window.location.reload();
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

  return (
    <div
      className="rounded-[var(--radius-card)] border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm"
      data-yetkincv-publication-cta=""
      data-yetkincv-certificate={certificateHash}
      data-yetkincv-publication-published={published ? "true" : "false"}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Yayın mührü
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {YETKINCV_PUBLICATION_CTA_LABEL}
        {priceLabel ? ` (${priceLabel})` : ""}
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--foreground)]">
        <li>Tam doğrulanabilir kariyer kartı — işveren oturumsuz açar.</li>
        <li>Paylaşım rozeti: LinkedIn ve CV bağlantısı.</li>
        <li>Uzman dizininde görünürlük.</li>
      </ul>
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir ve ücretsiz kalır. Bu ödeme yalnız yayını açar;
        puan satın alınmaz.
      </p>
      {priceLabel ? (
        signedIn ? (
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2 text-xs leading-5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                Mesafeli satış sözleşmesini ve dijital içeriğin anında ifasını kabul ediyorum.
              </span>
            </label>
            <button
              type="button"
              disabled={!consent || pending}
              onClick={() => void buy()}
              className="inline-flex h-10 items-center rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Ödeme açılıyor…" : `Yayını aç — ${priceLabel}`}
            </button>
            {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
            {iframeUrl ? (
              <iframe
                title="PayTR ödeme"
                src={iframeUrl}
                className="h-[520px] w-full rounded-xl border border-[var(--border)]"
              />
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <LinkButton href={signInHref} variant="success" size="sm">
              Yayını aç — {priceLabel}
            </LinkButton>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Ödeme için giriş yapılır; yayın mühür sahibinin hesabına bağlanır.
            </p>
          </div>
        )
      ) : (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Yayın katalogda henüz açılmadı. Sınav ve puan kullanılabilir durumda.
        </p>
      )}
    </div>
  );
}

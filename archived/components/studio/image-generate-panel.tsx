"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useActionBridge } from "@/components/ui/action-bridge";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import { STUDIO_SEN, studioGenerateCitizenError } from "@/archived/lib/copy/sen-voice/studio";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { formatMinor } from "@/lib/kernel/money/format";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY, isCurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { useStudioDebit } from "@/components/studio/studio-debit-context";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";

export function ImageGeneratePanel({
  draftId,
  maxChars = STUDIO_PROMPT_MAX_CHARS,
}: {
  draftId?: string;
  maxChars?: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const { strip, imageFloorMinor, reportSettlement, reportBalance } = useStudioDebit();
  const idempotency = useIdempotencyKey();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [preview, setPreview] = useState<{
    mimeType: string;
    dataBase64: string;
    contentHash: string;
    previewUrl?: string | null;
  } | null>(null);
  const insufficient =
    strip.live && imageFloorMinor != null && strip.amountMinor < imageFloorMinor;
  const requiredMinor = imageFloorMinor ?? WALLET_TOP_UP_MIN_MINOR;
  const preCheck =
    strip.live && imageFloorMinor != null
      ? STUDIO_SEN.wallet.preCheck(
          formatMinor(strip.amountMinor, strip.currencyCode),
          formatMinor(imageFloorMinor, strip.currencyCode),
        )
      : STUDIO_SEN.wallet.preCheckUnbound;

  async function onGenerate() {
    if (insufficient) {
      setTopUpOpen(true);
      return;
    }
    setPending(true);
    setError(null);
    setNotice(STUDIO_SEN.generate.debiting);
    const response = await fetch("/api/studio/images", {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ prompt, draftId }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      asset?: {
        mimeType: string;
        dataBase64: string;
        contentHash: string;
        previewUrl?: string | null;
      };
      generation?: { currencyCode?: string };
      debitMinor?: number;
      remainingMinor?: number;
    };
    setPending(false);
    if (!body.ok || !body.asset) {
      setNotice(null);
      const message = studioGenerateCitizenError(response.status, body.error ?? STUDIO_SEN.generate.imageFail);
      setError(message);
      if (response.status !== 409) {
        idempotency.rotate();
      }
      if (isInsufficientBalanceError(body.error) || isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    idempotency.rotate();
    setPreview(body.asset);
    if (typeof body.debitMinor === "number" && typeof body.remainingMinor === "number") {
      const rawCurrency = body.generation?.currencyCode;
      const currencyCode = rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : SETTLEMENT_CURRENCY;
      reportSettlement({
        debitMinor: body.debitMinor,
        remainingMinor: body.remainingMinor,
        currencyCode,
      });
      setNotice(
        STUDIO_SEN.generate.settled(
          formatMinor(body.debitMinor, currencyCode),
          formatMinor(body.remainingMinor, currencyCode),
        ),
      );
      push({
        title: STUDIO_SEN.frozenBridge.studioSettledTitle,
        body: STUDIO_SEN.frozenBridge.studioSettledBody,
        tone: "emerald",
      });
    } else {
      setNotice(null);
    }
    setPrompt("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        maxLength={maxChars}
        rows={5}
        placeholder={STUDIO_SEN.generate.imagePlaceholder}
      />
      <p className="text-xs text-[var(--muted)]">{preCheck}</p>
      {insufficient ? (
        <p aria-live="polite" className="text-xs text-[var(--rose)]">
          {STUDIO_SEN.wallet.insufficient}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          {prompt.trim().length}/{maxChars} · {STUDIO_SEN.generate.imageHint}
        </p>
        <div className="flex flex-wrap gap-2">
          {insufficient ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setTopUpOpen(true)}>
              {UX_SEN.topUp.trigger}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void onGenerate()}
            disabled={pending || !prompt.trim() || insufficient}
          >
            {pending ? STUDIO_SEN.generate.pending : STUDIO_SEN.generate.imageCta}
          </Button>
        </div>
      </div>
      {notice ? (
        <p aria-live="polite" className="text-xs text-[var(--muted)]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      {preview ? (
        <figure className="space-y-2">
          {(() => {
            const src = preview.previewUrl
              ? preview.previewUrl
              : preview.dataBase64
                ? `data:${preview.mimeType};base64,${preview.dataBase64}`
                : null;
            return src ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Üretilen görsel"
                  src={src}
                  className="max-h-72 w-full rounded-xl border border-[var(--border)] object-contain"
                />
                <figcaption className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--muted)]">
                  <span>SHA256 {preview.contentHash.slice(0, 16)}…</span>
                  <a
                    href={src}
                    download="studio-cikti.png"
                    className="font-sans text-xs font-semibold text-[var(--safir-deep)] hover:underline"
                  >
                    {STUDIO_SEN.generate.download}
                  </a>
                </figcaption>
              </>
            ) : (
              <figcaption className="font-mono text-[11px] text-[var(--muted)]">
                SHA256 {preview.contentHash.slice(0, 16)}…
              </figcaption>
            );
          })()}
        </figure>
      ) : null}
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={strip.currencyCode}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          void fetchWalletStripClient().then(reportBalance);
          push({ title: STUDIO_SEN.frozenBridge.generateReadyTitle, body: STUDIO_SEN.frozenBridge.generateReadyBody, tone: "emerald" });
        }}
      />
    </div>
  );
}

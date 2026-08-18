"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useActionBridge } from "@/components/ui/action-bridge";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import { STUDIO_SEN, studioGenerateCitizenError } from "@/lib/copy/sen-voice/studio";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { formatMinor } from "@/lib/kernel/money/format";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY, isCurrencyCode } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { useStudioDebit } from "@/components/studio/studio-debit-context";

export function GeneratePanel({
  draftId,
  prompt: promptProp,
  onPromptChange,
  maxChars = STUDIO_PROMPT_MAX_CHARS,
}: {
  draftId?: string;
  prompt?: string;
  onPromptChange?: (value: string) => void;
  maxChars?: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const { strip, textFloorMinor, reportSettlement, reportBalance } = useStudioDebit();
  const [internal, setInternal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const prompt = promptProp ?? internal;
  const setPrompt = onPromptChange ?? setInternal;
  const insufficient =
    strip.live && textFloorMinor != null && strip.amountMinor < textFloorMinor;
  const requiredMinor = textFloorMinor ?? WALLET_TOP_UP_MIN_MINOR;
  const preCheck =
    strip.live && textFloorMinor != null
      ? STUDIO_SEN.wallet.preCheck(
          formatMinor(strip.amountMinor, strip.currencyCode),
          formatMinor(textFloorMinor, strip.currencyCode),
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
    const response = await fetch("/api/studio/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, draftId }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      generation?: { id: string; currencyCode?: string };
      debitMinor?: number;
      remainingMinor?: number;
    };
    setPending(false);
    if (!body.ok || !body.generation) {
      setNotice(null);
      const message = studioGenerateCitizenError(response.status, body.error);
      setError(message);
      if (isInsufficientBalanceError(body.error) || isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    if (typeof body.debitMinor === "number" && typeof body.remainingMinor === "number") {
      const rawCurrency = body.generation.currencyCode;
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
        title: UX_SEN.bridge.studioSettled.title,
        body: UX_SEN.bridge.studioSettled.body,
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
        rows={8}
        placeholder={STUDIO_SEN.generate.placeholder}
        className="studio-prompt-live"
      />
      <p className="text-xs text-[var(--muted)]">{preCheck}</p>
      {insufficient ? (
        <p aria-live="polite" className="text-xs text-[var(--rose)]">
          {STUDIO_SEN.wallet.insufficient}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          {prompt.trim().length}/{maxChars} · {STUDIO_SEN.generate.debitHint}
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
            {pending ? STUDIO_SEN.generate.pending : STUDIO_SEN.generate.cta}
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
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={strip.currencyCode}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          void fetchWalletStripClient().then(reportBalance);
          push({ title: UX_SEN.bridge.generateReady.title, body: UX_SEN.bridge.generateReady.body, tone: "emerald" });
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import { STUDIO_SEN, studioGenerateCitizenError } from "@/lib/copy/sen-voice/studio";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY, isCurrencyCode } from "@/lib/kernel/money/currency";
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
  const { strip, textFloorMinor, reportSettlement } = useStudioDebit();
  const [internal, setInternal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const prompt = promptProp ?? internal;
  const setPrompt = onPromptChange ?? setInternal;
  const insufficient =
    strip.live && textFloorMinor != null && strip.amountMinor < textFloorMinor;
  const preCheck =
    strip.live && textFloorMinor != null
      ? STUDIO_SEN.wallet.preCheck(
          formatMinor(strip.amountMinor, strip.currencyCode),
          formatMinor(textFloorMinor, strip.currencyCode),
        )
      : STUDIO_SEN.wallet.preCheckUnbound;

  async function onGenerate() {
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
      setError(studioGenerateCitizenError(response.status, body.error));
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          {prompt.trim().length}/{maxChars} · {STUDIO_SEN.generate.debitHint}
        </p>
        <Button
          type="button"
          onClick={() => void onGenerate()}
          disabled={pending || !prompt.trim() || insufficient}
        >
          {pending ? STUDIO_SEN.generate.pending : STUDIO_SEN.generate.cta}
        </Button>
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
    </div>
  );
}

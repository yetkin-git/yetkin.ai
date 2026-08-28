"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { useActionBridge } from "@/components/ui/action-bridge";
import type { DevLabsApiKeyRecord } from "@/lib/devlabs/types";
import { DEVLABS_SEN } from "@/archived/lib/copy/sen-voice/devlabs";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";

export function CodeBenchPanel({
  projectId,
  keys,
  floorMinor,
}: {
  projectId: string;
  keys: DevLabsApiKeyRecord[];
  floorMinor?: number | null;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const idempotency = useIdempotencyKey();
  const copy = DEVLABS_SEN.bench;
  const artifacts = DEVLABS_SEN.artifacts;
  const activeKeys = useMemo(() => keys.filter((key) => key.revokedAt === null), [keys]);
  const [apiKeyId, setApiKeyId] = useState(activeKeys[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [output, setOutput] = useState<{
    outputCode: string;
    linterOk: boolean;
    linterScore: number;
    contentHash: string;
  } | null>(null);
  const requiredMinor = floorMinor && floorMinor > 0 ? floorMinor : WALLET_TOP_UP_MIN_MINOR;

  async function onGenerate() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/devlabs/projects/${projectId}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json", ...idempotency.headers() },
      body: JSON.stringify({ prompt, apiKeyId }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      artifact?: {
        outputCode: string;
        linterOk: boolean;
        linterScore: number;
        contentHash: string;
      };
    };
    setPending(false);
    if (!body.ok || !body.artifact) {
      const message = body.error ?? copy.fail;
      setError(message);
      if (response.status !== 409) {
        idempotency.rotate();
      }
      if (isInsufficientBalanceError(message)) {
        setTopUpOpen(true);
      }
      return;
    }
    idempotency.rotate();
    setOutput(body.artifact);
    router.refresh();
  }

  if (activeKeys.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{copy.needKey}</p>;
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {copy.keyLabel}
        <select
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={apiKeyId}
          onChange={(event) => setApiKeyId(event.target.value)}
        >
          {activeKeys.map((key) => (
            <option key={key.id} value={key.id}>
              {key.name} · {key.keyPrefix}…
            </option>
          ))}
        </select>
      </label>
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={6}
        maxLength={4000}
        placeholder={copy.placeholder}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">{copy.lintHint}</p>
        <div className="flex flex-wrap gap-2">
          {isInsufficientBalanceError(error) ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setTopUpOpen(true)}>
              {UX_SEN.topUp.trigger}
            </Button>
          ) : null}
          <Button type="button" onClick={() => void onGenerate()} disabled={pending || !prompt.trim() || !apiKeyId}>
            {pending ? copy.pending : copy.cta}
          </Button>
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {output ? (
        <div className="space-y-2">
          <p className="text-xs">
            Linter {output.linterOk ? artifacts.linterOk : artifacts.linterFail} · skor {output.linterScore} · SHA256{" "}
            {output.contentHash.slice(0, 16)}…
          </p>
          <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs">
            {output.outputCode}
          </pre>
        </div>
      ) : null}
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={SETTLEMENT_CURRENCY}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          push({ title: UX_SEN.topUp.funded, tone: "emerald" });
          void onGenerate();
        }}
      />
    </div>
  );
}

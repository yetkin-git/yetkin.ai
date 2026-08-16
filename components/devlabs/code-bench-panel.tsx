"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DevLabsApiKeyRecord } from "@/lib/devlabs/types";
import { DEVLABS_SEN } from "@/lib/copy/sen-voice/devlabs";

export function CodeBenchPanel({
  projectId,
  keys,
}: {
  projectId: string;
  keys: DevLabsApiKeyRecord[];
}) {
  const router = useRouter();
  const copy = DEVLABS_SEN.bench;
  const artifacts = DEVLABS_SEN.artifacts;
  const activeKeys = useMemo(() => keys.filter((key) => key.revokedAt === null), [keys]);
  const [apiKeyId, setApiKeyId] = useState(activeKeys[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [output, setOutput] = useState<{
    outputCode: string;
    linterOk: boolean;
    linterScore: number;
    contentHash: string;
  } | null>(null);

  async function onGenerate() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/devlabs/projects/${projectId}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
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
      setError(body.error ?? copy.fail);
      return;
    }
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">{copy.lintHint}</p>
        <Button type="button" onClick={() => void onGenerate()} disabled={pending || !prompt.trim() || !apiKeyId}>
          {pending ? copy.pending : copy.cta}
        </Button>
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
    </div>
  );
}

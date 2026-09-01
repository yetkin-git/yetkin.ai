"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  FreelancerContractMessageKind,
  FreelancerContractMessageRecord,
} from "@/lib/freelancer/types";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { freelancerMessageKindLabel } from "@/lib/copy/status-labels";
import { useActionBridge } from "@/components/ui/action-bridge";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function ContractChatConsole({
  contractId,
  messages,
  revisionRemaining = 3,
}: {
  contractId: string;
  messages: FreelancerContractMessageRecord[];
  revisionRemaining?: number;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const [kind, setKind] = useState<FreelancerContractMessageKind>("TEXT");
  const [body, setBody] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const copy = FREELANCER_SEN.chat;
  const revisionAllowed = revisionRemaining > 0;

  async function send() {
    setPending(true);
    setError(null);
    const response = await fetch(
      `/api/freelancer/contracts/${contractId}/messages`,
      withRailApiVersion({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          body,
          artifactUrl: artifactUrl.trim() || undefined,
        }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error ?? copy.fail);
      return;
    }
    setBody("");
    setArtifactUrl("");
    if (kind === "DELIVERY") {
      push({
        title: UX_SEN.bridge.deliveryPosted.title,
        body: UX_SEN.bridge.deliveryPosted.body,
        tone: "emerald",
      });
    }
    router.refresh();
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      <p className="mb-4 text-xs leading-5 text-slate-600">{copy.evidenceNote}</p>
      <ul className="mb-4 space-y-3">
        {messages.length === 0 ? (
          <li className="text-sm text-[var(--muted)]">{copy.empty}</li>
        ) : (
          messages.map((message) => (
            <li key={message.id} className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {freelancerMessageKindLabel(message.kind)}
              </p>
              <p className="mt-1 text-[var(--foreground)]">{message.body}</p>
              {message.artifactUrl ? (
                <a
                  className="mt-1 inline-block text-xs text-[var(--safir)]"
                  href={message.artifactUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.artifactCta}
                </a>
              ) : null}
            </li>
          ))
        )}
      </ul>
      <div className="grid gap-2">
        <select
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base"
          value={kind === "REVISION" && !revisionAllowed ? "TEXT" : kind}
          onChange={(event) => setKind(event.target.value as FreelancerContractMessageKind)}
        >
          <option value="TEXT">{copy.kindText}</option>
          <option value="DELIVERY">{copy.kindDelivery}</option>
          {revisionAllowed ? <option value="REVISION">{copy.kindRevision}</option> : null}
        </select>
        <textarea
          className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base"
          placeholder={copy.placeholder}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <input
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base"
          placeholder={copy.artifactPlaceholder}
          value={artifactUrl}
          onChange={(event) => setArtifactUrl(event.target.value)}
        />
        <Button type="button" disabled={pending || !body.trim()} onClick={() => void send()}>
          {pending ? copy.sending : copy.send}
        </Button>
        {error ? (
          <p aria-live="assertive" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

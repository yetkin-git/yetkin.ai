"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEVLABS_SEN } from "@/lib/copy/sen-voice/devlabs";

type IssuedView =
  | { kind: "idle" }
  | { kind: "revealed"; plaintext: string; keyPrefix: string }
  | { kind: "sealed"; keyPrefix: string };

export function IssueKeyForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const copy = DEVLABS_SEN.vault;
  const [name, setName] = useState("varsayılan");
  const [issued, setIssued] = useState<IssuedView>({ kind: "idle" });
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCopyNotice(null);
    setIssued({ kind: "idle" });
    const response = await fetch(`/api/devlabs/projects/${projectId}/keys`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      plaintext?: string;
      key?: { keyPrefix?: string };
    };
    setPending(false);
    if (!body.ok || !body.plaintext) {
      setError(body.error ?? copy.issueFail);
      return;
    }
    setIssued({
      kind: "revealed",
      plaintext: body.plaintext,
      keyPrefix: body.key?.keyPrefix ?? body.plaintext.slice(0, 12),
    });
    router.refresh();
  }

  async function onCopy() {
    if (issued.kind !== "revealed") {
      return;
    }
    try {
      await navigator.clipboard.writeText(issued.plaintext);
      setCopyNotice(copy.copied);
    } catch {
      setCopyNotice(copy.copyFail);
    }
  }

  function onHide() {
    if (issued.kind !== "revealed") {
      return;
    }
    setIssued({ kind: "sealed", keyPrefix: issued.keyPrefix });
    setCopyNotice(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        {copy.nameLabel}
        <Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
      </label>
      {issued.kind === "revealed" ? (
        <div
          className="space-y-2 rounded-md border border-[var(--border)] p-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-medium text-[var(--foreground)]">{copy.onceBanner}</p>
          <p className="break-all font-mono text-xs text-[var(--foreground)]">
            {copy.onceLead} {issued.plaintext}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void onCopy()}>
              {copy.copy}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onHide}>
              {copy.hide}
            </Button>
          </div>
          {copyNotice ? <p className="text-xs text-[var(--muted)]">{copyNotice}</p> : null}
        </div>
      ) : null}
      {issued.kind === "sealed" ? (
        <p className="text-xs text-[var(--muted)]" role="status" aria-live="polite">
          {copy.hidden(issued.keyPrefix)}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.issuing : copy.issueCta}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import type { GuardianInviteCitizenView } from "@/lib/junior/project";

export function GuardianInvitePanel({
  pendingInvite,
}: {
  pendingInvite: GuardianInviteCitizenView | null;
}) {
  const router = useRouter();
  const copy = SEN_VOICE.junior;
  const report = useCitizenWriteFeedback();
  const [token, setToken] = useState("");
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createInvite() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/junior/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      const plaintextValue =
        typeof envelope.body.plaintext === "string" ? envelope.body.plaintext : null;
      if (!envelope.ok || !plaintextValue) {
        setError(report(envelope.status, envelope.error, copy.inviteCreateFail));
        return;
      }
      setPlaintext(plaintextValue);
      router.refresh();
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  async function acceptInvite() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/junior/invite/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.inviteAcceptFail));
        return;
      }
      setToken("");
      router.refresh();
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <div className="space-y-3">
      {pendingInvite ? (
        <p className="text-sm text-[var(--muted)]">{copy.invitePending(pendingInvite.tokenPrefix)}</p>
      ) : null}
      {plaintext ? (
        <p className="break-all rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-sm">
          {plaintext}
          <span className="mt-2 block font-sans text-xs text-[var(--muted)]">{copy.inviteOnce}</span>
        </p>
      ) : null}
      <Button type="button" onClick={() => void createInvite()} disabled={pending}>
        {pending ? copy.inviteCreating : copy.inviteCreate}
      </Button>
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void acceptInvite();
        }}
      >
        <label className="block text-sm">
          {copy.inviteTokenLabel}
          <Input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="yrg_…"
            autoComplete="off"
          />
        </label>
        <Button type="submit" variant="outline" disabled={pending || token.trim().length === 0}>
          {copy.inviteAccept}
        </Button>
      </form>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

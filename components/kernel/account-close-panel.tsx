"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { AUTH_LOGOUT_API_PATH } from "@/lib/kernel/auth/redirects";
import {
  PROFILE_CLOSE_PATH,
  WALLET_SURFACE_PATH,
} from "@/lib/kernel/identity/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function AccountClosePanel({ balanceMinor }: { balanceMinor: number }) {
  const copy = SEN_VOICE.profil.close;
  const idempotency = useIdempotencyKey();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const blocked = balanceMinor > 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (blocked) {
      return;
    }
    setPending(true);
    setError(null);
    const response = await fetch(
      PROFILE_CLOSE_PATH,
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json", ...idempotency.headers() },
        body: JSON.stringify({ confirm }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    if (!parsed.ok) {
      setPending(false);
      setError(parsed.error ?? "Hesap kapatılamadı.");
      idempotency.rotate();
      return;
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = AUTH_LOGOUT_API_PATH;
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.intro}</p>
      {blocked ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--foreground)]">{copy.balanceHint}</p>
          <LinkButton href={WALLET_SURFACE_PATH} variant="outline" size="sm">
            {copy.refundCta}
          </LinkButton>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Label>
            {copy.confirmLabel}
            <Input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="off"
              placeholder="KAPAT"
              required
            />
          </Label>
          <p className="text-xs text-[var(--muted)]">{copy.confirmHint}</p>
          {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
          <Button type="submit" variant="danger" size="sm" disabled={pending || confirm !== "KAPAT"}>
            {pending ? copy.pending : copy.cta}
          </Button>
        </form>
      )}
    </Card>
  );
}

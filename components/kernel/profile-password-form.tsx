"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconArrow, IconLock } from "@/components/ui/icons";
import { PasswordInput } from "@/components/auth/password-input";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

async function readFailMessage(response: Response): Promise<string | null> {
  const parsed = parseRailClientJson<Record<string, unknown>>(
    await response.json().catch(() => null),
  );
  if (!parsed.ok && parsed.error.trim()) {
    return parsed.error;
  }
  return null;
}

export function ProfilePasswordForm() {
  const copy = SEN_VOICE.profil.password;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < CITIZEN_PASSWORD_MIN_LENGTH) {
      setError(copy.tooShort(CITIZEN_PASSWORD_MIN_LENGTH));
      return;
    }
    if (password !== confirm) {
      setError(copy.mismatch);
      return;
    }
    setPending(true);
    try {
      const response = await fetch(
        "/api/auth/password",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password }),
        }),
      );
      if (!response.ok) {
        setError((await readFailMessage(response)) || copy.fail);
        return;
      }
      setPassword("");
      setConfirm("");
      setMessage(copy.success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.fail);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      <p className="mb-4 border-l-4 border-amber-400 pl-3 text-sm text-[var(--muted)]">{copy.intro}</p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="inline-flex items-center gap-1.5 text-sm font-medium" htmlFor="profile-new-password">
            <IconLock className="h-3.5 w-3.5 text-blue-600" />
            {copy.newPassword}
          </label>
          <PasswordInput
            id="profile-new-password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={CITIZEN_PASSWORD_MIN_LENGTH}
            revealed={revealed}
            onRevealedChange={setRevealed}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="profile-confirm-password">
            {copy.confirmPassword}
          </label>
          <PasswordInput
            id="profile-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={CITIZEN_PASSWORD_MIN_LENGTH}
            revealed={revealed}
            onRevealedChange={setRevealed}
          />
        </div>
        {error ? <p className="text-sm text-[var(--rose)] md:col-span-2">{error}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--safir)] md:col-span-2" role="status">
            {message}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? copy.pending : copy.submit}
            <IconArrow className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

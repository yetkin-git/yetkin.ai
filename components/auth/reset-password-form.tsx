"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import {
  CITIZEN_PASSWORD_MIN_LENGTH,
  PASSWORD_RESET_PATH,
} from "@/lib/kernel/auth/password";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
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

export function ResetPasswordForm() {
  const copy = AUTH_SEN.reset;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      try {
        const response = await fetch("/api/auth/session", withRailApiVersion());
        if (!cancelled) {
          setSessionReady(response.ok);
        }
      } catch {
        if (!cancelled) {
          setSessionReady(false);
        }
      }
    }

    void syncSession();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!sessionReady) {
      setError(copy.noSession);
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
        setPending(false);
        return;
      }
      setMessage(copy.success);
      setPending(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.fail);
      setPending(false);
    }
  }

  if (sessionReady === null) {
    return <p className="text-sm text-[var(--muted)]">{copy.checking}</p>;
  }

  if (!sessionReady) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{copy.missing}</p>
        <p className="text-sm text-[var(--muted)]">
          <Link
            href={PASSWORD_RESET_PATH}
            className="font-medium text-[var(--foreground)] underline-offset-2 hover:text-[var(--safir-deep)] hover:underline"
          >
            {copy.forgotCta}
          </Link>
          {" · "}
          <Link
            href="/login"
            className="font-medium text-[var(--foreground)] underline-offset-2 hover:text-[var(--safir-deep)] hover:underline"
          >
            {copy.loginCta}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium" htmlFor="new-password">
          {copy.newPassword}
        </label>
        <PasswordInput
          id="new-password"
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
        <label className="block text-sm font-medium" htmlFor="confirm-password">
          {copy.confirmPassword}
        </label>
        <PasswordInput
          id="confirm-password"
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? (
        <p className="text-sm text-[var(--safir)]" role="status">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}

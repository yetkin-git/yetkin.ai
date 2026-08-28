"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCopy, IconKey } from "@/components/ui/icons";
import { PasswordInput } from "@/components/auth/password-input";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { createSupabaseBrowserClient } from "@/lib/kernel/auth/supabase-browser";
import { buildSignupEmailRedirectTo } from "@/lib/kernel/auth/redirects";
import {
  CITIZEN_PASSWORD_MIN_LENGTH,
  generateSecurePassword,
} from "@/lib/kernel/auth/password";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

function resolveSignUpMessage(message: string, copy: typeof AUTH_SEN.register): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("user already")) {
    return copy.duplicate;
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network") || normalized.includes("timeout")) {
    return AUTH_SEN.login.timeout;
  }
  if (/[çğıöşüÇĞİÖŞÜ]/.test(message)) {
    return message.trim() || copy.fail;
  }
  return copy.fail;
}

export function RegisterForm() {
  const copy = AUTH_SEN.register;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function announceCopy(value: string) {
    const copied = await copyTextToClipboard(value);
    setCopyNotice(copied ? copy.copied : copy.copyFail);
  }

  async function onGenerate() {
    const next = generateSecurePassword();
    setPassword(next);
    setRevealed(true);
    setError(null);
    await announceCopy(next);
  }

  async function onCopy() {
    if (!password) {
      setCopyNotice(copy.copyEmpty);
      return;
    }
    await announceCopy(password);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildSignupEmailRedirectTo(window.location.origin),
        },
      });
      if (signError) {
        setError(resolveSignUpMessage(signError.message, copy));
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

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm" htmlFor="register-email">
        {copy.email}
        <Input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <div>
        <label className="block text-sm" htmlFor="register-password">
          {copy.password}
        </label>
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={CITIZEN_PASSWORD_MIN_LENGTH}
          revealed={revealed}
          onRevealedChange={setRevealed}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void onGenerate()}>
            <IconKey />
            {copy.generatePassword}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void onCopy()}>
            <IconCopy />
            {copyNotice === copy.copied ? copy.copied : copy.copy}
          </Button>
        </div>
        {copyNotice ? (
          <p className="mt-1 text-xs text-[var(--safir)]" role="status">
            {copyNotice}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.passwordHint(CITIZEN_PASSWORD_MIN_LENGTH)}</p>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--safir)]">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}

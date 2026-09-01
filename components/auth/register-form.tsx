"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCopy, IconKey } from "@/components/ui/icons";
import { PasswordInput } from "@/components/auth/password-input";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import {
  AUTH_BROWSER_FETCH_TIMEOUT_MS,
  createSupabaseBrowserClient,
  describePublicSupabaseBrowserEnv,
  SupabaseBrowserEnvError,
} from "@/lib/kernel/auth/supabase-browser";
import { buildSignupEmailRedirectTo, readPostLoginPathFromSearch } from "@/lib/kernel/auth/redirects";
import { buildSignupAuthMetadata, isDuplicateSignupUser } from "@/lib/kernel/auth/signup-metadata";
import {
  CITIZEN_PASSWORD_MIN_LENGTH,
  generateSecurePassword,
} from "@/lib/kernel/auth/password";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

async function withWatchdog<T>(work: Promise<T>, ms: number, timeoutError: Error): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(timeoutError), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

function resolveSignUpFailure(caught: unknown, copy: typeof AUTH_SEN.register): string {
  if (caught instanceof SupabaseBrowserEnvError) {
    return caught.code === "missing" ? AUTH_SEN.login.envMissing : AUTH_SEN.login.timeout;
  }
  if (caught instanceof DOMException && (caught.name === "TimeoutError" || caught.name === "AbortError")) {
    return AUTH_SEN.login.timeout;
  }
  if (caught instanceof Error) {
    const message = caught.message.toLowerCase();
    if (message.includes("yapılandırılmadı") || message.includes("required to create")) {
      return AUTH_SEN.login.envMissing;
    }
    if (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("abort") ||
      message.includes("timeout") ||
      message.includes("ulaşılamadı")
    ) {
      return AUTH_SEN.login.timeout;
    }
    return caught.message.trim() || copy.fail;
  }
  return copy.fail;
}

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

export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const copy = AUTH_SEN.register;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

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
      if (!ageConfirmed) {
        setError(copy.ageRequired);
        return;
      }

      const metadata = buildSignupAuthMetadata(fullName);
      if (!metadata) {
        setError(copy.fullNameInvalid);
        return;
      }

      const envProbe = describePublicSupabaseBrowserEnv();
      if (!envProbe.hasUrl || !envProbe.hasAnon) {
        throw new SupabaseBrowserEnvError("missing", AUTH_SEN.login.envMissing);
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error: signError } = await withWatchdog(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: buildSignupEmailRedirectTo(window.location.origin),
          },
        }),
        AUTH_BROWSER_FETCH_TIMEOUT_MS,
        new Error(AUTH_SEN.login.timeout),
      );
      if (signError) {
        setError(resolveSignUpMessage(signError.message, copy));
        return;
      }
      if (isDuplicateSignupUser(data.user)) {
        setError(copy.duplicate);
        return;
      }
      if (data.session) {
        window.location.assign(readPostLoginPathFromSearch(window.location.search, nextPath));
        return;
      }
      setMessage(copy.success);
    } catch (caught) {
      setError(resolveSignUpFailure(caught, copy));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="register-full-name">
        {copy.fullName}
        <Input
          id="register-full-name"
          type="text"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          maxLength={DISPLAY_NAME_MAX_LENGTH}
        />
      </label>
      <label className="block text-sm font-medium" htmlFor="register-email">
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
        <label className="block text-sm font-medium" htmlFor="register-password">
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
          <p className="mt-1 text-xs text-slate-600">{copy.passwordHint(CITIZEN_PASSWORD_MIN_LENGTH)}</p>
        )}
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-sm font-medium" htmlFor="register-age-confirm">
        <input
          id="register-age-confirm"
          type="checkbox"
          name="ageConfirm"
          className="mt-1 accent-[var(--safir)]"
          checked={ageConfirmed}
          onChange={(event) => setAgeConfirmed(event.target.checked)}
          required
        />
        <span>{copy.ageConfirm}</span>
      </label>
      {error ? (
        <div
          role="alert"
          data-testid="register-error"
          className="rounded-[var(--radius-card)] border border-[var(--rose)] bg-[var(--rose-soft)] px-3 py-2 text-sm text-[var(--rose)]"
        >
          {error}
        </div>
      ) : null}
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

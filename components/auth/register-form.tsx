"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCopy, IconKey } from "@/components/ui/icons";
import { PasswordInput } from "@/components/auth/password-input";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import {
  AUTH_BROWSER_FETCH_TIMEOUT_MS,
  describePublicSupabaseBrowserEnv,
  SupabaseBrowserEnvError,
} from "@/lib/kernel/auth/supabase-browser";
import { AUTH_REGISTER_API_PATH } from "@/lib/kernel/auth/redirects";
import { resolveSignupAuthError } from "@/lib/kernel/auth/signup-errors";
import { buildSignupAuthMetadata } from "@/lib/kernel/auth/signup-metadata";
import {
  CITIZEN_PASSWORD_MIN_LENGTH,
  generateSecurePassword,
} from "@/lib/kernel/auth/password";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

const REGISTER_DEBUG = "[rail-register]";

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
    return resolveSignupAuthError(caught.message, copy);
  }
  return copy.fail;
}

function readRegisterOkState(body: unknown): { fallback: boolean } | null {
  if (!body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
    return null;
  }
  if (!("data" in body) || !body.data || typeof body.data !== "object") {
    return { fallback: false };
  }
  const data = body.data;
  return {
    fallback: "fallback" in data && data.fallback === true,
  };
}

function readRegisterFailMessage(body: unknown, copy: typeof AUTH_SEN.register): string {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return resolveSignupAuthError(body.error, copy);
  }
  return copy.fail;
}

export function RegisterForm() {
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
  const [termsConfirmed, setTermsConfirmed] = useState(false);

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
    console.log(REGISTER_DEBUG, "submit:start");
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const metadata = buildSignupAuthMetadata(fullName, ageConfirmed, termsConfirmed);
      if (!metadata) {
        if (!termsConfirmed) {
          setError(copy.termsRequired);
          return;
        }
        setError(ageConfirmed ? copy.fullNameInvalid : copy.ageRequired);
        return;
      }

      const envProbe = describePublicSupabaseBrowserEnv();
      console.log(REGISTER_DEBUG, "env:probe", envProbe);
      if (!envProbe.hasUrl || !envProbe.hasAnon) {
        throw new SupabaseBrowserEnvError("missing", AUTH_SEN.login.envMissing);
      }

      console.log(REGISTER_DEBUG, "register:request");
      const response = await withWatchdog(
        fetch(AUTH_REGISTER_API_PATH, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            fullName,
            ageConfirmed,
            termsConfirmed,
          }),
        }),
        AUTH_BROWSER_FETCH_TIMEOUT_MS,
        new Error(AUTH_SEN.login.timeout),
      );
      const body: unknown = await response.json().catch(() => null);
      console.log(REGISTER_DEBUG, "register:result", {
        status: response.status,
        ok: Boolean(body && typeof body === "object" && "ok" in body && body.ok),
      });
      if (!response.ok || !body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        const next = readRegisterFailMessage(body, copy);
        console.error(REGISTER_DEBUG, "register:error", response.status, next);
        setError(next);
        return;
      }
      const okState = readRegisterOkState(body);
      console.log(REGISTER_DEBUG, "register:ok → pending-verification");
      setMessage(okState?.fallback ? copy.devFallback : copy.pendingVerification);
    } catch (caught) {
      console.error(REGISTER_DEBUG, "caught", caught);
      setError(resolveSignUpFailure(caught, copy));
    } finally {
      setPending(false);
      console.log(REGISTER_DEBUG, "submit:finally pending=false");
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
      <label className="flex cursor-pointer items-start gap-2 text-sm font-medium" htmlFor="register-terms-confirm">
        <input
          id="register-terms-confirm"
          type="checkbox"
          name="termsConfirm"
          className="mt-1 accent-[var(--safir)]"
          checked={termsConfirmed}
          onChange={(event) => setTermsConfirmed(event.target.checked)}
          required
        />
        <span>
          <Link
            href="/legal/kullanim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--safir)] underline hover:opacity-80"
          >
            {copy.termsTermsLink}
          </Link>
          {" ve "}
          <Link
            href="/legal/gizlilik"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--safir)] underline hover:opacity-80"
          >
            {copy.termsKvkkLink}
          </Link>
          {copy.termsConsentSuffix}
        </span>
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
        <p
          className="text-sm text-[var(--safir)]"
          role="status"
          data-testid="register-pending"
        >
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleContinueButton } from "@/components/auth/google-continue-button";
import { PasswordInput } from "@/components/auth/password-input";
import {
  AUTH_BROWSER_FETCH_TIMEOUT_MS,
  createSupabaseBrowserClient,
  describePublicSupabaseBrowserEnv,
  SupabaseBrowserEnvError,
} from "@/lib/kernel/auth/supabase-browser";
import { PASSWORD_RESET_PATH } from "@/lib/kernel/auth/password";
import {
  AUTH_RESEND_CONFIRMATION_API_PATH,
  readPostLoginPathFromSearch,
} from "@/lib/kernel/auth/redirects";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

const LOGIN_DEBUG = "[rail-login]";

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

function resolveLoginFailure(caught: unknown, copy: typeof AUTH_SEN.login): string {
  if (caught instanceof SupabaseBrowserEnvError) {
    return caught.code === "missing" ? copy.envMissing : copy.timeout;
  }
  if (caught instanceof DOMException && (caught.name === "TimeoutError" || caught.name === "AbortError")) {
    return copy.timeout;
  }
  if (caught instanceof Error) {
    const message = caught.message.toLowerCase();
    if (message.includes("yapılandırılmadı") || message.includes("required to create")) {
      return copy.envMissing;
    }
    if (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("abort") ||
      message.includes("timeout") ||
      message.includes("ulaşılamadı")
    ) {
      return copy.timeout;
    }
    return caught.message.trim() || copy.fail;
  }
  return copy.fail;
}

function readMail(body: unknown): "sent" | "failed" | "unconfigured" {
  if (!body || typeof body !== "object" || !("data" in body) || !body.data || typeof body.data !== "object") {
    return "unconfigured";
  }
  const data = body.data;
  if ("mail" in data && (data.mail === "sent" || data.mail === "failed" || data.mail === "unconfigured")) {
    return data.mail;
  }
  return "unconfigured";
}

function resolveSignInMessage(message: string, copy: typeof AUTH_SEN.login): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login") || normalized.includes("invalid_credentials")) {
    return copy.invalid;
  }
  if (normalized.includes("email not confirmed") || normalized.includes("email_not_confirmed")) {
    return copy.unconfirmed;
  }
  if (normalized.includes("failed to fetch") || normalized.includes("fetch") || normalized.includes("network")) {
    return copy.timeout;
  }
  return message.trim() || copy.fail;
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [copy, setCopy] = useState(AUTH_SEN.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  useEffect(() => {
    setCopy(AUTH_SEN.login);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    console.log(LOGIN_DEBUG, "submit:start");
    setPending(true);
    setError(null);
    setNotice(null);
    setNeedsConfirm(false);
    try {
      const envProbe = describePublicSupabaseBrowserEnv();
      console.log(LOGIN_DEBUG, "env:probe", envProbe);
      if (!envProbe.hasUrl || !envProbe.hasAnon) {
        throw new SupabaseBrowserEnvError("missing", copy.envMissing);
      }

      console.log(LOGIN_DEBUG, "client:create");
      const supabase = createSupabaseBrowserClient();
      console.log(LOGIN_DEBUG, "client:ready", { host: envProbe.host });

      console.log(LOGIN_DEBUG, "signIn:request");
      const { error: signError } = await withWatchdog(
        supabase.auth.signInWithPassword({ email, password }),
        AUTH_BROWSER_FETCH_TIMEOUT_MS,
        new Error(copy.timeout),
      );
      console.log(LOGIN_DEBUG, "signIn:result", {
        hasError: Boolean(signError),
        name: signError?.name ?? null,
        status: signError?.status ?? null,
      });
      if (signError) {
        const next = resolveSignInMessage(signError.message, copy);
        console.error(LOGIN_DEBUG, "signIn:error", signError.name, signError.message);
        setError(next);
        setNeedsConfirm(next === copy.unconfirmed);
        return;
      }
      console.log(LOGIN_DEBUG, "signIn:ok → next");
      window.location.assign(readPostLoginPathFromSearch(window.location.search, nextPath));
    } catch (caught) {
      console.error(LOGIN_DEBUG, "caught", caught);
      setError(resolveLoginFailure(caught, copy));
    } finally {
      setPending(false);
      console.log(LOGIN_DEBUG, "submit:finally pending=false");
    }
  }

  async function onResend() {
    setResendPending(true);
    setNotice(null);
    try {
      const response = await fetch(AUTH_RESEND_CONFIRMATION_API_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body: unknown = await response.json().catch(() => null);
      const mail = readMail(body);
      if (mail === "sent") {
        setError(null);
        setNotice(AUTH_SEN.register.resendSent);
        return;
      }
      setError(mail === "unconfigured" ? AUTH_SEN.register.mailUnconfigured : AUTH_SEN.register.mailFailed);
    } catch {
      setError(AUTH_SEN.register.mailFailed);
    } finally {
      setResendPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
      <GoogleContinueButton nextPath={nextPath} />
      <label
        className="block text-sm font-medium"
        htmlFor="login-email"
        suppressHydrationWarning={true}
      >
        {copy.email}
        <Input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          suppressHydrationWarning={true}
        />
      </label>
      <div>
        <label
          className="block text-sm font-medium"
          htmlFor="login-password"
          suppressHydrationWarning={true}
        >
          {copy.password}
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          suppressHydrationWarning={true}
        />
      </div>
      <div className="flex justify-end">
        <Link
          href={PASSWORD_RESET_PATH}
          className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--safir-deep)] hover:underline"
          suppressHydrationWarning={true}
        >
          {copy.forgotCta}
        </Link>
      </div>
      </div>
      {error ? (
        <div
          role="alert"
          data-testid="login-error"
          className="mt-2 shrink-0 rounded-[var(--radius-card)] border border-[var(--rose)] bg-[var(--rose-soft)] px-3 py-2 text-sm text-[var(--rose)]"
        >
          {error}
        </div>
      ) : null}
      {notice ? (
        <p className="mt-2 shrink-0 text-sm text-[var(--safir)]" role="status" data-testid="login-resend-status">
          {notice}
        </p>
      ) : null}
      {needsConfirm ? (
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full shrink-0"
          disabled={resendPending || pending || !email}
          data-testid="login-resend"
          onClick={() => void onResend()}
        >
          {resendPending ? AUTH_SEN.register.resendPending : AUTH_SEN.register.resend}
        </Button>
      ) : null}
      <Button type="submit" className="mt-2 w-full shrink-0" disabled={pending || resendPending} suppressHydrationWarning={true}>
        {pending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}

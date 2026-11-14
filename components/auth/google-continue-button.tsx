"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createSupabaseBrowserClient,
  describePublicSupabaseBrowserEnv,
  SupabaseBrowserEnvError,
} from "@/lib/kernel/auth/supabase-browser";
import { buildAuthCallbackRedirectTo, readPostLoginPathFromSearch } from "@/lib/kernel/auth/redirects";
import {
  classifyGoogleOAuthFailure,
  googleOauthReasonMessage,
} from "@/lib/kernel/auth/google-oauth";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

const GOOGLE_DEBUG = "[rail-google]";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4A7.2 7.2 0 0 1 5 12c0-.8.1-1.6.4-2.4V6.5H1.4A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}

async function readProviderDisabled(url: string): Promise<boolean> {
  try {
    const probe = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
    });
    if (probe.type === "opaqueredirect" || probe.status === 0 || (probe.status >= 300 && probe.status < 400)) {
      return false;
    }
    if (probe.status < 400) {
      return false;
    }
    const text = await probe.text();
    return classifyGoogleOAuthFailure(text) === "unavailable";
  } catch (caught) {
    console.error(GOOGLE_DEBUG, "probe", caught);
    return false;
  }
}

export function GoogleContinueButton({ nextPath }: { nextPath?: string }) {
  const copy = AUTH_SEN.google;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = googleOauthReasonMessage(params.get("error"));
    if (!message) {
      return;
    }
    setError(message);
    params.delete("error");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  async function onGoogle() {
    setPending(true);
    setError(null);
    let leaving = false;
    try {
      const envProbe = describePublicSupabaseBrowserEnv();
      if (!envProbe.hasUrl || !envProbe.hasAnon) {
        throw new SupabaseBrowserEnvError("missing", AUTH_SEN.login.envMissing);
      }
      const supabase = createSupabaseBrowserClient();
      const next = readPostLoginPathFromSearch(window.location.search, nextPath);
      const redirectTo = buildAuthCallbackRedirectTo(window.location.origin, next);
      console.log(GOOGLE_DEBUG, "oauth:start", { host: envProbe.host });
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError || !data.url) {
        const kind = classifyGoogleOAuthFailure(oauthError?.message ?? "");
        console.error(GOOGLE_DEBUG, "oauth:error", oauthError?.message ?? "missing_url");
        setError(
          googleOauthReasonMessage(
            kind === "unavailable" ? "google_unavailable" : kind === "consent" ? "google_consent" : "auth_callback",
          ),
        );
        return;
      }
      if (await readProviderDisabled(data.url)) {
        console.error(GOOGLE_DEBUG, "oauth:provider-disabled");
        setError(copy.unavailable);
        return;
      }
      leaving = true;
      window.location.assign(data.url);
    } catch (caught) {
      console.error(GOOGLE_DEBUG, "caught", caught);
      if (caught instanceof SupabaseBrowserEnvError) {
        setError(caught.code === "missing" ? AUTH_SEN.login.envMissing : AUTH_SEN.login.timeout);
        return;
      }
      setError(copy.fail);
    } finally {
      if (!leaving) {
        setPending(false);
      }
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        data-testid="google-continue"
        onClick={() => void onGoogle()}
      >
        <GoogleMark />
        {pending ? copy.pending : copy.cta}
      </Button>
      {error ? (
        <div
          role="alert"
          data-testid="google-continue-error"
          className="rounded-[var(--radius-card)] border border-[var(--rose)] bg-[var(--rose-soft)] px-3 py-2 text-sm text-[var(--rose)]"
        >
          {error}
        </div>
      ) : null}
      <p className="text-xs leading-5 text-slate-600">
        {copy.consentLead}{" "}
        <Link
          href="/legal/kullanim"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--safir)] underline hover:opacity-80"
        >
          {copy.termsLink}
        </Link>
        {" ve "}
        <Link
          href="/legal/gizlilik"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--safir)] underline hover:opacity-80"
        >
          {copy.kvkkLink}
        </Link>
        {copy.consentTail}
      </p>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-[var(--border)]" />
        {copy.divider}
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
    </div>
  );
}

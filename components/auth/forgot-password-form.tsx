"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/kernel/auth/supabase-browser";
import { buildPasswordResetRedirectTo } from "@/lib/kernel/auth/redirects";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

export function ForgotPasswordForm() {
  const copy = AUTH_SEN.forgot;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setError(copy.invalidEmail);
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = buildPasswordResetRedirectTo(window.location.origin);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (resetError) {
        setError(resetError.message);
        setPending(false);
        return;
      }
      setMessage(copy.sent);
      setPending(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.fail);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm" htmlFor="reset-email">
        {copy.email}
        <Input
          id="reset-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? (
        <p className="text-sm text-[var(--safir)]" role="status">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
      <p className="text-sm text-[var(--muted)]">
        <Link
          href="/login"
          className="font-medium text-[var(--foreground)] underline-offset-2 hover:text-[var(--safir-deep)] hover:underline"
        >
          {copy.backCta}
        </Link>
      </p>
    </form>
  );
}

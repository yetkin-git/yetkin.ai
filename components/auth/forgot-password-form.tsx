"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_RESET_PASSWORD_API_PATH } from "@/lib/kernel/auth/redirects";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { LEGAL_SUPPORT_EMAIL, LEGAL_SUPPORT_MAILTO } from "@/lib/copy/legal-launch";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

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
      const response = await fetch(
        AUTH_RESET_PASSWORD_API_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        }),
      );
      const parsed = parseRailClientJson<{ sent?: boolean }>(
        await response.json().catch(() => null),
      );
      if (!response.ok || !parsed.ok) {
        setError(!parsed.ok && parsed.error.trim() ? parsed.error : copy.fail);
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
      <label className="block text-sm font-medium" htmlFor="reset-email">
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
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--safir)]" role="status">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </Button>
      <p className="text-sm text-[var(--muted)]">
        {copy.supportLead}{" "}
        <a
          href={LEGAL_SUPPORT_MAILTO}
          className="font-medium text-[var(--foreground)] underline-offset-2 hover:text-[var(--safir-deep)] hover:underline"
        >
          {LEGAL_SUPPORT_EMAIL}
        </a>{" "}
        {copy.supportTail}
      </p>
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

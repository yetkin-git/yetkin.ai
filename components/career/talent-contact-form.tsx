"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/** Kamu kartında iletişim talebi. Aday e-postası HTML'e basılmaz. */
export function TalentContactForm({ sealHash }: { sealHash: string }) {
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/career/contact",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sealHash, requesterName, requesterEmail, message }),
        }),
      );
      const parsed = parseRailClientJson<{ accepted?: boolean }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setDone(true);
    } catch {
      setError("İletişim talebi gönderilemedi.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Card title="İletişim talebi">
        <p className="text-sm text-[var(--muted)]">Talebin alındı. Adayın e-postası bu sayfada gösterilmez.</p>
      </Card>
    );
  }

  return (
    <Card title="İletişim Talebi Gönder">
      <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
        <p className="text-sm text-[var(--muted)]">
          Mesajın sunucuya kaydedilir. Adayın e-posta adresi bu forma basılmaz.
        </p>
        <Input
          value={requesterName}
          onChange={(event) => setRequesterName(event.target.value)}
          placeholder="Adın"
          maxLength={120}
          required
        />
        <Input
          type="email"
          value={requesterEmail}
          onChange={(event) => setRequesterEmail(event.target.value)}
          placeholder="E-postan"
          maxLength={160}
          required
        />
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Kısa mesajın (en az 20 karakter)"
          maxLength={2000}
          rows={4}
          required
        />
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Gönderiliyor…" : "İletişim Talebi Gönder"}
        </Button>
      </form>
    </Card>
  );
}

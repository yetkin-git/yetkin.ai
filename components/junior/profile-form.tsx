"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JuniorProfileForm() {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianUserId, setGuardianUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/junior/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dateOfBirth, guardianUserId }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Profil açılamadı.");
      return;
    }
    router.refresh();
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label className="block text-sm">
        Doğum tarihi (YYYY-AA-GG)
        <Input
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          placeholder="2012-03-21"
          required
        />
      </label>
      <label className="block text-sm">
        Ebeveyn kullanıcı kimliği
        <Input
          value={guardianUserId}
          onChange={(event) => setGuardianUserId(event.target.value)}
          required
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Yaş kapısını aç"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

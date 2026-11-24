"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/**
 * Faz 3 / §4.1 — `/claim/[token]` şifre belirleme formu.
 *
 * Kullanıcı şifresini burada belirler; hesap **şimdi** açılır (ödeme zaten onaylı).
 * Başarıda doğrudan `/tezgah`'a gidilir. Çift tıklama engellenir; sunucu aynı
 * token'ı ikinci kez kabul etmez.
 */
export function ClaimOrderForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const longEnough = password.length >= CITIZEN_PASSWORD_MIN_LENGTH;
  const matches = password.length > 0 && password === confirm;
  const ready = longEnough && matches && !pending;

  async function submit() {
    if (!ready) {
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        "/api/auth/claim-order",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, password }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!response.ok || body?.ok === false) {
        setError(typeof body?.error === "string" ? body.error : "Hesap açılamadı.");
        return;
      }
      router.push("/tezgah");
      router.refresh();
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="space-y-3"
      data-claim-order-form=""
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Label>
        E-posta
        <Input value={email} readOnly disabled autoComplete="username" />
      </Label>
      <Label>
        Şifre
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={CITIZEN_PASSWORD_MIN_LENGTH}
          maxLength={256}
          required
        />
        <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">
          En az {CITIZEN_PASSWORD_MIN_LENGTH} karakter. Bu şifreyle sonraki girişlerini yaparsın.
        </span>
      </Label>
      <Label>
        Şifreyi doğrula
        <Input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          maxLength={256}
          required
        />
      </Label>
      {confirm.length > 0 && !matches ? (
        <p className="text-sm text-[var(--rose)]">Şifreler eşleşmiyor.</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      <Button type="submit" disabled={!ready}>
        {pending ? "Hesap açılıyor" : "Hesabımı aç ve Tezgâh'a geç"}
      </Button>
    </form>
  );
}

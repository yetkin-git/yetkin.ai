"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconArrow, IconBuilding, IconUser } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS, Input } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { KURUMSAL_OFFER_PACKAGES, type KurumsalOfferPackageKey } from "@/lib/sales/kurumsal-offer-packages";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function KurumsalOfferForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [packageKey, setPackageKey] = useState<KurumsalOfferPackageKey>("team-seat");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        "/api/lead",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ companyName, email, city, packageKey, note }),
        }),
      );
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || body?.ok === false) {
        setError(typeof body?.error === "string" ? body.error : "Teklif kaydedilemedi.");
        return;
      }
      setMessage("Talebiniz alındı. Kurumsal paneliniz tanımlanınca e-posta ile bilgilendirilirsiniz.");
      setNote("");
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)} data-kurumsal-offer="">
      <label className="grid gap-1.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          <IconBuilding className="h-3.5 w-3.5 text-blue-600" />
          Firma
        </span>
        <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required maxLength={120} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          <IconUser className="h-3.5 w-3.5 text-indigo-600" />
          E-posta
        </span>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">İl</span>
        <Input value={city} onChange={(event) => setCity(event.target.value)} required maxLength={80} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Paket
        <select
          className={INPUT_SURFACE_CLASS}
          value={packageKey}
          onChange={(event) => setPackageKey(event.target.value as KurumsalOfferPackageKey)}
        >
          {KURUMSAL_OFFER_PACKAGES.map((row) => (
            <option key={row.value} value={row.value}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
        Talebiniz
        <SmartTextarea
          context="kurumsal"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Talebinizi buraya yazınız..."
          softHint="Biraz daha detay ekleyin (ekip büyüklüğü, ihtiyaç, zaman dilimi)…"
          readyHint="✓ Temel detaylar yeterli"
        />
      </label>
      {error ? <p className="text-sm text-[var(--rose)] md:col-span-2">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--emerald)] md:col-span-2">{message}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Gönderiliyor" : "Talebinizi bırakın"}
          <IconArrow className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}

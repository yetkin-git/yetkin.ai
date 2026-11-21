"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconArrow, IconBuilding, IconUser } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS, Input } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { KURUMSAL_OFFER_PACKAGES, type KurumsalOfferPackageKey } from "@/lib/sales/kurumsal-offer-packages";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/**
 * Sunucu sınırları (`app/api/lead/route.ts`).
 *
 * Tespit #27: formun istemci tarafında hiç doğrulama yoktu. Sunucu `clip()`
 * değerleri **sessizce kırpıyordu** — kullanıcı 300 karakterlik firma adının
 * 120'ye kesildiğini görmüyor, kaydın bozulduğunu ancak sonradan fark ediyordu.
 * Sınırlar buraya birebir taşındı: `maxLength` kırpmayı engeller, `aria-invalid`
 * + satır içi mesaj eksiği görünür kılar.
 *
 * Bu sabitler sunucunun `clip(..., N)` sayılarıyla aynı olmalıdır. Sapma
 * `tests/kurumsal/offer-form-surface.test.ts` içinde kilitlidir.
 */
export const OFFER_FORM_LIMITS = {
  companyName: 120,
  email: 160,
  city: 80,
  note: 500,
} as const;

/** Sunucu `EMAIL_RE` ile aynı desen (kırpma öncesi ham değer üzerinde). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sunucu `companyName.length < 2 || city.length < 2` kuralıyla aynı. */
const MIN_TEXT = 2;

type FieldErrors = Partial<Record<"companyName" | "email" | "city", string>>;

/**
 * Saf doğrulayıcı — React'ten bağımsız, test edilebilir.
 * `normalize` sunucunun `clip()` davranışını taklit eder (boşluk sadeleştirme),
 * böylece istemci ile sunucu aynı değeri ölçer.
 */
export function validateOfferForm(input: {
  companyName: string;
  email: string;
  city: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const companyName = input.companyName.replace(/\s+/g, " ").trim();
  const email = input.email.trim().toLowerCase();
  const city = input.city.replace(/\s+/g, " ").trim();

  if (companyName.length < MIN_TEXT) {
    errors.companyName = "Firma adı en az 2 karakter olmalı.";
  } else if (companyName.length > OFFER_FORM_LIMITS.companyName) {
    errors.companyName = `Firma adı en fazla ${OFFER_FORM_LIMITS.companyName} karakter olabilir.`;
  }

  if (email.length === 0) {
    errors.email = "E-posta gerekli.";
  } else if (email.length > OFFER_FORM_LIMITS.email) {
    errors.email = `E-posta en fazla ${OFFER_FORM_LIMITS.email} karakter olabilir.`;
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "E-posta adresi geçersiz.";
  }

  if (city.length < MIN_TEXT) {
    errors.city = "İl en az 2 karakter olmalı.";
  } else if (city.length > OFFER_FORM_LIMITS.city) {
    errors.city = `İl en fazla ${OFFER_FORM_LIMITS.city} karakter olabilir.`;
  }

  return errors;
}

export function KurumsalOfferForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [packageKey, setPackageKey] = useState<KurumsalOfferPackageKey>("team-seat");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const invalid = validateOfferForm({ companyName, email, city });
    setFieldErrors(invalid);
    if (Object.keys(invalid).length > 0) {
      setError("Formda eksik alan var. İşaretli alanları düzeltip yeniden gönder.");
      return;
    }
    setPending(true);
    setError("");
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
      setFieldErrors({});
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
        <Input
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          required
          maxLength={OFFER_FORM_LIMITS.companyName}
          aria-invalid={fieldErrors.companyName ? true : undefined}
        />
        {fieldErrors.companyName ? (
          <span className="text-xs font-normal text-[var(--rose)]">{fieldErrors.companyName}</span>
        ) : null}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">
          <IconUser className="h-3.5 w-3.5 text-indigo-600" />
          E-posta
        </span>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={OFFER_FORM_LIMITS.email}
          aria-invalid={fieldErrors.email ? true : undefined}
        />
        {fieldErrors.email ? (
          <span className="text-xs font-normal text-[var(--rose)]">{fieldErrors.email}</span>
        ) : null}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span className="inline-flex items-center gap-1.5">İl</span>
        <Input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          required
          maxLength={OFFER_FORM_LIMITS.city}
          aria-invalid={fieldErrors.city ? true : undefined}
        />
        {fieldErrors.city ? (
          <span className="text-xs font-normal text-[var(--rose)]">{fieldErrors.city}</span>
        ) : null}
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
          maxLength={OFFER_FORM_LIMITS.note}
          rows={4}
          placeholder="Talebinizi buraya yazınız..."
          softHint="Biraz daha detay ekleyin (ekip büyüklüğü, ihtiyaç, zaman dilimi)…"
          readyHint="✓ Temel detaylar yeterli"
        />
        <span className="text-xs font-normal text-[var(--muted)]">
          {note.length} / {OFFER_FORM_LIMITS.note} karakter
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-[var(--rose)] md:col-span-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-[var(--emerald)] md:col-span-2">
          {message}
        </p>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Gönderiliyor" : "Talebinizi bırakın"}
          <IconArrow className="h-3.5 w-3.5" />
        </Button>
      </div>
    </form>
  );
}

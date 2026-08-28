"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CompanyForm({
  initial,
}: {
  initial?: {
    legalName: string;
    tradeName: string | null;
    jurisdiction: string;
    taxId: string | null;
  } | null;
}) {
  const router = useRouter();
  const [legalName, setLegalName] = useState(initial?.legalName ?? "");
  const [tradeName, setTradeName] = useState(initial?.tradeName ?? "");
  const [jurisdiction, setJurisdiction] = useState(initial?.jurisdiction ?? "TR");
  const [taxId, setTaxId] = useState(initial?.taxId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/kurumsal/company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        legalName,
        tradeName: tradeName.trim() ? tradeName : null,
        jurisdiction,
        taxId: taxId.trim() ? taxId : null,
      }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Şirket kaydedilemedi.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        Unvan
        <Input value={legalName} onChange={(event) => setLegalName(event.target.value)} required minLength={2} />
      </label>
      <label className="block text-sm">
        Marka (isteğe bağlı)
        <Input value={tradeName} onChange={(event) => setTradeName(event.target.value)} />
      </label>
      <label className="block text-sm">
        Yargı
        <Input value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} required />
      </label>
      <label className="block text-sm">
        Vergi no (isteğe bağlı)
        <Input value={taxId} onChange={(event) => setTaxId(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : initial ? "Profili güncelle" : "Şirketi mühürle"}
      </Button>
    </form>
  );
}

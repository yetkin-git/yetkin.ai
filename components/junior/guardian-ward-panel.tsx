"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseMajorToMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { JuniorProfileRecord } from "@/lib/junior/types";

export function GuardianWardPanel({ wards }: { wards: JuniorProfileRecord[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [capMajor, setCapMajor] = useState("50");
  const [grantMajor, setGrantMajor] = useState("10");

  async function consent(childUserId: string) {
    setPending(true);
    setError(null);
    const response = await fetch("/api/junior/parent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ childUserId }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Onay yazılamadı.");
      return;
    }
    router.refresh();
  }

  async function setCap(childUserId: string) {
    setPending(true);
    setError(null);
    const weeklyCapMinor = parseMajorToMinor(capMajor, SETTLEMENT_CURRENCY);
    const response = await fetch("/api/junior/allowance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ childUserId, weeklyCapMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Tavan yazılamadı.");
      return;
    }
    router.refresh();
  }

  async function grant(childUserId: string) {
    setPending(true);
    setError(null);
    const amountMinor = parseMajorToMinor(grantMajor, SETTLEMENT_CURRENCY);
    const response = await fetch("/api/junior/allowance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ childUserId, amountMinor }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "Harçlık yazılamadı.");
      return;
    }
    router.refresh();
  }

  if (wards.length === 0) {
    return <p>Bağlı genç profil yok.</p>;
  }

  return (
    <div className="space-y-4">
      {wards.map((ward) => (
        <div key={ward.id} className="space-y-2 rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="font-medium text-[var(--foreground)]">{ward.userId}</p>
          <p className="text-xs uppercase tracking-wide">
            {ward.status === "GUARDIAN_LINKED" ? "Vekâlet bağlı" : "Onay bekliyor"} · {ward.mebTrackKey}
          </p>
          {ward.status !== "GUARDIAN_LINKED" ? (
            <Button type="button" onClick={() => void consent(ward.userId)} disabled={pending}>
              Ebeveyn onayını ver
            </Button>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm">
                Haftalık tavan (₺)
                <Input value={capMajor} onChange={(event) => setCapMajor(event.target.value)} />
              </label>
              <Button type="button" onClick={() => void setCap(ward.userId)} disabled={pending}>
                Tavanı mühürle
              </Button>
              <label className="block text-sm">
                Harçlık (₺)
                <Input value={grantMajor} onChange={(event) => setGrantMajor(event.target.value)} />
              </label>
              <Button type="button" variant="ghost" onClick={() => void grant(ward.userId)} disabled={pending}>
                Harçlık aktar
              </Button>
            </div>
          )}
        </div>
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

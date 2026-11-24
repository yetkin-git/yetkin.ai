"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

/** KVKK veri silme paneli. */
export function CareerPrivacyPanel() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onErase() {
    if (!window.confirm("CV, mühür, portföy ve iletişim kayıtların silinsin mi? Bu işlem geri alınamaz.")) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/career/privacy",
        withRailApiVersion({ method: "DELETE" }),
      );
      const parsed = parseRailClientJson<{ erased?: boolean }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setDone(true);
    } catch {
      setError("Silme isteği tamamlanamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Gizlilik (KVKK)">
      <p className="text-sm text-[var(--muted)]">
        CV&apos;ni, YetkinCV mühürlerini, portföy kayıtlarını silebilir; kurumsal başvurulardaki ad, e-posta
        ve CV özetini anonimleştirebilirsin.
      </p>
      {done ? (
        <p className="mt-3 text-sm text-[var(--emerald)]">Kişisel verilerin silindi / anonimleştirildi.</p>
      ) : (
        <Button className="mt-3" variant="outline" size="sm" disabled={pending} onClick={() => void onErase()}>
          {pending ? "Siliniyor…" : "Verilerimi sil / anonimleştir"}
        </Button>
      )}
      {error ? <p className="mt-2 text-sm text-[var(--rose)]">{error}</p> : null}
    </Card>
  );
}

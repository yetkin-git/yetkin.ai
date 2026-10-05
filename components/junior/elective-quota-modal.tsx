"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { JUNIOR_ELECTIVES_PATH, JUNIOR_ELECTIVE_QUOTA, JUNIOR_YEARLY_LIST_PRICE_LABEL } from "@/lib/junior/limits";
import { juniorElectiveCardLabel, juniorElectiveCardState } from "@/lib/junior/plan";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Pick = { slug: string; title: string; subject: string };

type Envelope = { ok?: boolean; error?: string | null };

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as Envelope | null;
  return body?.error || "Seçim kaydedilemedi.";
}

export function ElectiveQuotaModal({
  profileId,
  selected,
  planActive,
  picks,
}: {
  profileId: string;
  selected: readonly string[];
  planActive: boolean;
  picks: readonly Pick[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([...selected]);
  const [swapSlug, setSwapSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function openModal() {
    setDraft([...selected]);
    setSwapSlug(null);
    setError("");
    setOpen(true);
  }

  function toggle(slug: string) {
    setError("");
    if (draft.includes(slug)) {
      const next = draft.filter((item) => item !== slug);
      if (swapSlug && !next.includes(swapSlug)) {
        setDraft([...next, swapSlug]);
        setSwapSlug(null);
        return;
      }
      setDraft(next);
      return;
    }
    if (draft.length >= JUNIOR_ELECTIVE_QUOTA) {
      setSwapSlug(slug);
      setError("Kota dolu. Çıkaracağın dersi seç. Yerine bu ders gelir.");
      return;
    }
    setSwapSlug(null);
    setDraft([...draft, slug]);
  }

  async function save() {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        JUNIOR_ELECTIVES_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profileId, slugs: draft }),
        }),
      );
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const dialog = open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="junior-quota-title"
            className="grid max-h-[90vh] w-full max-w-lg gap-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="junior-quota-title" className="text-lg font-semibold">
                  Üç seçmeli ders
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {draft.length} / {JUNIOR_ELECTIVE_QUOTA}. Üç ders dolunca diğerleri kota durumuna geçer.
                  {planActive
                    ? " Paket açık. Seçtiğin derslerin kilitli konuları açılır."
                    : ` Kilit, yıllık paket (${JUNIOR_YEARLY_LIST_PRICE_LABEL}) açılınca kalkar.`}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Kapat
              </Button>
            </div>
            <ul className="grid gap-2">
              {picks.map((pick) => {
                const state = juniorElectiveCardState(pick.slug, draft);
                const label = juniorElectiveCardLabel(state);
                return (
                  <li
                    key={pick.slug}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{pick.title}</p>
                      <p className="text-xs text-[var(--muted)]">{pick.subject}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={state === "chosen" ? "secondary" : state === "full" ? "outline" : "primary"}
                      onClick={() => toggle(pick.slug)}
                    >
                      {label}
                    </Button>
                  </li>
                );
              })}
            </ul>
            {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <LinkButton href="/junior/checkout" variant="outline" size="sm">
                Paketi al
              </LinkButton>
              <Button type="button" size="sm" disabled={pending} onClick={() => void save()}>
                {pending ? "Kaydediliyor" : "Seçimi kaydet"}
              </Button>
            </div>
          </div>
        </div>
      ) : null;

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openModal}>
        Seçimini düzenle ({selected.length}/{JUNIOR_ELECTIVE_QUOTA})
      </Button>
      {dialog}
    </>
  );
}

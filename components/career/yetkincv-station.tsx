"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { YetkinCvCard } from "@/components/career/yetkincv-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import {
  YETKINCV_ROLES,
  YETKINCV_VERTICALS,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvRoleId,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv-options";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type StartData = {
  sittingId: string;
  expiresAt: string;
  questions: YetkinCvPublicQuestion[];
};

export function YetkinCvStation({
  signedIn,
  initialCard = null,
}: {
  signedIn: boolean;
  initialCard?: YetkinCvCardView | null;
}) {
  const router = useRouter();
  const [roleId, setRoleId] = useState<YetkinCvRoleId>("corporate");
  const [verticalId, setVerticalId] = useState<YetkinCvVerticalId>("ecommerce");
  const [cvText, setCvText] = useState("");
  const [sitting, setSitting] = useState<StartData | null>(null);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [card, setCard] = useState<YetkinCvCardView | null>(initialCard);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const step = card && !sitting ? 3 : sitting ? 2 : 1;

  async function post(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const response = await fetch(
      "/api/career/yetkincv",
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json().catch(() => null));
    if (!parsed.ok) {
      setError(parsed.error);
      return null;
    }
    return parsed.data;
  }

  async function onStart() {
    setError(null);
    setPending(true);
    try {
      const data = await post({ action: "start", roleId, verticalId, cvText });
      if (!data || typeof data.sittingId !== "string" || !Array.isArray(data.questions)) {
        setError("Sınav oturumu açılmadı.");
        return;
      }
      setSitting({
        sittingId: data.sittingId,
        expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : "",
        questions: data.questions as YetkinCvPublicQuestion[],
      });
      setChoices({});
      setCard(null);
    } finally {
      setPending(false);
    }
  }

  async function onSubmit() {
    if (!sitting) {
      return;
    }
    setError(null);
    setPending(true);
    try {
      const answers = sitting.questions.map((question) => ({
        questionId: question.id,
        choiceIndex: choices[question.id] ?? -1,
      }));
      if (answers.some((answer) => answer.choiceIndex < 0)) {
        setError("Her soruda bir şık seç.");
        return;
      }
      const data = await post({ action: "submit", sittingId: sitting.sittingId, answers });
      const next = data?.card;
      if (!next || typeof next !== "object") {
        setError("Puan hesaplanamadı.");
        return;
      }
      setCard(next as YetkinCvCardView);
      setSitting(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="yetkincv" data-yetkincv-station="true" className="scroll-mt-24 space-y-4">
      <Card eyebrow="YetkinCV" title="YetkinCV Oluştur ve Canlı Test Et">
        <p className="text-sm leading-6 text-[var(--foreground)]">
          Üç adım sunucuda yürür. Puan ve SHA-256 kodu bu oturumun hesabıdır. Sahte ilan ve şirket logosu basılmaz.
          İşe yerleşmeyi garanti etmez.
        </p>
        <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {["CV girişi", "Vaka testi", "Mühürlü kart"].map((label, index) => (
            <li
              key={label}
              className={
                step === index + 1
                  ? "rounded-xl border border-[var(--safir)] bg-blue-50/70 px-3 py-2 font-medium"
                  : "rounded-xl border border-[var(--border)] px-3 py-2 text-[var(--muted)]"
              }
            >
              Adım {index + 1} — {label}
            </li>
          ))}
        </ol>
      </Card>
      {step === 1 ? (
        <Card title="Adım 1 — CV girişi">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Hedef pozisyon
              <select
                className={INPUT_SURFACE_CLASS}
                value={roleId}
                onChange={(event) => setRoleId(event.target.value as YetkinCvRoleId)}
              >
                {YETKINCV_ROLES.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Uzmanlık
              <select
                className={INPUT_SURFACE_CLASS}
                value={verticalId}
                onChange={(event) => setVerticalId(event.target.value as YetkinCvVerticalId)}
              >
                {YETKINCV_VERTICALS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block text-sm">
            CV özeti
            <div className="mt-1">
              <SmartTextarea
                className="min-h-32"
                context="career"
                value={cvText}
                maxLength={6000}
                placeholder="Metninizi buraya yazınız..."
                softHint="Biraz daha detay ekleyin (yaptığınız iş, araçlar, ölçülebilir sonuç)…"
                onChange={(event) => setCvText(event.target.value)}
              />
            </div>
          </label>
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {signedIn ? (
              <Button type="button" disabled={pending} onClick={() => void onStart()}>
                {pending ? "Oturum açılıyor" : "Testi başlat"}
              </Button>
            ) : (
              <LinkButton href={"/login?next=/career" as Route} size="sm">
                Giriş yap ve testi başlat
              </LinkButton>
            )}
          </div>
        </Card>
      ) : null}
      {step === 2 && sitting ? (
        <Card title="Adım 2 — Uygulamalı vaka testi">
          <ol className="grid gap-5">
            {sitting.questions.map((question, index) => (
              <li key={question.id}>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {index + 1}. {question.kind === "case" ? "Vaka. " : ""}
                  {question.prompt}
                </p>
                <div className="mt-2 grid gap-2">
                  {question.choices.map((choice, choiceIndex) => (
                    <label key={choice} className="flex items-start gap-2 text-sm leading-6">
                      <input
                        type="radio"
                        name={question.id}
                        className="mt-1"
                        checked={choices[question.id] === choiceIndex}
                        onChange={() =>
                          setChoices((current) => ({ ...current, [question.id]: choiceIndex }))
                        }
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
          <div className="mt-4">
            <Button type="button" disabled={pending} onClick={() => void onSubmit()}>
              {pending ? "Puan hesaplanıyor" : "Puanı hesapla"}
            </Button>
          </div>
        </Card>
      ) : null}
      {step === 3 && card ? (
        <div className="space-y-3">
          <YetkinCvCard card={card} />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCard(null);
              setSitting(null);
              setError(null);
            }}
          >
            Testi yeniden çöz
          </Button>
        </div>
      ) : null}
    </section>
  );
}

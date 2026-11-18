"use client";

import { useState, type FormEvent } from "react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { YetkinCvPublicQuestion } from "@/lib/career/yetkincv-options";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type SittingData = {
  sittingId: string;
  expiresAt: string;
  questions: YetkinCvPublicQuestion[];
};

type ScoreData = {
  score: number;
  weightedScore: number | null;
  skillLine: string | null;
  certificateCode: string;
  verifyPath: string | null;
  passedBar: boolean;
};

function isQuestion(value: unknown): value is YetkinCvPublicQuestion {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as { id?: unknown; prompt?: unknown; choices?: unknown; skillLabel?: unknown; kind?: unknown };
  return (
    typeof row.id === "string" &&
    typeof row.prompt === "string" &&
    typeof row.skillLabel === "string" &&
    (row.kind === "choice" || row.kind === "case") &&
    Array.isArray(row.choices) &&
    row.choices.every((choice) => typeof choice === "string")
  );
}

export function KurumsalJobApplyGate({
  slug,
  signedIn,
  loginHref,
  defaultName,
  defaultEmail,
  minScore,
}: {
  slug: string;
  signedIn: boolean;
  loginHref: string;
  defaultName: string;
  defaultEmail: string;
  minScore: number;
}) {
  const [candidateName, setCandidateName] = useState(defaultName);
  const [candidateEmail, setCandidateEmail] = useState(defaultEmail);
  const [cvSummary, setCvSummary] = useState("");
  const [sitting, setSitting] = useState<SittingData | null>(null);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [score, setScore] = useState<ScoreData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function post(path: string, body: Record<string, unknown>) {
    const response = await fetch(
      path,
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    return parseRailClientJson<Record<string, unknown>>(await response.json().catch(() => null));
  }

  async function onStart(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const parsed = await post(`/api/ilan/${slug}/basvuru`, { candidateName, candidateEmail, cvSummary });
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      if (parsed.data.kind === "scored" && typeof parsed.data.score === "number") {
        setScore({
          score: parsed.data.score,
          weightedScore: typeof parsed.data.weightedScore === "number" ? parsed.data.weightedScore : null,
          skillLine: typeof parsed.data.skillLine === "string" ? parsed.data.skillLine : null,
          certificateCode: typeof parsed.data.certificateCode === "string" ? parsed.data.certificateCode : "",
          verifyPath: typeof parsed.data.verifyPath === "string" ? parsed.data.verifyPath : null,
          passedBar: parsed.data.passedBar === true,
        });
        setSitting(null);
        return;
      }
      const questions = Array.isArray(parsed.data.questions) ? parsed.data.questions.filter(isQuestion) : [];
      if (typeof parsed.data.sittingId !== "string" || questions.length === 0) {
        setError("Sınav oturumu açılmadı.");
        return;
      }
      setSitting({
        sittingId: parsed.data.sittingId,
        expiresAt: typeof parsed.data.expiresAt === "string" ? parsed.data.expiresAt : "",
        questions,
      });
      setChoices({});
      setScore(null);
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sitting) {
      return;
    }
    const answers = sitting.questions.map((question) => ({
      questionId: question.id,
      choiceIndex: choices[question.id] ?? -1,
    }));
    if (answers.some((answer) => answer.choiceIndex < 0)) {
      setError("Her soruda bir şık seç.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const parsed = await post(`/api/ilan/${slug}/sinav`, { sittingId: sitting.sittingId, answers });
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      if (typeof parsed.data.score !== "number" || typeof parsed.data.certificateCode !== "string") {
        setError("Puan hesaplanamadı.");
        return;
      }
      setScore({
        score: parsed.data.score,
        weightedScore: typeof parsed.data.weightedScore === "number" ? parsed.data.weightedScore : null,
        skillLine: typeof parsed.data.skillLine === "string" ? parsed.data.skillLine : null,
        certificateCode: parsed.data.certificateCode,
        verifyPath: typeof parsed.data.verifyPath === "string" ? parsed.data.verifyPath : null,
        passedBar: parsed.data.passedBar === true,
      });
      setSitting(null);
      setCvSummary("");
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  if (!signedIn) {
    return (
      <Card title="Canlı teste girmek için giriş gerekir">
        <p className="text-sm leading-6">
          Puan tarayıcıda hesaplanmaz. Oturum açınca ad, e-posta ve CV özetini yazıp vaka testini çözersin.
          CV metnin kamu dizinine basılmaz.
        </p>
        <a href={loginHref} className={buttonClassName("primary", "md", "mt-4")}>
          Giriş yap
        </a>
      </Card>
    );
  }

  if (score) {
    const headline = score.weightedScore === null ? score.score : score.weightedScore;
    return (
      <Card eyebrow="Ağırlıklı sonuç" title={`${headline}/100`}>
        {score.skillLine ? <p className="text-sm leading-6">{score.skillLine}</p> : null}
        <p className="mt-2 text-sm leading-6">
          {score.passedBar
            ? `Baraj ${minScore}. Ağırlıklı puanın şirket sıralamasına işlendi.`
            : `Baraj ${minScore}. Ağırlıklı puanın kayda geçti. Sıralama ilanı açan şirketin kokpitindedir.`}
        </p>
        {score.verifyPath ? (
          <a href={score.verifyPath} className="mt-3 inline-flex text-sm font-semibold text-[var(--safir)]">
            Doğrulama bağını aç
          </a>
        ) : null}
      </Card>
    );
  }

  if (sitting) {
    return (
      <Card eyebrow="YetkinCV" title="Uygulamalı vaka testi">
        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          {sitting.questions.map((question, index) => (
            <fieldset key={question.id} className="grid gap-2">
              <legend className="text-sm font-semibold">
                {index + 1}. {question.skillLabel}. {question.prompt}
              </legend>
              {question.choices.map((choice, choiceIndex) => (
                <label key={choice} className="flex items-start gap-2 text-sm leading-6">
                  <input
                    type="radio"
                    className="mt-1"
                    name={question.id}
                    checked={choices[question.id] === choiceIndex}
                    onChange={() => setChoices((current) => ({ ...current, [question.id]: choiceIndex }))}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </fieldset>
          ))}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Puanlanıyor" : "Testi bitir"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card eyebrow="Başvuru" title="Ad, e-posta ve CV özeti">
      <form className="grid gap-3" onSubmit={(event) => void onStart(event)}>
        <label className="grid gap-1.5 text-sm font-medium">
          Ad
          <Input value={candidateName} onChange={(event) => setCandidateName(event.target.value)} required maxLength={120} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          E-posta
          <Input
            type="email"
            value={candidateEmail}
            onChange={(event) => setCandidateEmail(event.target.value)}
            required
            maxLength={160}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          CV özeti
          <Textarea
            value={cvSummary}
            onChange={(event) => setCvSummary(event.target.value)}
            required
            minLength={40}
            maxLength={6000}
            rows={6}
          />
        </label>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Metin ilanı açan şirkete gider. Herkese açık dizine basılmaz. Puan sunucudaki vaka testinden yazılır.
        </p>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Sınav açılıyor" : "Testi başlat"}
        </Button>
      </form>
    </Card>
  );
}

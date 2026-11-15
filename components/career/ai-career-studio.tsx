"use client";

import { useState, type FormEvent } from "react";
import type { Route } from "next";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import type { CareerCoachDossier, CareerCoachGoal } from "@/lib/career/coach-contract";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import { CAREER_COACH_SEN } from "@/lib/copy/sen-voice/career-coach";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type ChatTurn = { role: "user" | "assistant"; content: string };

type ProfilePayload = {
  mode: "profile";
  source: "llm" | "fallback";
  note: string;
  verifiedBadgeCount: number;
  dossier: CareerCoachDossier;
};

type DialoguePayload = {
  mode: "dialogue";
  source: "llm" | "fallback";
  reply: string;
  disclaimer: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function printCv(text: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("title", CAREER_COACH_SEN.cvTitle);
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(
    `<!doctype html><html><head><title>${escapeHtml(CAREER_COACH_SEN.cvTitle)}</title></head><body><pre style="font-family:Georgia,serif;white-space:pre-wrap">${escapeHtml(text)}</pre></body></html>`,
  );
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  window.setTimeout(() => frame.remove(), 1000);
}

export function AiCareerStudio({ verifiedBadges }: { verifiedBadges: readonly string[] }) {
  const copy = CAREER_COACH_SEN;
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState<CareerCoachGoal>("freelancer");
  const [dossier, setDossier] = useState<CareerCoachDossier | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<"profile" | "dialogue" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  async function postCoach(body: Record<string, unknown>): Promise<ProfilePayload | DialoguePayload | null> {
    const response = await fetch(
      "/api/career/coach",
      withRailApiVersion({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    const parsed = parseRailClientJson<ProfilePayload | DialoguePayload>(await response.json().catch(() => null));
    if (!parsed.ok) {
      setError(parsed.error || copy.error);
      return null;
    }
    return parsed.data;
  }

  async function onGenerate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending("profile");
    try {
      const data = await postCoach({ mode: "profile", targetRole, experience, goal });
      if (data && data.mode === "profile") {
        setDossier(data.dossier);
        setNote(data.note);
        setBadgeCount(data.verifiedBadgeCount);
        setMessages([]);
      }
    } catch {
      setError(copy.error);
    } finally {
      setPending(null);
    }
  }

  async function sendMessage(message: string) {
    const text = message.trim();
    if (!text || pending) {
      return;
    }
    setError(null);
    setPending("dialogue");
    const history = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", content: text }]);
    setDraft("");
    try {
      const data = await postCoach({
        mode: "dialogue",
        targetRole,
        experience,
        goal,
        message: text,
        history,
        dossier,
      });
      if (data && data.mode === "dialogue") {
        setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((current) => current.slice(0, -1));
      }
    } catch {
      setError(copy.error);
      setMessages((current) => current.slice(0, -1));
    } finally {
      setPending(null);
    }
  }

  async function onCopy() {
    if (!dossier) {
      return;
    }
    const ok = await copyTextToClipboard(dossier.cv);
    setCopyNotice(ok ? copy.copied : copy.copyFail);
    window.setTimeout(() => setCopyNotice(null), 1800);
  }

  return (
    <section id="kariyer-kocu" data-career-coach="true" className="scroll-mt-24 space-y-4">
      <Card eyebrow={copy.eyebrow} title={copy.title}>
        <p className="text-[var(--foreground)]">{copy.lead}</p>
        <p className="mt-3 text-[var(--foreground)]">
          {verifiedBadges.length === 0 ? copy.emptyBadges : copy.badgeBound(verifiedBadges.length)}
        </p>
        {verifiedBadges.length === 0 ? (
          <div className="mt-3">
            <LinkButton href="/academy" variant="outline" size="sm">
              {CAREER_SEN.academyCta}
            </LinkButton>
          </div>
        ) : null}
        <form className="mt-5 grid gap-3" onSubmit={onGenerate}>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.targetRoleLabel}
            <input
              className={`mt-1 ${INPUT_SURFACE_CLASS}`}
              value={targetRole}
              maxLength={120}
              required
              placeholder={copy.targetRolePlaceholder}
              onChange={(event) => setTargetRole(event.target.value)}
            />
          </label>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.experienceLabel}
            <textarea
              className={`mt-1 min-h-28 ${INPUT_SURFACE_CLASS}`}
              value={experience}
              maxLength={2000}
              required
              placeholder={copy.experiencePlaceholder}
              onChange={(event) => setExperience(event.target.value)}
            />
          </label>
          <label className="block text-sm text-[var(--foreground)]">
            {copy.goalLabel}
            <select
              className={`mt-1 ${INPUT_SURFACE_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value as CareerCoachGoal)}
            >
              {copy.goals.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <Button type="submit" size="sm" disabled={pending !== null}>
              {pending === "profile" ? copy.generating : copy.generateCta}
            </Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
      </Card>

      {dossier ? (
        <div className="space-y-4">
          {note ? <p className="text-sm text-[var(--foreground)]">{note}</p> : null}
          {badgeCount != null ? (
            <p className="text-xs text-[var(--muted)]">{copy.badgeBound(badgeCount)}</p>
          ) : null}
          <Card eyebrow={copy.eyebrow} title={copy.cvTitle}>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void onCopy()}>
                {copy.copyCta}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => printCv(dossier.cv)}>
                {copy.printCta}
              </Button>
              {copyNotice ? <span className="self-center text-xs">{copyNotice}</span> : null}
            </div>
            <pre className="whitespace-pre-wrap font-serif text-sm leading-6 text-[var(--foreground)]">
              {dossier.cv}
            </pre>
          </Card>
          <Card title={copy.swotTitle}>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["strengths", copy.strengths],
                  ["weaknesses", copy.weaknesses],
                  ["opportunities", copy.opportunities],
                  ["threats", copy.threats],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-[var(--border)] p-3">
                  <p className="text-xs font-semibold text-[var(--foreground)]">{label}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {dossier.swot[key].map((item, index) => (
                      <li key={`${key}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
          <Card title={copy.offersTitle}>
            <ol className="space-y-4">
              {dossier.offers.map((offer) => (
                <li key={offer.title} className="rounded-xl border border-[var(--border)] p-3">
                  <p className="font-semibold text-[var(--foreground)]">{offer.title}</p>
                  <p className="mt-1">{offer.why}</p>
                  <p className="mt-2 text-[var(--foreground)]">{offer.incomeStep}</p>
                  {offer.tezgahHref ? (
                    <div className="mt-3">
                      <LinkButton href={offer.tezgahHref as Route} variant="outline" size="sm">
                        {offer.tezgahLabel ?? copy.tezgahCta}
                      </LinkButton>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </Card>
          <Card title={copy.roadmapTitle}>
            <ol className="list-decimal space-y-2 pl-5 text-[var(--foreground)]">
              {dossier.roadmap.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs">{dossier.disclaimer}</p>
          </Card>
          <Card title={copy.dialogueTitle}>
            <p className="text-[var(--foreground)]">{copy.dialogueLead}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {copy.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending !== null}
                  onClick={() => void sendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            <ul className="mt-4 space-y-3" aria-live="polite">
              {messages.map((turn, index) => (
                <li
                  key={`${turn.role}-${index}`}
                  className={
                    turn.role === "user"
                      ? "rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-[var(--foreground)]"
                      : "rounded-xl border border-[var(--border)] px-3 py-2 text-[var(--foreground)]"
                  }
                >
                  <p className="whitespace-pre-wrap">{turn.content}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(draft);
              }}
            >
              <label className="sr-only" htmlFor="career-coach-draft">
                {copy.dialogueTitle}
              </label>
              <input
                id="career-coach-draft"
                className={INPUT_SURFACE_CLASS}
                value={draft}
                maxLength={2000}
                placeholder={copy.dialoguePlaceholder}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button type="submit" size="sm" disabled={pending !== null || draft.trim().length === 0}>
                {pending === "dialogue" ? copy.generating : copy.sendCta}
              </Button>
            </form>
          </Card>
        </div>
      ) : null}
    </section>
  );
}

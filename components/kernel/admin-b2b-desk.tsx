"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import type { B2bBoardView } from "@/lib/kernel/admin/b2b-outbound";
import {
  ADMIN_B2B_PATH,
  ADMIN_B2B_REPLY_PATH,
  ADMIN_B2B_SEND_PATH,
} from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const copy = ADMIN_SEN.b2b;

function boardSignature(board: B2bBoardView): string {
  return JSON.stringify({
    enabled: board.enabled,
    sentToday: board.sentToday,
    items: board.items.map((item) => [item.id, item.status, item.subject, item.body, item.note]),
  });
}

async function postJson(path: string, method: string, body: Record<string, unknown>) {
  const response = await fetch(
    path,
    withRailApiVersion({
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return parseRailClientJson<Record<string, unknown>>(await response.json());
}

export function AdminB2bDesk({ board }: { board: B2bBoardView }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(board.enabled);
  const [sentToday, setSentToday] = useState(board.sentToday);
  const [items, setItems] = useState(board.items);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [channel, setChannel] = useState<"WEB_TETKIK" | "TUBITAK_HIBE">("WEB_TETKIK");
  const [lines, setLines] = useState("");
  const [replyCompany, setReplyCompany] = useState("");
  const [replyChannel, setReplyChannel] = useState<"WEB_TETKIK" | "TUBITAK_HIBE">("WEB_TETKIK");
  const [inbound, setInbound] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signature = boardSignature(board);

  useEffect(() => {
    setEnabled(board.enabled);
    setSentToday(board.sentToday);
    setItems(board.items);
  }, [signature, board]);

  const limitFull = sentToday >= board.dailyLimit;
  const sendLocked = !enabled || limitFull;

  async function run(task: () => Promise<void>) {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await task();
    } catch {
      setError(copy.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card eyebrow={copy.eyebrow} title={copy.title}>
        <p className="text-sm text-[var(--muted)]">{copy.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const next = !enabled;
                const parsed = await postJson(ADMIN_B2B_PATH, "PATCH", { action: "switch", enabled: next });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setEnabled(next);
                setNotice(next ? copy.switchOn : copy.switchOff);
                router.refresh();
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium"
          >
            <span>{enabled ? copy.switchOn : copy.switchOff}</span>
            <span
              aria-hidden
              className={cn("relative h-4 w-7 rounded-full", enabled ? "bg-[var(--emerald)]" : "bg-[var(--border)]")}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full bg-white",
                  enabled ? "right-0.5" : "left-0.5",
                )}
              />
            </span>
          </button>
          <p className="text-sm font-semibold">
            {copy.counterLabel}: {sentToday} / {board.dailyLimit}
          </p>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-[var(--muted)]">{notice}</p> : null}
      </Card>

      <Card title={copy.enqueueTitle}>
        <p className="mb-4 text-sm text-[var(--muted)]">{copy.enqueueBody}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.company}
            <input className={INPUT_SURFACE_CLASS} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.email}
            <input className={INPUT_SURFACE_CLASS} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.website}
            <input className={INPUT_SURFACE_CLASS} value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.sector}
            <input className={INPUT_SURFACE_CLASS} value={sector} onChange={(event) => setSector(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.city}
            <input className={INPUT_SURFACE_CLASS} value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.channel}
            <select
              className={INPUT_SURFACE_CLASS}
              value={channel}
              onChange={(event) => setChannel(event.target.value as "WEB_TETKIK" | "TUBITAK_HIBE")}
            >
              <option value="WEB_TETKIK">WEB_TETKIK</option>
              <option value="TUBITAK_HIBE">TUBITAK_HIBE</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          {copy.lines}
          <textarea
            className={cn(INPUT_SURFACE_CLASS, "min-h-24")}
            value={lines}
            onChange={(event) => setLines(event.target.value)}
          />
        </label>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const payload: Record<string, unknown> = lines.trim()
                  ? { lines }
                  : {
                      items: [
                        {
                          companyName,
                          email,
                          websiteUrl,
                          sector,
                          city,
                          channel,
                        },
                      ],
                    };
                const parsed = await postJson(ADMIN_B2B_PATH, "POST", payload);
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setCompanyName("");
                setEmail("");
                setWebsiteUrl("");
                setSector("");
                setCity("");
                setLines("");
                setNotice(copy.saved);
                router.refresh();
              })
            }
          >
            {pending ? copy.pending : copy.add}
          </Button>
        </div>
      </Card>

      <Card title={copy.queueTitle}>
        {items.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.queueEmpty}</p> : null}
        <div className="space-y-6">
          {items.map((item) => {
            const canSend = item.status === "DRAFT_READY" && !sendLocked;
            return (
              <article key={item.id} className="border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0">
                <p className="text-sm font-semibold">
                  {item.companyName} · {item.email}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {copy.status[item.status]} · {item.channel}
                  {item.score !== null ? ` · ${item.score}/100` : ""} · {item.sector} / {item.city}
                </p>
                {item.note ? <p className="mt-1 text-sm text-[var(--muted)]">{item.note}</p> : null}
                <label className="mt-2 block text-xs font-medium text-[var(--muted)]">
                  {copy.subject}
                  <input
                    className={INPUT_SURFACE_CLASS}
                    value={item.subject}
                    disabled={item.status !== "DRAFT_READY" || pending}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((row) => (row.id === item.id ? { ...row, subject: event.target.value } : row)),
                      )
                    }
                  />
                </label>
                <label className="mt-2 block text-xs font-medium text-[var(--muted)]">
                  {copy.body}
                  <textarea
                    className={cn(INPUT_SURFACE_CLASS, "min-h-40")}
                    value={item.body}
                    disabled={item.status !== "DRAFT_READY" || pending}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((row) => (row.id === item.id ? { ...row, body: event.target.value } : row)),
                      )
                    }
                  />
                </label>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  {item.status === "SEND_LOCK" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        void run(async () => {
                          const parsed = await postJson(ADMIN_B2B_PATH, "PATCH", { action: "release", id: item.id });
                          if (!parsed.ok) {
                            setError(parsed.error);
                            return;
                          }
                          router.refresh();
                        })
                      }
                    >
                      {copy.release}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending || item.status !== "DRAFT_READY"}
                    onClick={() =>
                      void run(async () => {
                        const parsed = await postJson(ADMIN_B2B_PATH, "PATCH", {
                          action: "edit",
                          id: item.id,
                          subject: item.subject,
                          body: item.body,
                        });
                        if (!parsed.ok) {
                          setError(parsed.error);
                          return;
                        }
                        setNotice(copy.saved);
                        router.refresh();
                      })
                    }
                  >
                    {copy.save}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending || !canSend}
                    onClick={() =>
                      void run(async () => {
                        const parsed = await postJson(ADMIN_B2B_SEND_PATH, "POST", {
                          id: item.id,
                          subject: item.subject,
                          body: item.body,
                        });
                        if (!parsed.ok) {
                          setError(parsed.error);
                          return;
                        }
                        const nextCount = parsed.data.sentToday;
                        if (typeof nextCount === "number") {
                          setSentToday(nextCount);
                        }
                        setNotice(copy.sent);
                        router.refresh();
                      })
                    }
                  >
                    {copy.send}
                  </Button>
                </div>
                {!canSend && item.status === "DRAFT_READY" ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">{copy.lockedSend}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </Card>

      <Card title={copy.replyTitle}>
        <p className="mb-4 text-sm text-[var(--muted)]">{copy.replyBody}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.company}
            <input className={INPUT_SURFACE_CLASS} value={replyCompany} onChange={(event) => setReplyCompany(event.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--muted)]">
            {copy.channel}
            <select
              className={INPUT_SURFACE_CLASS}
              value={replyChannel}
              onChange={(event) => setReplyChannel(event.target.value as "WEB_TETKIK" | "TUBITAK_HIBE")}
            >
              <option value="WEB_TETKIK">WEB_TETKIK</option>
              <option value="TUBITAK_HIBE">TUBITAK_HIBE</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          {copy.inbound}
          <textarea
            className={cn(INPUT_SURFACE_CLASS, "min-h-24")}
            value={inbound}
            onChange={(event) => setInbound(event.target.value)}
          />
        </label>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const parsed = await postJson(ADMIN_B2B_REPLY_PATH, "POST", {
                  companyName: replyCompany,
                  channel: replyChannel,
                  inbound,
                });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setReplyDraft(typeof parsed.data.draft === "string" ? parsed.data.draft : "");
              })
            }
          >
            {copy.reply}
          </Button>
        </div>
        {replyDraft ? (
          <textarea className={cn(INPUT_SURFACE_CLASS, "mt-3 min-h-40")} readOnly value={replyDraft} />
        ) : null}
      </Card>
    </div>
  );
}

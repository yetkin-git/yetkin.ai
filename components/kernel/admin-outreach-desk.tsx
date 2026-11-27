"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  OUTREACH_DAILY_LIMIT_MAX,
  OUTREACH_DAILY_LIMIT_MIN,
  OUTREACH_VERTICALS,
  type OutreachBoardView,
  type OutreachDraftStatus,
  type OutreachDraftView,
  type OutreachVertical,
} from "@/lib/kernel/outreach/policy";
import {
  ADMIN_OUTREACH_DRAFT_PATH,
  ADMIN_OUTREACH_IMPORT_PATH,
  ADMIN_OUTREACH_PATH,
  ADMIN_OUTREACH_SEND_PATH,
} from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const copy = ADMIN_SEN.outreach;

async function callJson(path: string, method: string, body: Record<string, unknown>) {
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

export function AdminOutreachDesk({ board }: { board: OutreachBoardView }) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(board.isEnabled);
  const [dailyLimit, setDailyLimit] = useState(board.dailyLimit);
  const [vertical, setVertical] = useState<OutreachVertical>("KURUMSAL");
  const [rows, setRows] = useState(board.drafts);
  const [blockEmail, setBlockEmail] = useState("");
  const [importText, setImportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signature = JSON.stringify(
    board.drafts.map((row) => [row.id, row.status, row.subject, row.body, row.errorMessage]),
  );

  useEffect(() => {
    setRows(board.drafts);
    setIsEnabled(board.isEnabled);
    setDailyLimit(board.dailyLimit);
  }, [signature, board.drafts, board.isEnabled, board.dailyLimit]);

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

  const counts = board.counts;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card eyebrow={copy.eyebrow} title={copy.senderTitle} dense>
          <p className="text-sm font-semibold">
            {board.senderReady ? copy.senderReady : copy.senderBlocked}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {board.senderReady ? board.fromEmail : board.senderIssue}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">{copy.senderWhy}</p>
        </Card>
        <Card eyebrow={copy.eyebrow} title={copy.switchOn} dense>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const next = !isEnabled;
                const parsed = await callJson(ADMIN_OUTREACH_PATH, "PATCH", { isEnabled: next });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setIsEnabled(next);
                setNotice(next ? copy.switchOn : copy.switchOff);
                router.refresh();
              })
            }
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              isEnabled ? "bg-[var(--ink)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {isEnabled ? copy.switchOn : copy.switchOff} · {copy.switchHint}
          </p>
        </Card>
        <Card eyebrow={copy.eyebrow} title={copy.limitLabel} dense>
          <input
            type="number"
            min={OUTREACH_DAILY_LIMIT_MIN}
            max={OUTREACH_DAILY_LIMIT_MAX}
            className={INPUT_SURFACE_CLASS}
            value={dailyLimit}
            disabled={pending}
            onChange={(event) => setDailyLimit(Number(event.target.value))}
          />
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  const parsed = await callJson(ADMIN_OUTREACH_PATH, "PATCH", { dailyLimit });
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
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">{copy.limitHint}</p>
        </Card>
      </div>

      <Card eyebrow={copy.countsTitle} title={copy.queueTitle} dense>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
          {(
            [
              ["PENDING_APPROVAL", copy.countsPending],
              ["APPROVED", copy.countsApproved],
              ["SENT", copy.countsSent],
              ["REJECTED", copy.countsRejected],
              ["FAILED", copy.countsFailed],
            ] as [OutreachDraftStatus, string][]
          ).map(([key, label]) => (
            <div key={key} className="rounded-lg border border-[var(--border)] px-3 py-2">
              <p className="text-xs text-[var(--muted)]">{label}</p>
              <p className="text-lg font-semibold">{counts[key]}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card eyebrow={copy.importTitle} title={copy.importTitle}>
        <p className="text-sm text-[var(--muted)]">{copy.importBody}</p>
        <label className="mt-4 block text-sm">
          {copy.importFile}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="mt-1 block text-sm"
            disabled={pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  setImportText(reader.result);
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
        <textarea
          className={`${INPUT_SURFACE_CLASS} mt-3 min-h-32`}
          value={importText}
          disabled={pending}
          placeholder={copy.importPlaceholder}
          onChange={(event) => setImportText(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted)]">{copy.importHint}</p>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            disabled={pending || importText.trim().length < 5}
            onClick={() =>
              void run(async () => {
                const parsed = await callJson(ADMIN_OUTREACH_IMPORT_PATH, "POST", { text: importText });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                const added = typeof parsed.data.added === "number" ? parsed.data.added : 0;
                const rejected = typeof parsed.data.rejected === "number" ? parsed.data.rejected : 0;
                const reasons =
                  parsed.data.reasons && typeof parsed.data.reasons === "object"
                    ? (parsed.data.reasons as Record<string, unknown>)
                    : null;
                const bits: string[] = [];
                if (reasons) {
                  for (const key of Object.keys(copy.importReasons) as (keyof typeof copy.importReasons)[]) {
                    const count = reasons[key];
                    if (typeof count === "number" && count > 0) {
                      bits.push(`${copy.importReasons[key]} ${count}`);
                    }
                  }
                }
                const base = `${added} hedef eklendi, ${rejected} elendi.`;
                setNotice(bits.length > 0 ? `${base} ${bits.join(", ")}.` : base);
                setImportText("");
                router.refresh();
              })
            }
          >
            {pending ? copy.pending : copy.importSubmit}
          </Button>
        </div>
      </Card>

      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--muted)]">{notice}</p> : null}

      <Card eyebrow={copy.generateTitle} title={copy.generateTitle}>
        <p className="text-sm text-[var(--muted)]">{copy.generateBody}</p>
        <label className="mt-4 block text-sm">
          {copy.vertical}
          <select
            className={INPUT_SURFACE_CLASS}
            value={vertical}
            disabled={pending}
            onChange={(event) => setVertical(event.target.value as OutreachVertical)}
          >
            {OUTREACH_VERTICALS.map((id) => (
              <option key={id} value={id}>
                {copy.verticals[id]}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const parsed = await callJson(ADMIN_OUTREACH_PATH, "POST", { vertical });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                const created = typeof parsed.data.created === "number" ? parsed.data.created : 0;
                const skipped = typeof parsed.data.skipped === "number" ? parsed.data.skipped : 0;
                setNotice(`${created} taslak yazıldı, ${skipped} hedef atlandı. Onay bekliyor.`);
                router.refresh();
              })
            }
          >
            {pending ? copy.pending : copy.generate}
          </Button>
        </div>
      </Card>

      <Card eyebrow={copy.queueEyebrow} title={copy.queueTitle}>
        {rows.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.queueEmpty}</p> : null}
        <div className="space-y-6">
          {rows.map((row) => (
            <DraftRow
              key={row.id}
              row={row}
              pending={pending}
              onChange={(next) =>
                setRows((current) => current.map((item) => (item.id === next.id ? next : item)))
              }
              onRun={run}
              onError={setError}
              onNotice={setNotice}
              refresh={() => router.refresh()}
            />
          ))}
        </div>
      </Card>

      <Card eyebrow={copy.suppressedTitle} title={copy.suppressedTitle}>
        <p className="text-sm text-[var(--muted)]">{copy.suppressedBody}</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block text-sm">
            {copy.recipient}
            <input
              className={INPUT_SURFACE_CLASS}
              value={blockEmail}
              disabled={pending}
              onChange={(event) => setBlockEmail(event.target.value)}
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || blockEmail.trim().length < 5}
            onClick={() =>
              void run(async () => {
                const parsed = await callJson(ADMIN_OUTREACH_PATH, "PATCH", {
                  action: "block",
                  email: blockEmail,
                });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setBlockEmail("");
                setNotice(copy.blocked);
                router.refresh();
              })
            }
          >
            {copy.blockEmail}
          </Button>
        </div>
        {board.suppressed.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">{copy.suppressedEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
            {board.suppressed.map((row) => (
              <li key={`${row.email}-${row.createdAt}`}>
                {row.email} · {row.reason}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function DraftRow({
  row,
  pending,
  onChange,
  onRun,
  onError,
  onNotice,
  refresh,
}: {
  row: OutreachDraftView;
  pending: boolean;
  onChange: (row: OutreachDraftView) => void;
  onRun: (task: () => Promise<void>) => Promise<void>;
  onError: (value: string | null) => void;
  onNotice: (value: string | null) => void;
  refresh: () => void;
}) {
  const [testTo, setTestTo] = useState("");
  const sent = row.status === "SENT";
  const locked = pending || sent;

  return (
    <article className="space-y-2 border-t border-[var(--border)] pt-4">
      <p className="text-sm font-semibold">
        {row.companyName} · {copy.verticals[row.vertical]} · {copy.status[row.status]}
      </p>
      <p className="text-xs text-[var(--muted)]">{row.sector}</p>
      {row.errorMessage ? <p className="text-sm text-[var(--rose)]">{row.errorMessage}</p> : null}
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.recipientEmail}
        disabled={locked}
        onChange={(event) => onChange({ ...row, recipientEmail: event.target.value })}
      />
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.subject}
        disabled={locked}
        onChange={(event) => onChange({ ...row, subject: event.target.value })}
      />
      <textarea
        className={`${INPUT_SURFACE_CLASS} min-h-40`}
        value={row.body}
        disabled={locked}
        onChange={(event) => onChange({ ...row, body: event.target.value })}
      />
      <p className="text-xs text-[var(--muted)]">{copy.editNeedsApproval}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={() =>
            void onRun(async () => {
              const parsed = await callJson(ADMIN_OUTREACH_DRAFT_PATH.replace("[id]", row.id), "PATCH", {
                id: row.id,
                recipientEmail: row.recipientEmail,
                subject: row.subject,
                body: row.body,
              });
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              onNotice(copy.saved);
              refresh();
            })
          }
        >
          {copy.save}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={locked || row.status !== "PENDING_APPROVAL"}
          onClick={() =>
            void onRun(async () => {
              const parsed = await callJson(ADMIN_OUTREACH_DRAFT_PATH.replace("[id]", row.id), "POST", {
                id: row.id,
                decision: "approve",
                subject: row.subject,
                body: row.body,
              });
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              onNotice(copy.saved);
              refresh();
            })
          }
        >
          {copy.approve}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={() =>
            void onRun(async () => {
              const parsed = await callJson(ADMIN_OUTREACH_DRAFT_PATH.replace("[id]", row.id), "POST", {
                id: row.id,
                decision: "reject",
              });
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              onNotice(copy.saved);
              refresh();
            })
          }
        >
          {copy.reject}
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-3">
        <label className="block text-xs">
          {copy.testTo}
          <input
            className={INPUT_SURFACE_CLASS}
            value={testTo}
            disabled={pending}
            onChange={(event) => setTestTo(event.target.value)}
          />
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || testTo.trim().length < 5}
          onClick={() =>
            void onRun(async () => {
              const parsed = await callJson(ADMIN_OUTREACH_SEND_PATH, "POST", {
                id: row.id,
                testTo,
              });
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              onNotice(copy.sent);
            })
          }
        >
          {copy.testSend}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending || row.status !== "APPROVED"}
          onClick={() =>
            void onRun(async () => {
              const parsed = await callJson(ADMIN_OUTREACH_SEND_PATH, "POST", { id: row.id });
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              onNotice(copy.sent);
              refresh();
            })
          }
        >
          {copy.sent}
        </Button>
      </div>
      <p className="text-xs text-[var(--muted)]">{copy.testSendHint}</p>
    </article>
  );
}

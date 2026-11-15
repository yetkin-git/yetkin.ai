"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  SOCIAL_MODULE_LABELS,
  SOCIAL_MODULES,
  SOCIAL_PLATFORM_LABELS,
  type SocialConnectionCard,
  type SocialModule,
  type SocialQueueItemView,
} from "@/lib/kernel/admin/social-desk";
import {
  ADMIN_SOCIAL_PATH,
  ADMIN_SOCIAL_PUBLISH_PATH,
  ADMIN_SOCIAL_REPLY_PATH,
} from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const copy = ADMIN_SEN.social;

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

export function AdminSocialDesk({
  connections,
  items,
  unavailable = false,
}: {
  connections: SocialConnectionCard[];
  items: SocialQueueItemView[];
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [packModule, setPackModule] = useState<SocialModule>("AI_TEZGAH");
  const [rows, setRows] = useState(items);
  const [inbound, setInbound] = useState("");
  const [replyModule, setReplyModule] = useState<SocialModule>("AI_TEZGAH");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signature = JSON.stringify(items.map((item) => [item.id, item.status, item.lastError, item.body]));

  useEffect(() => {
    setRows(items);
  }, [signature, items]);

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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {connections.map((card) => (
          <Card key={card.id} eyebrow={card.label} title={card.state === "connected" ? copy.connected : copy.missing} dense>
            <p className="text-sm text-[var(--muted)]">{card.detail}</p>
          </Card>
        ))}
      </div>
      {unavailable ? <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p> : null}
      <Card eyebrow={copy.eyebrow} title={copy.generateTitle}>
        <p className="text-sm text-[var(--muted)]">{copy.generateBody}</p>
        <label className="mt-4 block text-sm">
          {copy.module}
          <select
            className={INPUT_SURFACE_CLASS}
            value={packModule}
            disabled={pending}
            onChange={(event) => setPackModule(event.target.value as SocialModule)}
          >
            {SOCIAL_MODULES.map((id) => (
              <option key={id} value={id}>
                {SOCIAL_MODULE_LABELS[id]}
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
                const parsed = await postJson(ADMIN_SOCIAL_PATH, "POST", { module: packModule });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setNotice(typeof parsed.data.note === "string" ? parsed.data.note : copy.saved);
                router.refresh();
              })
            }
          >
            {pending ? copy.pending : copy.generate}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-[var(--muted)]">{notice}</p> : null}
      </Card>
      <Card eyebrow={copy.queueEyebrow} title={copy.queueTitle}>
        {rows.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.queueEmpty}</p> : null}
        <div className="space-y-6">
          {rows.map((row) => (
            <DraftRow
              key={row.id}
              row={row}
              pending={pending}
              onChange={(next) => setRows((current) => current.map((item) => (item.id === next.id ? next : item)))}
              onRun={run}
              onError={setError}
              onNotice={setNotice}
              refresh={() => router.refresh()}
            />
          ))}
        </div>
      </Card>
      <Card eyebrow={copy.replyEyebrow} title={copy.replyTitle}>
        <p className="text-sm text-[var(--muted)]">{copy.replyBody}</p>
        <label className="mt-4 block text-sm">
          {copy.module}
          <select
            className={INPUT_SURFACE_CLASS}
            value={replyModule}
            disabled={pending}
            onChange={(event) => setReplyModule(event.target.value as SocialModule)}
          >
            {SOCIAL_MODULES.map((id) => (
              <option key={id} value={id}>
                {SOCIAL_MODULE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          {copy.inbound}
          <textarea
            className={`${INPUT_SURFACE_CLASS} min-h-28`}
            value={inbound}
            disabled={pending}
            onChange={(event) => setInbound(event.target.value)}
          />
        </label>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                const parsed = await postJson(ADMIN_SOCIAL_REPLY_PATH, "POST", {
                  inbound,
                  module: replyModule,
                });
                if (!parsed.ok) {
                  setError(parsed.error);
                  return;
                }
                setReply(typeof parsed.data.draft === "string" ? parsed.data.draft : "");
                setNotice(typeof parsed.data.note === "string" ? parsed.data.note : copy.saved);
              })
            }
          >
            {copy.reply}
          </Button>
        </div>
        {reply ? (
          <textarea className={`${INPUT_SURFACE_CLASS} mt-3 min-h-32`} readOnly value={reply} />
        ) : null}
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
  row: SocialQueueItemView;
  pending: boolean;
  onChange: (row: SocialQueueItemView) => void;
  onRun: (task: () => Promise<void>) => Promise<void>;
  onError: (value: string | null) => void;
  onNotice: (value: string | null) => void;
  refresh: () => void;
}) {
  const payload = {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl ?? "",
    imagePrompt: row.imagePrompt,
    targetUrl: row.targetUrl,
  };
  const published = row.status === "PUBLISHED";
  return (
    <article className="space-y-2 border-t border-[var(--border)] pt-4">
      <p className="text-sm font-semibold">
        {SOCIAL_PLATFORM_LABELS[row.platform]} · {SOCIAL_MODULE_LABELS[row.module]} · {copy.status[row.status]}
      </p>
      {row.lastError ? <p className="text-sm text-[var(--rose)]">{row.lastError}</p> : null}
      {row.externalPostId ? (
        <p className="text-xs text-[var(--muted)]">
          {copy.externalId}: {row.externalPostId}
        </p>
      ) : null}
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.title}
        disabled={pending || published}
        onChange={(event) => onChange({ ...row, title: event.target.value })}
      />
      <textarea
        className={`${INPUT_SURFACE_CLASS} min-h-32`}
        value={row.body}
        disabled={pending || published}
        onChange={(event) => onChange({ ...row, body: event.target.value })}
      />
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.imageUrl ?? ""}
        placeholder={copy.imageUrl}
        disabled={pending || published}
        onChange={(event) => onChange({ ...row, imageUrl: event.target.value || null })}
      />
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.imagePrompt}
        placeholder={copy.imagePrompt}
        disabled={pending || published}
        onChange={(event) => onChange({ ...row, imagePrompt: event.target.value })}
      />
      <input
        className={INPUT_SURFACE_CLASS}
        value={row.targetUrl}
        disabled={pending || published}
        onChange={(event) => onChange({ ...row, targetUrl: event.target.value })}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || published}
          onClick={() =>
            void onRun(async () => {
              const parsed = await postJson(ADMIN_SOCIAL_PATH, "PATCH", payload);
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
          disabled={pending || published}
          onClick={() =>
            void onRun(async () => {
              const parsed = await postJson(ADMIN_SOCIAL_PUBLISH_PATH, "POST", payload);
              if (!parsed.ok) {
                onError(parsed.error);
                return;
              }
              if (parsed.data.published !== true) {
                onError(typeof parsed.data.reason === "string" ? parsed.data.reason : copy.failed);
                refresh();
                return;
              }
              onNotice(copy.published);
              refresh();
            })
          }
        >
          {copy.publish}
        </Button>
      </div>
    </article>
  );
}

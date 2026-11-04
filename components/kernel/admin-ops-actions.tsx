"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/components/kernel/admin-confirm-dialog";
import { Button } from "@/components/ui/button";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  ADMIN_OPS_GAP_REFUND_PATH,
  ADMIN_OPS_GRANT_PATH,
  ADMIN_OPS_REVOKE_PATH,
} from "@/lib/kernel/admin/types";
import type { AdminOpsGapRow } from "@/lib/kernel/admin/ops-desk";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type ActionKind = "grant" | "revoke" | "refund";

export function AdminOpsActions({
  slugs,
  gaps,
}: {
  slugs: readonly string[];
  gaps: readonly AdminOpsGapRow[] | null;
}) {
  const router = useRouter();
  const copy = ADMIN_SEN.ops;
  const [userId, setUserId] = useState("");
  const [slug, setSlug] = useState(slugs[0] ?? "");
  const [hash, setHash] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundOid, setRefundOid] = useState<string | null>(null);
  const [pending, setPending] = useState<ActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ActionKind | null>(null);

  async function post(path: string, body: Record<string, string>, kind: ActionKind) {
    setPending(kind);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        path,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
      setPending(null);
      if (!parsed.ok) {
        setError(parsed.error ?? copy.failed);
        return;
      }
      setConfirm(null);
      setNotice(copy.saved);
      setGrantReason("");
      setRevokeReason("");
      setRefundReason("");
      router.refresh();
    } catch {
      setPending(null);
      setError(copy.failed);
    }
  }

  function onConfirm() {
    if (confirm === "grant") {
      void post(ADMIN_OPS_GRANT_PATH, { userId: userId.trim(), slug, reason: grantReason.trim() }, "grant");
      return;
    }
    if (confirm === "revoke") {
      void post(ADMIN_OPS_REVOKE_PATH, { hash: hash.trim(), reason: revokeReason.trim() }, "revoke");
      return;
    }
    if (confirm === "refund" && refundOid) {
      void post(
        ADMIN_OPS_GAP_REFUND_PATH,
        { merchantOid: refundOid, reason: refundReason.trim() },
        "refund",
      );
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--emerald)]">{notice}</p> : null}
      <section className="space-y-3" aria-labelledby="ops-grant">
        <h3 id="ops-grant" className="text-sm font-semibold">
          {copy.grantTitle}
        </h3>
        <p className="text-sm text-[var(--muted)]">{copy.grantHint}</p>
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.userLabel}
          <input
            className={INPUT_SURFACE_CLASS}
            value={userId}
            autoComplete="off"
            onChange={(event) => setUserId(event.target.value)}
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.slugLabel}
          {slugs.length > 0 ? (
            <select
              className={INPUT_SURFACE_CLASS}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            >
              {slugs.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <input className={INPUT_SURFACE_CLASS} value={slug} onChange={(event) => setSlug(event.target.value)} />
          )}
        </label>
        <ReasonField label={copy.reasonLabel} value={grantReason} onChange={setGrantReason} />
        <Button type="button" size="sm" onClick={() => setConfirm("grant")} disabled={pending !== null}>
          {copy.submitGrant}
        </Button>
      </section>
      <section className="space-y-3" aria-labelledby="ops-revoke">
        <h3 id="ops-revoke" className="text-sm font-semibold">
          {copy.revokeTitle}
        </h3>
        <p className="text-sm text-[var(--muted)]">{copy.revokeHint}</p>
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.hashLabel}
          <input
            className={INPUT_SURFACE_CLASS}
            value={hash}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setHash(event.target.value)}
          />
        </label>
        <ReasonField label={copy.reasonLabel} value={revokeReason} onChange={setRevokeReason} />
        <Button type="button" size="sm" variant="danger" onClick={() => setConfirm("revoke")} disabled={pending !== null}>
          {copy.submitRevoke}
        </Button>
      </section>
      <section className="space-y-3" aria-labelledby="ops-refund">
        <h3 id="ops-refund" className="text-sm font-semibold">
          {copy.refundTitle}
        </h3>
        <p className="text-sm text-[var(--muted)]">{copy.refundHint}</p>
        {gaps === null ? (
          <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p>
        ) : gaps.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{copy.emptyGaps}</p>
        ) : (
          <ul className="space-y-3">
            {gaps.map((row) => (
              <li key={row.merchantOid} className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
                <p className="font-semibold">{row.merchantOid}</p>
                <p className="text-[var(--muted)]">
                  {row.product} · {row.reason} · {row.amountLabel} · {row.userMasked}
                </p>
                <p className="text-[var(--muted)]">{row.purpose}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  className="mt-2"
                  disabled={pending !== null}
                  onClick={() => {
                    setRefundOid(row.merchantOid);
                    setConfirm("refund");
                  }}
                >
                  {copy.submitRefund}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <ReasonField label={copy.reasonLabel} value={refundReason} onChange={setRefundReason} />
      </section>
      <AdminConfirmDialog
        open={confirm !== null}
        eyebrow={ADMIN_SEN.confirm.eyebrow}
        title={
          confirm === "grant" ? copy.grantTitle : confirm === "revoke" ? copy.revokeTitle : copy.refundTitle
        }
        body={confirm === "refund" ? `${refundOid ?? ""} · ${copy.refundHint}` : copy.actionsBody}
        confirmLabel={ADMIN_SEN.confirm.publishConfirm}
        cancelLabel={ADMIN_SEN.confirm.amountCancel}
        closeLabel={ADMIN_SEN.confirm.closeLabel}
        pendingLabel={ADMIN_SEN.confirm.pending}
        pending={pending !== null}
        onConfirm={onConfirm}
        onClose={() => {
          if (pending === null) {
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}

function ReasonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
      {label}
      <textarea
        className={INPUT_SURFACE_CLASS}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useWalletRefundPrompt } from "@/components/kernel/use-wallet-refund-prompt";
import { WalletRefundConfirmDialog } from "@/components/kernel/wallet-refund-confirm-dialog";
import { useActionBridge } from "@/components/ui/action-bridge";
import { IconClose } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { AUTH_LOGOUT_API_PATH } from "@/lib/kernel/auth/redirects";
import { PROFILE_CLOSE_PATH } from "@/lib/kernel/identity/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const CONFIRM_WORD = "KAPAT";

function submitLogout() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = AUTH_LOGOUT_API_PATH;
  document.body.appendChild(form);
  form.submit();
}

export function AccountClosePanel({ balanceMinor }: { balanceMinor: number }) {
  const { push } = useActionBridge();
  const copy = SEN_VOICE.profil.close;
  const wallet = SEN_VOICE.cuzdan;
  const idempotency = useIdempotencyKey();
  const titleId = useId();
  const [liveBalance, setLiveBalance] = useState(balanceMinor);
  const refund = useWalletRefundPrompt({
    balanceMinor: liveBalance,
    onBalance: setLiveBalance,
  });
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"emerald" | "amber">("emerald");
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setLiveBalance(balanceMinor);
  }, [balanceMinor]);

  const blocked = liveBalance > 0;
  const zeroLabel = formatMinor(0, SETTLEMENT_CURRENCY);

  function publish(text: string, tone: "emerald" | "amber") {
    setNotice(text);
    setNoticeTone(tone);
    push({ title: text, tone, ttlMs: 14_000 });
  }

  async function onCloseAccount(event: FormEvent) {
    event.preventDefault();
    if (blocked || confirm !== CONFIRM_WORD) {
      return;
    }
    setClosing(true);
    setError(null);
    const response = await fetch(
      PROFILE_CLOSE_PATH,
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json", ...idempotency.headers() },
        body: JSON.stringify({ confirm }),
      }),
    );
    const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
    if (!parsed.ok) {
      setClosing(false);
      setError(parsed.error ?? "Hesap kapatılamadı.");
      idempotency.rotate();
      return;
    }
    publish(copy.closedNotice, "emerald");
    window.setTimeout(submitLogout, 1400);
  }

  function closeModal() {
    if (closing) {
      return;
    }
    setModalOpen(false);
    setConfirm("");
    setError(null);
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow}>
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.intro}</p>
      {notice || refund.note ? (
        <p
          role="status"
          className={
            (notice ? noticeTone : refund.noteTone) === "amber"
              ? "mb-4 rounded-xl border border-[var(--amber)]/40 px-3 py-2 text-sm text-[var(--foreground)]"
              : "mb-4 rounded-xl border border-[var(--emerald)]/40 px-3 py-2 text-sm text-[var(--foreground)]"
          }
        >
          {notice ?? refund.note}
        </p>
      ) : null}
      {blocked ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--foreground)]">{copy.balanceHint}</p>
          {refund.error ? (
            <p role="alert" className="text-sm text-[var(--rose)]">
              {refund.error}
            </p>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={refund.pending} onClick={refund.ask}>
            {refund.pending ? wallet.refundPending : copy.refundCta}
          </Button>
          <p className="text-xs text-[var(--muted)]">{wallet.refundTiming}</p>
          <WalletRefundConfirmDialog
            open={refund.open}
            amountLabel={refund.amountLabel}
            pending={refund.pending}
            error={refund.error}
            onCancel={refund.cancel}
            onConfirm={() => void refund.confirm()}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--foreground)]">{copy.zeroReady(zeroLabel)}</p>
          <Button type="button" variant="danger" size="sm" onClick={() => setModalOpen(true)}>
            {copy.cta}
          </Button>
        </div>
      )}
      {modalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
          onClick={closeModal}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeModal();
            }
          }}
          role="presentation"
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => void onCloseAccount(event)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
                  {copy.modalEyebrow}
                </p>
                <h2 id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {copy.modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-[var(--muted)]"
                aria-label={copy.modalClose}
                disabled={closing}
              >
                <IconClose />
              </button>
            </div>
            <p className="text-sm leading-6 text-[var(--foreground)]">{copy.modalBody}</p>
            <Label>
              {copy.confirmLabel}
              <Input
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="off"
                placeholder={CONFIRM_WORD}
                required
                disabled={closing}
              />
            </Label>
            {error ? (
              <p role="alert" className="text-sm text-[var(--rose)]">
                {error}
              </p>
            ) : null}
            {closing ? (
              <p role="status" className="text-sm text-[var(--foreground)]">
                {copy.closedNotice}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="danger" size="sm" disabled={closing || confirm !== CONFIRM_WORD}>
                {closing ? copy.pending : copy.cta}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={closeModal} disabled={closing}>
                {copy.modalCancel}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </Card>
  );
}

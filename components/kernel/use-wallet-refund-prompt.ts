"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { useActionBridge } from "@/components/ui/action-bridge";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { WALLET_REFUND_PATH } from "@/lib/kernel/identity/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type RefundPayload = {
  refund?: { refundedMinor?: number; requestedMinor?: number; balanceMinor?: number };
};

function refundNotice(
  refundedMinor: number,
  requestedMinor: number,
  nextBalance: number,
): { text: string; tone: "emerald" | "amber" } {
  const wallet = SEN_VOICE.cuzdan;
  if (refundedMinor > 0 && nextBalance <= 0) {
    return { text: wallet.refundDone(formatMinor(refundedMinor, SETTLEMENT_CURRENCY)), tone: "emerald" };
  }
  if (refundedMinor > 0) {
    return { text: wallet.refundPartial(formatMinor(refundedMinor, SETTLEMENT_CURRENCY)), tone: "amber" };
  }
  const held = nextBalance > 0 ? nextBalance : requestedMinor;
  if (held > 0) {
    return { text: wallet.refundFinanceHold(formatMinor(held, SETTLEMENT_CURRENCY)), tone: "amber" };
  }
  return { text: wallet.refundRequested, tone: "amber" };
}

export function useWalletRefundPrompt(input: {
  balanceMinor: number;
  onBalance?: (nextBalance: number) => void;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const idempotency = useIdempotencyKey();
  const copy = SEN_VOICE.cuzdan;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [noteTone, setNoteTone] = useState<"emerald" | "amber">("emerald");

  const amountLabel = formatMinor(input.balanceMinor, SETTLEMENT_CURRENCY);

  function ask() {
    if (pending) {
      return;
    }
    setError(null);
    setOpen(true);
  }

  function cancel() {
    if (pending) {
      return;
    }
    setOpen(false);
  }

  async function confirm() {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    setNote(null);
    try {
      const response = await fetch(
        WALLET_REFUND_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ intent: "wallet-card-refund" }),
        }),
      );
      const parsed = parseRailClientJson<RefundPayload>(await response.json());
      if (!parsed.ok) {
        setError(parsed.error ?? copy.refundFail);
        idempotency.rotate();
        return;
      }
      const refunded = parsed.data.refund?.refundedMinor ?? 0;
      const requested = parsed.data.refund?.requestedMinor ?? 0;
      const nextBalance = parsed.data.refund?.balanceMinor ?? (refunded > 0 ? 0 : input.balanceMinor);
      const outcome = refundNotice(refunded, requested, nextBalance);
      setNote(outcome.text);
      setNoteTone(outcome.tone);
      push({ title: outcome.text, tone: outcome.tone, ttlMs: 14_000 });
      setOpen(false);
      idempotency.rotate();
      input.onBalance?.(nextBalance);
      router.refresh();
    } catch {
      setError(copy.refundFail);
      idempotency.rotate();
    } finally {
      setPending(false);
    }
  }

  return {
    open,
    pending,
    error,
    note,
    noteTone,
    amountLabel,
    ask,
    cancel,
    confirm,
  };
}

"use client";

import { Button } from "@/components/ui/button";
import { WalletRefundConfirmDialog } from "@/components/kernel/wallet-refund-confirm-dialog";
import { useWalletRefundPrompt } from "@/components/kernel/use-wallet-refund-prompt";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function WalletRefundButton({ balanceMinor }: { balanceMinor: number }) {
  const copy = SEN_VOICE.cuzdan;
  const refund = useWalletRefundPrompt({ balanceMinor });

  if (balanceMinor <= 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">{copy.refundBody}</p>
      {refund.error ? <p className="text-sm text-[var(--rose)]">{refund.error}</p> : null}
      {refund.note ? (
        <p role="status" className="text-sm text-white">
          {refund.note}
        </p>
      ) : null}
      <Button type="button" variant="outline" size="sm" disabled={refund.pending} onClick={refund.ask}>
        {refund.pending ? copy.refundPending : copy.refundCta}
      </Button>
      <p className="text-xs text-white/60">{copy.refundTiming}</p>
      <WalletRefundConfirmDialog
        open={refund.open}
        amountLabel={refund.amountLabel}
        pending={refund.pending}
        error={refund.error}
        onCancel={refund.cancel}
        onConfirm={() => void refund.confirm()}
      />
    </div>
  );
}

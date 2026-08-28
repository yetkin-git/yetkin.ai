"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMinor } from "@/lib/kernel/money/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCoin } from "@/components/ui/icons";
import { QuickTopUpModal } from "@/components/kernel/quick-top-up-modal";
import { fetchWalletStripClient } from "@/components/kernel/fetch-wallet-strip";
import { useActionBridge } from "@/components/ui/action-bridge";
import { STUDIO_SEN } from "@/archived/lib/copy/sen-voice/studio";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { useStudioDebit } from "@/components/studio/studio-debit-context";

export function TokenBalanceCard() {
  const { push } = useActionBridge();
  const { strip, lastSettlement, textFloorMinor, imageFloorMinor, reportBalance } = useStudioDebit();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const floor =
    textFloorMinor != null && imageFloorMinor != null
      ? Math.min(textFloorMinor, imageFloorMinor)
      : (textFloorMinor ?? imageFloorMinor);
  const insufficient = strip.live && floor != null && strip.amountMinor < floor;
  const requiredMinor = floor ?? WALLET_TOP_UP_MIN_MINOR;
  const preCheck =
    strip.live && floor != null
      ? STUDIO_SEN.wallet.preCheck(
          formatMinor(strip.amountMinor, strip.currencyCode),
          formatMinor(floor, strip.currencyCode),
        )
      : STUDIO_SEN.wallet.preCheckUnbound;
  const remainingNotice = lastSettlement
    ? STUDIO_SEN.wallet.remaining(formatMinor(lastSettlement.remainingMinor, lastSettlement.currencyCode))
    : null;

  return (
    <Card variant="ink" eyebrow={STUDIO_SEN.wallet.eyebrow} title={STUDIO_SEN.wallet.title} bodyClassName="text-white/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">
            {formatMinor(strip.amountMinor, strip.currencyCode)}
          </p>
          <p className="mt-1 text-xs">{strip.live ? STUDIO_SEN.wallet.live : STUDIO_SEN.wallet.unbound}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
          <IconCoin className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5">{preCheck}</p>
      {remainingNotice ? (
        <p aria-live="polite" className="mt-2 text-xs font-semibold text-white">
          {remainingNotice}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Badge tone="safir">{STUDIO_SEN.wallet.textBadge}</Badge>
        <div className="flex items-center gap-3">
          {insufficient ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setTopUpOpen(true)}>
              {UX_SEN.topUp.trigger}
            </Button>
          ) : null}
          <Link href="/cuzdan" className="text-xs font-semibold text-white hover:underline">
            {STUDIO_SEN.wallet.walletCta}
          </Link>
        </div>
      </div>
      <QuickTopUpModal
        open={topUpOpen}
        requiredMinor={requiredMinor}
        currencyCode={strip.currencyCode}
        onClose={() => setTopUpOpen(false)}
        onFunded={() => {
          setTopUpOpen(false);
          void fetchWalletStripClient().then(reportBalance);
          push({ title: STUDIO_SEN.frozenBridge.generateReadyTitle, body: STUDIO_SEN.frozenBridge.generateReadyBody, tone: "emerald" });
        }}
      />
    </Card>
  );
}

"use client";

import Link from "next/link";
import { formatMinor } from "@/lib/kernel/money/format";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconWallet } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function WalletBalanceStrip() {
  const { wallet: strip } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.walletStrip;

  return (
    <Card variant="ink" eyebrow={copy.eyebrow} title={copy.title} bodyClassName="text-white/70">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2">
            <Badge tone={strip.live ? "emerald" : "neutral"}>
              {strip.live ? copy.live : copy.unbound}
            </Badge>
          </div>
          <p className="text-4xl font-semibold tracking-tight text-white">
            {formatMinor(strip.amountMinor, strip.currencyCode)}
          </p>
          <p className="mt-2 text-xs">{copy.body}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <IconWallet className="h-6 w-6 text-white" />
          </span>
          <Link href="/cuzdan" className="text-sm font-semibold text-white hover:underline">
            {copy.openCta}
          </Link>
        </div>
      </div>
    </Card>
  );
}

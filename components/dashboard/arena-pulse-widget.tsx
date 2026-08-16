"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconTrophy } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function ArenaPulseWidget() {
  const { arena: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Arena özeti"
      live={pulse.live}
      liveHint="Canlı · güvenli kuyruk"
      href="/arena"
      hrefLabel="Arena odasına git"
      stats={[
        { label: "Açık ihale", value: pulse.openTendersSponsored, icon: <IconTrophy /> },
        { label: "Teslim", value: pulse.submissionsMade },
        { label: "Kazanılan", value: pulse.awardsWon },
      ]}
    >
      Kilitli ödül havuzu: {formatMinor(pulse.pendingPoolMinor, pulse.currencyCode)}
    </PulseCard>
  );
}

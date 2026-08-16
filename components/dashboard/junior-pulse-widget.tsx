"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconChild } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function JuniorPulseWidget() {
  const { junior: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Junior yaş kapısı"
      live={pulse.live}
      liveHint="Canlı · TR MEB"
      href="/junior"
      hrefLabel="Junior odasına git"
      stats={[
        {
          label: "Harçlık kalan",
          value: formatMinor(pulse.remainingMinor, pulse.currencyCode),
          icon: <IconChild />,
        },
        { label: "Vekâlet bağlı", value: pulse.wardsLinked },
      ]}
    >
      {pulse.mebTrackKey ?? "Profil veya vekâlet yok"}
    </PulseCard>
  );
}

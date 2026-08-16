"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconSpark } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function StudioPulseWidget() {
  const { studio: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Studio özeti"
      live={pulse.live}
      href="/studio"
      hrefLabel="Studio odasına git"
      stats={[
        { label: "Taslak", value: pulse.draftsCount, icon: <IconSpark /> },
        { label: "Üretim", value: pulse.generationsSucceeded },
      ]}
    >
      {pulse.lastDraftTitle ?? "Henüz taslak yok"} · son düşüm{" "}
      {formatMinor(pulse.lastDebitMinor, pulse.currencyCode)}
    </PulseCard>
  );
}

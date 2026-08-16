"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { IconMegaphone } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function SocialPulseWidget() {
  const { social: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="YetkinX kanıt meydanı"
      live={pulse.live}
      liveHint="Canlı · mühürlü akış"
      href="/social"
      hrefLabel="YetkinX odasına git"
      stats={[
        { label: "Mühür", value: pulse.sealedCount, icon: <IconMegaphone /> },
        { label: "Meydan", value: pulse.squareCount },
      ]}
    >
      {pulse.lastTitle ?? "Henüz kanıt yok"}
    </PulseCard>
  );
}

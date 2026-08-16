"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { IconCode } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function DevlabsPulseWidget() {
  const { devlabs: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="DevLabs özeti"
      live={pulse.live}
      liveHint="Canlı · güvenli tezgâh"
      href="/devlabs"
      hrefLabel="DevLabs odasına git"
      stats={[
        { label: "Proje", value: pulse.projectsCount, icon: <IconCode /> },
        { label: "Aktif anahtar", value: pulse.activeKeysCount },
        { label: "Artifact", value: pulse.artifactsCount },
      ]}
    />
  );
}

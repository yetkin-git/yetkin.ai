"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { IconLeaf } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function HibePulseWidget() {
  const { hibe: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Hibe-Teşvik önerileri"
      live={pulse.live}
      liveHint="Canlı · derleme katalog"
      href="/hibe"
      hrefLabel="Hibe odasına git"
      stats={[
        { label: "Açık rehber", value: pulse.applicationsOpen, icon: <IconLeaf /> },
        { label: "Liste tamam", value: pulse.applicationsDone },
      ]}
    >
      {pulse.recommendations.length === 0
        ? "Öneri yok"
        : pulse.recommendations
            .map((row) => `${row.title} · ${row.agency === "TUBITAK" ? "TÜBİTAK" : row.agency}`)
            .join(" · ")}
    </PulseCard>
  );
}

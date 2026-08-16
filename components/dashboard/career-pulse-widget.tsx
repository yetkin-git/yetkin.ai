"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { IconBadge } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function CareerPulseWidget() {
  const { career: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Kariyer vizesi"
      live={pulse.live}
      href="/career"
      hrefLabel="Kariyer odasına git"
      stats={[
        { label: "Vize", value: pulse.visaCount, icon: <IconBadge /> },
        { label: "Portföy", value: pulse.portfolioCount },
      ]}
    >
      {pulse.lastVisaTitle ?? "Henüz damga yok"}
    </PulseCard>
  );
}

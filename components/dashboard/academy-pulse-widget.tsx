"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function AcademyPulseWidget() {
  const { academy: pulse } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.pulse;

  return (
    <PulseCard
      title={copy.academyTitle}
      live={pulse.live}
      unavailableHint={copy.unavailable}
      href="/tezgah"
      hrefLabel={copy.academyHrefLabel}
      stats={[]}
      invite={
        pulse.live
          ? { message: copy.academyEmpty, cta: copy.academyEmptyCta }
          : undefined
      }
    >
      {pulse.live ? null : copy.unavailable}
    </PulseCard>
  );
}

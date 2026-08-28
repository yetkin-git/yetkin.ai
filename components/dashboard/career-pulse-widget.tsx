"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function CareerPulseWidget() {
  const { career: pulse } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.pulse;

  return (
    <PulseCard
      title={copy.careerTitle}
      live={pulse.live}
      href="/career"
      hrefLabel={copy.careerHrefLabel}
      stats={[
        { label: copy.careerVisa, value: pulse.live ? pulse.visaCount : "—" },
        { label: copy.careerPortfolio, value: pulse.live ? pulse.portfolioCount : "—" },
      ]}
    >
      {pulse.live ? pulse.lastVisaTitle ?? copy.careerEmpty : "—"}
    </PulseCard>
  );
}

"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { shownPulseStat } from "@/lib/dashboard/shown-pulse-stat";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function CareerPulseWidget() {
  const { career: pulse } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.pulse;
  const stats = [
    shownPulseStat(copy.careerVisa, pulse.visaCount, pulse.live),
    shownPulseStat(copy.careerPortfolio, pulse.portfolioCount, pulse.live),
  ].flatMap((item) => (item ? [item] : []));
  const invite =
    pulse.live && pulse.visaCount === 0
      ? { message: copy.careerEmpty, cta: copy.careerEmptyCta }
      : undefined;
  const portfolioNudge =
    pulse.live && pulse.visaCount > 0 && pulse.portfolioCount === 0 ? copy.portfolioEmpty : null;
  const detail = [pulse.lastVisaTitle, portfolioNudge].filter(Boolean).join(" ");

  return (
    <PulseCard
      title={copy.careerTitle}
      live={pulse.live}
      unavailableHint={copy.unavailable}
      href="/career"
      hrefLabel={copy.careerHrefLabel}
      stats={stats}
      invite={invite}
    >
      {pulse.live ? detail || null : copy.unavailable}
    </PulseCard>
  );
}

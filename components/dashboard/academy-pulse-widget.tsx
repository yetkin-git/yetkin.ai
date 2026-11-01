"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { shownPulseStat } from "@/lib/dashboard/shown-pulse-stat";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function AcademyPulseWidget() {
  const { academy: pulse } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.pulse;
  const stats = [
    shownPulseStat(copy.academyPurchase, pulse.purchasesCount, pulse.live),
    shownPulseStat(copy.academyCertificate, pulse.certificatesHeld, pulse.live),
  ].flatMap((item) => (item ? [item] : []));
  const invite =
    pulse.live && pulse.certificatesHeld === 0
      ? { message: copy.academyEmpty, cta: copy.academyEmptyCta }
      : undefined;

  return (
    <PulseCard
      title={copy.academyTitle}
      live={pulse.live}
      unavailableHint={copy.unavailable}
      href="/academy"
      hrefLabel={copy.academyHrefLabel}
      stats={stats}
      invite={invite}
    >
      {pulse.live ? pulse.lastCertificateTitle : copy.unavailable}
    </PulseCard>
  );
}

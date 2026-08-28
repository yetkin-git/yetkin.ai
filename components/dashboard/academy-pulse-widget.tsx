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
      href="/academy"
      hrefLabel={copy.academyHrefLabel}
      stats={[
        { label: copy.academyPurchase, value: pulse.live ? pulse.purchasesCount : "—" },
        { label: copy.academyCertificate, value: pulse.live ? pulse.certificatesHeld : "—" },
      ]}
    >
      {pulse.live ? pulse.lastCertificateTitle ?? copy.academyEmpty : "—"}
    </PulseCard>
  );
}

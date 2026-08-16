"use client";

import { PulseCard } from "@/components/ui/pulse-card";
import { IconBook } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function AcademyPulseWidget() {
  const { academy: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Akademi rozeti"
      live={pulse.live}
      href="/academy"
      hrefLabel="Akademi odasına git"
      stats={[
        { label: "Satın alma", value: pulse.purchasesCount, icon: <IconBook /> },
        { label: "Sertifika", value: pulse.certificatesHeld },
      ]}
    >
      {pulse.lastCertificateTitle ?? "Henüz mühür yok"}
    </PulseCard>
  );
}

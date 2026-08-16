"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconBriefcase } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function FreelancerPulseWidget() {
  const { freelancer: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Freelancer özeti"
      live={pulse.live}
      href="/freelancer"
      hrefLabel="Freelancer odasına git"
      stats={[
        { label: "Açık ilan", value: pulse.openJobsPosted, icon: <IconBriefcase /> },
        { label: "Fonlanmış (müşteri)", value: pulse.fundedAsClient },
        { label: "Fonlanmış (freelancer)", value: pulse.fundedAsFreelancer },
        { label: "Serbest bırakılan", value: pulse.releasedAsFreelancer },
      ]}
    >
      Kilitli emanet: {formatMinor(pulse.pendingEscrowMinor, pulse.currencyCode)}
    </PulseCard>
  );
}

"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconBuilding } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function KurumsalPulseWidget() {
  const { kurumsal: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title="Kurumsal özeti"
      live={pulse.live}
      href="/kurumsal"
      hrefLabel="Kurumsal odaya git"
      stats={[
        { label: "Şirket", value: pulse.companiesOwned, icon: <IconBuilding /> },
        { label: "Mühürlü ilan", value: pulse.sealedPostings },
        { label: "Ödüllü", value: pulse.awardedPostings },
        { label: "Serbest", value: pulse.releasedPostings },
      ]}
    >
      Kilitli emanet: {formatMinor(pulse.pendingEscrowMinor, pulse.currencyCode)}
    </PulseCard>
  );
}

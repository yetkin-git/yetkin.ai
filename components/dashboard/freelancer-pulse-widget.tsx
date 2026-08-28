"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { PulseCard } from "@/components/ui/pulse-card";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function FreelancerPulseWidget() {
  const { freelancer: pulse } = useDashboardPulse();
  const copy = SEN_VOICE.dashboard.pulse;
  const activeJobs = pulse.fundedAsClient + pulse.fundedAsFreelancer;

  return (
    <PulseCard
      title={copy.freelancerTitle}
      live={pulse.live}
      href="/freelancer"
      hrefLabel={copy.freelancerHrefLabel}
      stats={[
        { label: copy.freelancerOpen, value: pulse.live ? pulse.openJobsPosted : "—" },
        { label: copy.freelancerActive, value: pulse.live ? activeJobs : "—" },
      ]}
    >
      {pulse.live
        ? copy.freelancerEscrow(formatMinor(pulse.pendingEscrowMinor, pulse.currencyCode))
        : "—"}
    </PulseCard>
  );
}

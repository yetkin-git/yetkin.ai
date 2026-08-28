import { JobCreateForm } from "@/components/freelancer/job-create-form";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { Card } from "@/components/ui/card";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { EscrowHoldSteps } from "@/components/freelancer/escrow-hold-steps";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";

export default async function NewFreelancerJobPage() {
  await requirePageSession();
  const copy = SEN_VOICE.freelancer.create;
  return (
    <RoomFrame className="max-w-2xl">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/freelancer" variant="outline" size="sm">
            {copy.backCta}
          </LinkButton>
        }
      />
      <Card variant="featured">
        <JobCreateForm />
      </Card>
      <Card title={SEN_VOICE.freelancer.escrow.title} eyebrow={SEN_VOICE.freelancer.escrow.eyebrow}>
        <EscrowHoldSteps holdPercent={HOLD_BPS_DEFAULT / 100} />
      </Card>
    </RoomFrame>
  );
}

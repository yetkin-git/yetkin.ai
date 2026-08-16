import { Card } from "@/components/ui/card";
import { JobPostingForm } from "@/components/kurumsal/job-posting-form";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function NewCorporateJobPage() {
  await requirePageSession();
  const copy = SEN_VOICE.kurumsal.create;
  return (
    <RoomFrame className="max-w-2xl">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/kurumsal" variant="outline" size="sm">
            {copy.backCta}
          </LinkButton>
        }
      />
      <Card variant="featured">
        <JobPostingForm />
      </Card>
    </RoomFrame>
  );
}

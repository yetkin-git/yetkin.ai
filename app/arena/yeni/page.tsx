import { Card } from "@/components/ui/card";
import { TenderCreateForm } from "@/components/arena/tender-create-form";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function NewArenaTenderPage() {
  await requirePageSession();
  const copy = SEN_VOICE.arena.create;
  return (
    <RoomFrame className="max-w-2xl">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/arena" variant="outline" size="sm">
            {copy.backCta}
          </LinkButton>
        }
      />
      <Card variant="featured">
        <TenderCreateForm />
      </Card>
    </RoomFrame>
  );
}

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default function NotFound() {
  const copy = SEN_VOICE.public.notFound;
  return (
    <RoomFrame className="max-w-3xl px-6 py-16">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <Card variant="glass">
        <LinkButton href="/">{copy.homeCta}</LinkButton>
      </Card>
    </RoomFrame>
  );
}

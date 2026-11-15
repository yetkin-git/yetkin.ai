import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function CommerceDown() {
  const copy = SEN_VOICE.magazam;
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.downTitle} description={copy.downBody} />
      <Card>
        <p>{copy.downBody}</p>
      </Card>
    </>
  );
}

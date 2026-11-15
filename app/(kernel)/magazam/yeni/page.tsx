import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { StoreCreateForm } from "@/components/commerce/store-create-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamNewPage() {
  await requirePageSession();
  const copy = SEN_VOICE.magazam;
  return (
    <CommerceFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.newTitle} description={copy.newDescription} />
      <Card>
        <StoreCreateForm />
      </Card>
    </CommerceFrame>
  );
}

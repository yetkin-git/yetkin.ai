import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";

export default function KurumsalJobNotFound() {
  return (
    <RoomFrame className="max-w-3xl px-6 py-16">
      <PageHeader
        eyebrow="404"
        title="İlan bulunamadı"
        description="Bu başvuru adresi açık bir ilana bağlı değil. Kapalı veya süresi dolmuş ilanlar burada görünmez."
      />
      <Card variant="glass">
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/ilan">Açık ilanlara dön</LinkButton>
          <LinkButton href="/" variant="outline">
            Ana sayfa
          </LinkButton>
        </div>
      </Card>
    </RoomFrame>
  );
}

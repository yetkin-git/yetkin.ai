import type { Metadata } from "next";
import { TezgahWorkbench } from "@/components/tezgah/workbench";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.tezgah,
  robots: { index: true, follow: true },
});

export default function TezgahPage() {
  return (
    <RoomFrame>
      <PageHeader
        eyebrow="AI Tezgâh"
        title="Müşterine bugün verebileceğin çıktı"
        description="Ürün kartı, teklif ya da hibe ön notu. Misafire günde 1, ücretsiz kayıtla günde 3 üretim. Çıktıyı kopyala veya indir."
      />
      <TezgahWorkbench />
    </RoomFrame>
  );
}

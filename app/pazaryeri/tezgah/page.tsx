import { StallForm } from "@/components/pazaryeri/stall-form";
import { ProductList } from "@/components/pazaryeri/product-list";
import { loadSellerProducts } from "@/lib/pazaryeri/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { YETKINILAN_BRAND, yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function PazaryeriStallPage() {
  const session = await requirePageSession();
  const products = await loadSellerProducts(session.id);
  const copy = SEN_VOICE.pazaryeri.stall;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={YETKINILAN_BRAND}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href={yetkinIlanHref()} variant="outline" size="sm">
            {copy.backCta}
          </LinkButton>
        }
      />
      <Card variant="featured" title={copy.newTitle}>
        <StallForm />
      </Card>
      {products === null ? (
        <Card variant="glass">{copy.unbound}</Card>
      ) : (
        <ProductList products={products} />
      )}
    </RoomFrame>
  );
}

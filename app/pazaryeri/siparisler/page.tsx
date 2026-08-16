import { OrderList } from "@/components/pazaryeri/order-list";
import { loadOrdersForUser } from "@/lib/pazaryeri/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { YETKINILAN_BRAND, yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function PazaryeriOrdersPage() {
  const session = await requirePageSession();
  const orders = await loadOrdersForUser(session.id);
  const copy = SEN_VOICE.pazaryeri.orders;

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
      {orders === null ? (
        <Card variant="glass">{copy.unbound}</Card>
      ) : (
        <OrderList orders={orders} viewerUserId={session.id} />
      )}
    </RoomFrame>
  );
}

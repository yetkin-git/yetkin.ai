import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatMinor } from "@/lib/kernel/money/format";
import type { MarketplaceOrderRecord } from "@/lib/pazaryeri/types";
import { ConfirmDeliveryButton } from "@/components/pazaryeri/confirm-delivery-button";
import { CashPhaseBadges } from "@/components/pazaryeri/cash-phase-badges";
import { yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";
import { pazaryeriOrderStatusLabel } from "@/lib/copy/status-labels";

export function OrderList({
  orders,
  viewerUserId,
}: {
  orders: MarketplaceOrderRecord[];
  viewerUserId: string;
}) {
  const copy = PAZARYERI_SEN.orders;
  if (orders.length === 0) {
    return <Card variant="glass">{copy.empty}</Card>;
  }
  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const isBuyer = order.userId === viewerUserId;
        return (
          <li key={order.id}>
            <Card title={order.productTitle}>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {pazaryeriOrderStatusLabel(order.status)}
              </p>
              <div className="mt-2">
                <CashPhaseBadges status={order.status} />
              </div>
              <p className="mt-2">
                {isBuyer ? copy.buy : copy.sell} · {formatMinor(order.amountMinor, order.currencyCode)}
              </p>
              {isBuyer && order.status === "AWAITING_DELIVERY" ? (
                <div className="mt-3">
                  <ConfirmDeliveryButton orderId={order.id} />
                </div>
              ) : null}
              <Link
                href={yetkinIlanHref()}
                className="mt-2 inline-block text-[var(--safir)] hover:underline"
              >
                {copy.backCta}
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

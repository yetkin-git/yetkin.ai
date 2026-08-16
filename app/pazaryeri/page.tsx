import { ProductList } from "@/components/pazaryeri/product-list";
import { DualCashPathOverview } from "@/components/pazaryeri/dual-cash-path-steps";
import { loadListedProducts } from "@/lib/pazaryeri/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { StatGrid } from "@/components/ui/stat-grid";
import { IconLock, IconStore, IconCheck } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { YETKINILAN_BRAND, yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";

export default async function PazaryeriPage() {
  const products = await loadListedProducts();
  const live = products ?? [];
  const copy = SEN_VOICE.pazaryeri.catalog;
  const stats = SEN_VOICE.pazaryeri.stats;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={YETKINILAN_BRAND}
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <LinkButton href={yetkinIlanHref("/tezgah")} variant="secondary">
              {copy.stallCta}
            </LinkButton>
            <LinkButton href={yetkinIlanHref("/siparisler")} variant="outline">
              {copy.ordersCta}
            </LinkButton>
          </>
        }
      />
      <StatGrid
        columns={3}
        items={[
          { label: stats.vitrineLabel, value: live.length, icon: <IconStore /> },
          {
            label: stats.instantLabel,
            value: stats.instantValue,
            hint: stats.instantHint,
            icon: <IconCheck />,
          },
          {
            label: stats.escrowLabel,
            value: stats.escrowValue,
            hint: stats.escrowHint,
            icon: <IconLock />,
          },
        ]}
      />
      <DualCashPathOverview
        lockMinutes={PRICE_LOCK_GRACE_MINUTES}
        holdPercent={HOLD_BPS_DEFAULT / 100}
      />
      {products === null ? <Badge tone="amber">{copy.unbound}</Badge> : null}
      {products !== null && live.length > 0 ? (
        <Badge tone="emerald">{copy.live(live.length)}</Badge>
      ) : null}
      <ProductList products={live} />
    </RoomFrame>
  );
}

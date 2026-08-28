import { formatMinor } from "@/lib/kernel/money/format";
import type { MarketplaceProductRecord } from "@/lib/pazaryeri/types";
import { categoryLabel, isAssetCategory, isProductDoped } from "@/lib/pazaryeri/category";
import { PAZARYERI_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconStore } from "@/components/ui/icons";
import { yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import type { BadgeTone } from "@/components/ui/badge";
import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";
import { pazaryeriKindLockLabel } from "@/archived/lib/copy/status-labels";

function categoryTone(category: MarketplaceProductRecord["category"]): BadgeTone {
  switch (category) {
    case "REAL_ESTATE":
      return "gold";
    case "VEHICLE":
      return "amber";
    case "SERVICE":
      return "violet";
    default:
      return "safir";
  }
}

function lockLabel(product: MarketplaceProductRecord): string {
  const copy = PAZARYERI_SEN.list;
  if (isAssetCategory(product.category)) {
    return copy.lockVitrine;
  }
  if (isProductDoped(product)) {
    return copy.lockDoped;
  }
  if (product.isOfferAllowed) {
    return copy.lockOffer;
  }
  return pazaryeriKindLockLabel(product.kind);
}

const CITIZEN_SHOWCASE = PAZARYERI_SHOWCASE.filter(
  (item) => item.badge === "Dijital ürün" || item.badge === "Hizmet",
);

export function ProductList({ products }: { products: MarketplaceProductRecord[] }) {
  const copy = PAZARYERI_SEN.list;
  if (products.length === 0) {
    return (
      <Vitrine hint={copy.emptyHint}>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CITIZEN_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                price={item.price}
                badge={item.badge}
                badgeTone={item.badge === "Hizmet" ? "violet" : "safir"}
                meta={item.meta}
                href={yetkinIlanHref("/tezgah")}
                cta={copy.stallCta}
                icon={<IconStore />}
                lockLabel={item.badge === "Hizmet" ? copy.lockEscrow : copy.lockInstant}
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ListingCard
            title={product.title}
            summary={product.summary}
            price={formatMinor(product.amountMinor, product.currencyCode)}
            badge={categoryLabel(product.category)}
            badgeTone={categoryTone(product.category)}
            href={yetkinIlanHref(`/${product.slug}`)}
            cta={copy.openCta}
            icon={<IconStore />}
            lockLabel={lockLabel(product)}
            rank={isProductDoped(product) ? 1 : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

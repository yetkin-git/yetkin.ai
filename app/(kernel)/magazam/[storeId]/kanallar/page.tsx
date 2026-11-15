import { notFound } from "next/navigation";
import { ChannelDesk } from "@/components/commerce/channel-desk";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerChannel, loadOwnerProducts, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamChannelsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const session = await requirePageSession();
  const { storeId } = await params;
  const store = await loadOwnerStore(session.id, storeId);
  if (store.kind === "missing") {
    notFound();
  }
  if (store.kind === "down") {
    return (
      <CommerceFrame>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const [products, trendyol, hepsiburada] = await Promise.all([
    loadOwnerProducts(session.id, storeId),
    loadOwnerChannel(session.id, storeId, "TRENDYOL"),
    loadOwnerChannel(session.id, storeId, "HEPSIBURADA"),
  ]);
  if (products.kind === "missing" || trendyol.kind === "missing" || hepsiburada.kind === "missing") {
    notFound();
  }
  if (products.kind === "down" || trendyol.kind === "down" || hepsiburada.kind === "down") {
    return (
      <CommerceFrame storeId={store.value.id}>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const copy = SEN_VOICE.magazam;
  const variants = products.value.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      label: `${product.title} · ${variant.sku}`,
      mappable: variant.status === "ACTIVE" && Boolean(variant.barcode) && variant.amountMinor != null,
    })),
  );

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader eyebrow={copy.eyebrow} title={copy.channelsTitle} description={copy.channelsDescription} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelDesk
          storeId={store.value.id}
          channel="TRENDYOL"
          title={copy.trendyol}
          credential={trendyol.value.credential}
          listings={trendyol.value.listings}
          variants={variants}
        />
        <ChannelDesk
          storeId={store.value.id}
          channel="HEPSIBURADA"
          title={copy.hepsiburada}
          credential={hepsiburada.value.credential}
          listings={hepsiburada.value.listings}
          variants={variants}
        />
      </div>
    </CommerceFrame>
  );
}

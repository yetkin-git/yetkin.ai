import { notFound } from "next/navigation";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { ProductEditor } from "@/components/commerce/product-editor";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerProduct, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamProductPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
  const session = await requirePageSession();
  const { storeId, productId } = await params;
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
  const product = await loadOwnerProduct(session.id, storeId, productId);
  if (product.kind === "missing") {
    notFound();
  }
  if (product.kind === "down") {
    return (
      <CommerceFrame storeId={store.value.id}>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const copy = SEN_VOICE.magazam;
  const stamp = `${product.value.updatedAt}:${product.value.variants.map((variant) => `${variant.id}:${variant.updatedAt}:${variant.onHandQty}:${variant.status}`).join("|")}`;

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={product.value.title}
        description={copy.productsDescription}
        actions={
          <>
            <CommerceStatusBadge group="product" value={product.value.status} />
            <CommerceStatusBadge group="source" value={product.value.source} />
          </>
        }
      />
      <ProductEditor
        key={stamp}
        storeId={store.value.id}
        storeActive={store.value.status === "ACTIVE"}
        product={product.value}
      />
    </CommerceFrame>
  );
}

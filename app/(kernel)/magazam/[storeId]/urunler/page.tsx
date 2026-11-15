import Link from "next/link";
import { notFound } from "next/navigation";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { cockpitHref } from "@/components/commerce/href";
import { ProductCreateForm } from "@/components/commerce/product-create-form";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerProducts, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { formatMinor } from "@/lib/kernel/money/format";

export default async function MagazamProductsPage({ params }: { params: Promise<{ storeId: string }> }) {
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
  const products = await loadOwnerProducts(session.id, storeId);
  if (products.kind === "missing") {
    notFound();
  }
  if (products.kind === "down") {
    return (
      <CommerceFrame storeId={store.value.id}>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const copy = SEN_VOICE.magazam;

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader eyebrow={copy.eyebrow} title={copy.productsTitle} description={copy.productsDescription} />
      {products.value.length === 0 ? (
        <Card>
          <p>{copy.productsEmpty}</p>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {products.value.map((product) => (
            <li key={product.id}>
              <Link
                href={cockpitHref(`/magazam/${store.value.id}/urunler/${product.id}`)}
                className="block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{product.title}</span>
                  <CommerceStatusBadge group="product" value={product.status} />
                  <CommerceStatusBadge group="source" value={product.source} />
                </span>
                <span className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
                  {product.variants.map((variant) => (
                    <span key={variant.id}>
                      {variant.sku}
                      {" · "}
                      {variant.amountMinor == null ? "—" : formatMinor(variant.amountMinor, "TRY")}
                      {" · "}
                      {copy.sellable} {variant.sellableQty}
                      {" · "}
                      {copy.status.variant[variant.status]}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Card title={copy.addProduct}>
        <ProductCreateForm storeId={store.value.id} storeActive={store.value.status === "ACTIVE"} />
      </Card>
    </CommerceFrame>
  );
}

import { notFound } from "next/navigation";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { InventoryForm } from "@/components/commerce/inventory-form";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { formatCockpitWhen } from "@/components/commerce/when";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerInventory, loadOwnerProducts, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamStockPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ variantId?: string }>;
}) {
  const session = await requirePageSession();
  const { storeId } = await params;
  const query = await searchParams;
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
  const [products, ledger] = await Promise.all([
    loadOwnerProducts(session.id, storeId),
    loadOwnerInventory(session.id, storeId),
  ]);
  if (products.kind === "missing" || ledger.kind === "missing") {
    notFound();
  }
  if (products.kind === "down" || ledger.kind === "down") {
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
    })),
  );

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader eyebrow={copy.eyebrow} title={copy.stockTitle} description={copy.stockDescription} />
      <Card title={copy.postMovement}>
        <InventoryForm storeId={store.value.id} variants={variants} initialVariantId={query.variantId ?? ""} />
      </Card>
      <Card title={copy.ledger}>
        {ledger.value.length === 0 ? (
          <p>{copy.ledgerEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="py-2 pr-3 font-medium">{copy.when}</th>
                  <th className="py-2 pr-3 font-medium">{copy.sku}</th>
                  <th className="py-2 pr-3 font-medium">{copy.movementType}</th>
                  <th className="py-2 pr-3 font-medium">{copy.direction}</th>
                  <th className="py-2 pr-3 font-medium">{copy.quantity}</th>
                  <th className="py-2 pr-3 font-medium">{copy.onHand}</th>
                  <th className="py-2 font-medium">{copy.note}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.value.map((movement) => (
                  <tr key={movement.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3">{formatCockpitWhen(movement.createdAt)}</td>
                    <td className="py-2 pr-3 font-mono">{movement.variant.sku}</td>
                    <td className="py-2 pr-3">
                      <CommerceStatusBadge group="movement" value={movement.type} />
                    </td>
                    <td className="py-2 pr-3">
                      <CommerceStatusBadge group="direction" value={movement.direction} />
                    </td>
                    <td className="py-2 pr-3">{movement.quantity}</td>
                    <td className="py-2 pr-3">{movement.onHandAfter}</td>
                    <td className="py-2">{movement.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </CommerceFrame>
  );
}

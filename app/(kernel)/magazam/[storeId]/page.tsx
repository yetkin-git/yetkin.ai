import { notFound } from "next/navigation";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { cockpitHref } from "@/components/commerce/href";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { StoreIdentityForm } from "@/components/commerce/store-identity-form";
import { StorefrontBridge } from "@/components/commerce/storefront-bridge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerLicense, loadOwnerProducts, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { productCounts } from "@/lib/commerce/cockpit-types";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamHomePage({ params }: { params: Promise<{ storeId: string }> }) {
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
  const [products, license] = await Promise.all([
    loadOwnerProducts(session.id, storeId),
    loadOwnerLicense(session.id, storeId),
  ]);
  if (products.kind === "missing" || license.kind === "missing") {
    notFound();
  }
  if (products.kind === "down" || license.kind === "down") {
    return (
      <CommerceFrame storeId={store.value.id}>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const copy = SEN_VOICE.magazam;
  const counts = productCounts(products.value);
  const licenseLabel =
    license.value.phase === "open"
      ? copy.licenseOpen
      : license.value.phase === "pending"
        ? copy.licensePending
        : license.value.phase === "closed"
          ? copy.licenseClosed
          : copy.licenseAbsent;
  const storefrontPath = `/magaza/${store.value.slug}`;
  const readiness = [
    { label: copy.readinessStore, ready: store.value.status === "ACTIVE" },
    { label: copy.readinessProduct, ready: counts.active > 0 },
    {
      label: copy.readinessVariant,
      ready: products.value.some((product) =>
        product.variants.some((variant) => variant.status === "ACTIVE"),
      ),
    },
  ];

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={store.value.name}
        description={copy.homeDescription}
        actions={<CommerceStatusBadge group="store" value={store.value.status} />}
      />
      <StatGrid
        columns={3}
        items={[
          { label: copy.countDraft, value: String(counts.draft) },
          { label: copy.countActive, value: String(counts.active) },
          { label: copy.countArchived, value: String(counts.archived) },
          { label: copy.countTezgah, value: String(counts.tezgah) },
          { label: copy.licenseChip, value: licenseLabel },
        ]}
      />
      <section
        className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
        aria-label={copy.readinessTitle}
      >
        <p className="text-sm font-semibold">{copy.readinessTitle}</p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {readiness.map((step, index) => (
            <li
              key={step.label}
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {index + 1}. {step.label}
              </span>
              <span className={step.ready ? "text-[var(--emerald)]" : "text-[var(--muted)]"}>
                {step.ready ? copy.readinessReady : copy.readinessWait}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={copy.identityTitle}>
          <StoreIdentityForm key={`${store.value.updatedAt}:${store.value.status}`} store={store.value} />
        </Card>
        <Card title={copy.storefrontTitle}>
          <StorefrontBridge path={storefrontPath} live={store.value.status === "ACTIVE"} />
          <LinkButton href={cockpitHref(`/magazam/${store.value.id}/lisans`)} variant="outline" className="mt-4">
            {licenseLabel}
          </LinkButton>
        </Card>
      </div>
    </CommerceFrame>
  );
}

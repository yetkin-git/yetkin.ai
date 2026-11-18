import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { EcommerceOsCockpit } from "@/components/commerce/os-cockpit";
import { PageHeader } from "@/components/ui/page-header";
import { readEcommerceLicenseBand } from "@/lib/commerce/os-license-band";
import { loadOsCockpit } from "@/lib/commerce/os-load";
import { parseOsTab } from "@/lib/commerce/os-rules";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function EcommerceOsPage({
  searchParams,
}: {
  searchParams: Promise<{ sekme?: string }>;
}) {
  const session = await requirePageSession();
  const params = await searchParams;
  const loaded = await loadOsCockpit(session.id);
  if (loaded.kind !== "ok") {
    return (
      <CommerceFrame>
        <CommerceDown />
      </CommerceFrame>
    );
  }

  const license = await readEcommerceLicenseBand(session.id, loaded.view.stores);

  return (
    <CommerceFrame>
      <PageHeader
        compact
        eyebrow="Yetkin Commerce"
        title="E-Ticaret"
        description="Stok, kanal ve sipariş kokpiti"
      />
      <EcommerceOsCockpit
        initialTab={parseOsTab(params.sekme)}
        view={loaded.view}
        license={license}
      />
    </CommerceFrame>
  );
}

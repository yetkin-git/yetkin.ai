import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { EcommerceOsCockpit } from "@/components/commerce/os-cockpit";
import { PageHeader } from "@/components/ui/page-header";
import { readEcommerceLicenseBand } from "@/lib/commerce/os-license-band";
import { loadOsCockpit } from "@/lib/commerce/os-load";
import { parseOsTab, readPoolPrefill } from "@/lib/commerce/os-rules";
import { parseBridgeKaynak } from "@/lib/kernel/contextual-bridge-params";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function EcommerceOsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePageSession();
  const params = await searchParams;
  const rawStore = params.magaza;
  const loaded = await loadOsCockpit(session.id, Array.isArray(rawStore) ? rawStore[0] : rawStore);
  if (loaded.kind !== "ok") {
    return (
      <CommerceFrame>
        <CommerceDown />
      </CommerceFrame>
    );
  }

  const license = await readEcommerceLicenseBand(session.id, loaded.view.stores);
  const rawTab = params.sekme;
  const prefill = readPoolPrefill({
    get: (name) => {
      const value = params[name];
      return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
    },
  });

  return (
    <CommerceFrame>
      <PageHeader
        compact
        eyebrow="Yetkin Commerce"
        title="E-Ticaret"
        description="Stok, kanal ve sipariş kokpiti"
      />
      <EcommerceOsCockpit
        initialTab={parseOsTab(Array.isArray(rawTab) ? rawTab[0] : rawTab)}
        prefill={prefill}
        view={loaded.view}
        license={license}
        bridgeCameFrom={parseBridgeKaynak(
          Array.isArray(params.kaynak) ? params.kaynak[0] : params.kaynak,
        )}
      />
    </CommerceFrame>
  );
}

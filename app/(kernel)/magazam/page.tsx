import Link from "next/link";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { cockpitHref } from "@/components/commerce/href";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerStores } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamListPage() {
  const session = await requirePageSession();
  const loaded = await loadOwnerStores(session.id);
  const copy = SEN_VOICE.magazam;
  if (loaded.kind !== "ok") {
    return (
      <CommerceFrame>
        <CommerceDown />
      </CommerceFrame>
    );
  }

  return (
    <CommerceFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.listTitle}
        description={copy.listDescription}
        actions={<LinkButton href="/magazam/yeni">{copy.openStore}</LinkButton>}
      />
      {loaded.value.length === 0 ? (
        <Card title={copy.emptyTitle}>
          <p>{copy.emptyBody}</p>
          <LinkButton href="/magazam/yeni" className="mt-4">
            {copy.openStore}
          </LinkButton>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {loaded.value.map((store) => (
            <li key={store.id}>
              <Link
                href={cockpitHref(`/magazam/${store.id}`)}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <span>
                  <span className="block font-semibold">{store.name}</span>
                  <span className="mt-1 block font-mono text-xs text-[var(--muted)]">/magaza/{store.slug}</span>
                </span>
                <CommerceStatusBadge group="store" value={store.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CommerceFrame>
  );
}

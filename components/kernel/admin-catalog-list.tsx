import { AdminCatalogAmountForm } from "@/components/kernel/admin-catalog-amount-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  ADMIN_EMPTY_LABEL,
  ADMIN_UNSET_LABEL,
  catalogModuleLabel,
  catalogUnitTypeLabel,
  formatCatalogBand,
  formatCatalogValue,
  groupCatalogEntriesByModule,
  isHoldBpsInCodeBand,
} from "@/lib/kernel/admin/display";
import type { SealedCatalogEntry } from "@/lib/kernel/admin/types";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
} from "@/lib/kernel/admin/types";
import { ACADEMY_CURRICULUM_REVISIONS_PATH } from "@/lib/academy/curriculum-revision-paths";

function CatalogEntryTable({ entries }: { entries: SealedCatalogEntry[] }) {
  const copy = ADMIN_SEN;
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[48rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <th className="px-4 py-3">Birim</th>
            <th className="px-4 py-3">Tür</th>
            <th className="px-4 py-3 text-right">Tutar</th>
            <th className="px-4 py-3 text-right">Taban → tavan</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3 text-right">Fiyat değiştir</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const bpsOutOfBand =
              entry.unitType === "BPS" && !isHoldBpsInCodeBand(entry.amountMinor);
            return (
              <tr key={entry.id} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-mono text-[13px] font-medium text-[var(--foreground)]">
                    {entry.unitKey}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {entry.description?.trim() || ADMIN_UNSET_LABEL}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={entry.unitType === "BPS" ? "violet" : "safir"}>
                    {catalogUnitTypeLabel(entry.unitType)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--foreground)]">
                  {formatCatalogValue(entry.unitType, entry.amountMinor, entry.currencyCode)}
                  {bpsOutOfBand ? (
                    <span className="mt-1 block">
                      <Badge tone="rose">{copy.statusOutOfBand}</Badge>
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--muted)]">
                  {formatCatalogBand(entry)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={entry.isActive ? "emerald" : "neutral"}>
                    {entry.isActive ? copy.statusActive : copy.statusInactive}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminCatalogAmountForm
                    entryId={entry.id}
                    unitKey={entry.unitKey}
                    unitType={entry.unitType}
                    initialAmountMinor={entry.amountMinor}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Boş katalog — denetim odaları birincil; panel ghost. */
function EmptyCatalogActions() {
  const copy = ADMIN_SEN;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <LinkButton href={ACADEMY_CURRICULUM_REVISIONS_PATH} variant="primary" size="sm">
        {copy.revisionsCta}
      </LinkButton>
      <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="secondary" size="sm">
        {copy.academyCta}
      </LinkButton>
      <LinkButton href={ADMIN_FREELANCER_SHELTER_PATH} variant="outline" size="sm">
        {copy.freelancerCta}
      </LinkButton>
      <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size="sm">
        {copy.dashboardCta}
      </LinkButton>
    </div>
  );
}

export function AdminCatalogList({
  entries,
  showEmptyActions = true,
}: {
  entries: SealedCatalogEntry[];
  /** Soft yüklemede üst CTA zaten varsa çift şerit basılmaz. */
  showEmptyActions?: boolean;
}) {
  const groups = groupCatalogEntriesByModule(entries);
  const copy = ADMIN_SEN;

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card
          title={copy.catalogTitle}
          eyebrow={copy.catalogEyebrow}
          bodyClassName="text-[var(--foreground)]"
        >
          <p className="mb-4 text-sm text-[var(--muted)]">{copy.catalogIntro}</p>
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
            {ADMIN_EMPTY_LABEL}. {copy.emptyBody}
          </p>
          {showEmptyActions ? <EmptyCatalogActions /> : null}
        </Card>
      ) : (
        groups.map((group) => (
          <Card
            key={group.moduleKey}
            title={catalogModuleLabel(group.moduleKey)}
            eyebrow={group.moduleKey}
            action={<Badge tone="neutral">{copy.unitCount(group.entries.length)}</Badge>}
            bodyClassName="text-[var(--foreground)]"
          >
            <p className="mb-4 text-sm text-[var(--muted)]">{copy.catalogIntro}</p>
            <CatalogEntryTable entries={group.entries} />
          </Card>
        ))
      )}
    </div>
  );
}

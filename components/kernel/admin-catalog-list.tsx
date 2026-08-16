import { AdminCatalogAmountForm } from "@/components/kernel/admin-catalog-amount-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

function CatalogEntryTable({ entries }: { entries: SealedCatalogEntry[] }) {
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
                      <Badge tone="rose">Kod tavanı dışı</Badge>
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--muted)]">
                  {formatCatalogBand(entry)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={entry.isActive ? "emerald" : "amber"}>
                    {entry.isActive ? "Aktif" : "Kapalı"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminCatalogAmountForm
                    entryId={entry.id}
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

export function AdminCatalogList({ entries }: { entries: SealedCatalogEntry[] }) {
  const groups = groupCatalogEntriesByModule(entries);

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card
          title="Fiyat kataloğu"
          eyebrow="PriceCatalogEntry sicili"
          bodyClassName="text-[var(--foreground)]"
        >
          <p className="mb-4 text-sm text-[var(--muted)]">
            Satırlar PriceCatalogEntry kayıtlarıdır. amountMinor tamsayıdır; Super Admin günceller.
          </p>
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
            {ADMIN_EMPTY_LABEL}. Ops tohumu uygulanınca birimler burada durur. Uydurma fiyat
            basılmaz.
          </p>
        </Card>
      ) : (
        groups.map((group) => (
          <Card
            key={group.moduleKey}
            title={catalogModuleLabel(group.moduleKey)}
            eyebrow={group.moduleKey}
            action={<Badge tone="neutral">{group.entries.length} birim</Badge>}
            bodyClassName="text-[var(--foreground)]"
          >
            <p className="mb-4 text-sm text-[var(--muted)]">
              Satırlar PriceCatalogEntry kayıtlarıdır. amountMinor tamsayıdır; Super Admin günceller.
            </p>
            <CatalogEntryTable entries={group.entries} />
          </Card>
        ))
      )}
    </div>
  );
}

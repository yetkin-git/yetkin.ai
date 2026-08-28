import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { ADMIN_UNSET_LABEL, formatCatalogValue } from "@/lib/kernel/admin/display";
import type { SealedPriceDecision } from "@/lib/kernel/admin/types";
import { isPriceDecisionReasonCode } from "@/lib/kernel/pricing/price-decision-codes";

function formatDecisionAt(value: Date): string {
  return value.toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function reasonLabel(code: string): string {
  if (isPriceDecisionReasonCode(code)) {
    return ADMIN_SEN.reasonCodes[code];
  }
  return code;
}

export function AdminPriceDecisionLedger({
  decisions,
}: {
  decisions: SealedPriceDecision[];
}) {
  const copy = ADMIN_SEN;
  return (
    <Card
      title={copy.ledgerTitle}
      eyebrow={copy.ledgerEyebrow}
      action={<Badge tone="neutral">{copy.unitCount(decisions.length)}</Badge>}
      bodyClassName="text-[var(--foreground)]"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.ledgerIntro}</p>
      {decisions.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
          {copy.ledgerEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                <th className="px-4 py-3">Birim</th>
                <th className="px-4 py-3">Gerekçe</th>
                <th className="px-4 py-3 text-right">{copy.ledgerFromTo}</th>
                <th className="px-4 py-3 text-right">Zaman</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[13px] font-medium text-[var(--foreground)]">
                      {row.unitKey}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">{row.moduleKey}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="safir">{reasonLabel(row.reasonCode)}</Badge>
                    <p className="mt-1 text-[12px] text-[var(--muted)]">
                      {row.reason.trim() || ADMIN_UNSET_LABEL}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">
                    {formatCatalogValue(row.unitType, row.oldMinor, row.currencyCode)}
                    {" → "}
                    {formatCatalogValue(row.unitType, row.newMinor, row.currencyCode)}
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] tabular-nums text-[var(--muted)]">
                    {formatDecisionAt(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

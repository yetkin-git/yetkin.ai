import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import type { AcademySaleGateRow } from "@/lib/academy/sale-gate-board";

export function AdminSaleGateStrip({ rows }: { rows: readonly AcademySaleGateRow[] }) {
  const copy = ADMIN_SEN;
  if (rows.length === 0) {
    return null;
  }
  return (
    <Card title={copy.saleGateTitle} eyebrow={copy.catalogEyebrow} bodyClassName="text-[var(--foreground)]">
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.saleGateIntro}</p>
      <ul className="grid gap-3">
        {rows.map((row) => (
          <li
            key={row.slug}
            data-admin-sale-gate={row.slug}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2"
          >
            <span className="min-w-[12rem] font-medium">{row.title}</span>
            {row.isFlagship ? <Badge tone="emerald">Öne çıkan</Badge> : null}
            <span className="font-mono text-xs text-[var(--muted)]">{row.slug}</span>
            {row.nextAction ? (
              <span className="text-xs text-[var(--muted)]">Sonraki iş: {row.nextAction}</span>
            ) : null}
            {row.gaps.length === 0 ? (
              <Badge tone="emerald">{copy.saleGateOk}</Badge>
            ) : (
              row.gaps.map((gap) => (
                <Badge key={gap} tone={gap === "Ses ve metin" ? "amber" : "rose"}>
                  {copy.saleGateGap(gap)}
                </Badge>
              ))
            )}
            <Badge tone={row.tier === "sale" ? "emerald" : row.tier === "showcase" ? "amber" : "rose"}>
              {row.tierDetail}
            </Badge>
            {row.mediaDetail ? (
              <span className="text-xs text-[var(--muted)]">{row.mediaDetail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

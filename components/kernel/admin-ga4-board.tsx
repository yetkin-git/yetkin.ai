import { Card } from "@/components/ui/card";
import { StatGrid } from "@/components/ui/stat-grid";
import { IconPulse } from "@/components/ui/icons";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { GA4_BREAKDOWN_LIMIT, type AdminGa4Board, type Ga4DimensionRow } from "@/lib/kernel/telemetry/ga4-admin-types";
import { formatGa4Count, labelGa4Channel, labelGa4Country } from "@/lib/kernel/telemetry/ga4-display";

const RANGE_LABEL = {
  today: ADMIN_SEN.funnel.rangeToday,
  "7d": ADMIN_SEN.funnel.range7d,
  "30d": ADMIN_SEN.funnel.range30d,
} as const;

function Breakdown({
  title,
  rows,
  empty,
  labelFor,
}: {
  title: string;
  rows: readonly Ga4DimensionRow[];
  empty: string;
  labelFor: (label: string) => string;
}) {
  const copy = ADMIN_SEN.ga4;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--foreground)]">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-[var(--foreground)]">{labelFor(row.label)}</span>
              <span className="shrink-0 tabular-nums text-[var(--muted)]">
                {formatGa4Count(row.sessions)} {copy.sessionUnit}
              </span>
            </li>
          ))}
        </ul>
      )}
      {rows.length >= GA4_BREAKDOWN_LIMIT ? (
        <p className="mt-2 text-xs text-[var(--muted)]">{copy.truncated}</p>
      ) : null}
    </div>
  );
}

/**
 * Huni kartının altında durur. Sayı yalnız `access: ok` iken basılır.
 * Kapı `loadAdminGa4Board` içindeki `isSuperAdminActor` denetidir.
 */
export function AdminGa4Board({
  board,
  pending = false,
}: {
  board: AdminGa4Board | null;
  pending?: boolean;
}) {
  const copy = ADMIN_SEN.ga4;
  const live = board?.access === "ok" ? board : null;

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} bodyClassName="text-[var(--foreground)]">
      <p className="mb-3 text-sm text-[var(--muted)]">{copy.intro}</p>
      {pending ? (
        <p className="text-sm text-[var(--muted)]">{copy.pending}</p>
      ) : live == null ? (
        <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p>
      ) : (
        <>
          <StatGrid
            columns={2}
            items={[
              {
                label: copy.realtimeLabel,
                value:
                  live.realtime.access === "ok" ? (
                    formatGa4Count(live.realtime.value.activeUsers)
                  ) : (
                    <span className="text-base font-normal text-[var(--muted)]">{copy.unavailable}</span>
                  ),
                hint: live.realtime.access === "ok" ? copy.realtimeHint : undefined,
                icon: <IconPulse />,
              },
            ]}
          />
          {live.traffic.access === "ok" ? (
            <>
              <p className="mb-3 mt-4 text-xs text-[var(--muted)]">
                {copy.windowHint(RANGE_LABEL[live.range], live.fromYmd, live.toYmd)} {copy.lagHint}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Breakdown
                  title={copy.channelTitle}
                  rows={live.traffic.value.channels}
                  empty={copy.channelEmpty}
                  labelFor={labelGa4Channel}
                />
                <Breakdown
                  title={copy.countryTitle}
                  rows={live.traffic.value.countries}
                  empty={copy.countryEmpty}
                  labelFor={labelGa4Country}
                />
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">{copy.unavailable}</p>
          )}
        </>
      )}
    </Card>
  );
}

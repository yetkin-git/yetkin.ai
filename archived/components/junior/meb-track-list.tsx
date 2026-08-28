import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMinor } from "@/lib/kernel/money/format";
import type { JuniorAllowanceRecord } from "@/lib/junior/types";
import type { MebTrack } from "@/lib/junior/meb-catalog";
import { GuardianShieldBanner } from "@/components/theme/room-chrome";

export function MebTrackList({
  tracks,
  allowance,
}: {
  tracks: MebTrack[];
  allowance: JuniorAllowanceRecord | null;
}) {
  return (
    <div className="space-y-4">
      {allowance ? (
        <Card variant="featured" title="Harçlık cüzdanı" bodyClassName="text-[var(--foreground)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight">
              {formatMinor(allowance.amountMinor, allowance.currencyCode)}
            </p>
            <Badge tone="gold">Oyun jetonu değil · harçlık</Badge>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Tavan {formatMinor(allowance.weeklyCapMinor, allowance.currencyCode)} · yetişkin cüzdanı
            değildir
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[var(--emerald)] to-[var(--safir)]" />
          </div>
        </Card>
      ) : (
        <GuardianShieldBanner>Harçlık ebeveyn onayı ve tavan sonrası açılır.</GuardianShieldBanner>
      )}
      {tracks.length === 0 ? (
        <Card variant="glass">Bu yaş için MEB izi yok.</Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {tracks.map((track) => (
            <li key={track.key}>
              <Card variant="glass" title={track.title} bodyClassName="text-[var(--foreground)]">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={track.band === "ortaokul" ? "emerald" : "amber"}>{track.band}</Badge>
                  <Badge tone="violet">İz açık</Badge>
                </div>
                <p className="mt-2">{track.summary}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full w-full rounded-full bg-[var(--safir)]" />
                </div>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  {track.minAge}–{track.maxAge} yaş bandı
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

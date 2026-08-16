import { TenderBoard } from "@/components/arena/tender-board";
import { loadOpenTenders } from "@/lib/arena/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { StatGrid } from "@/components/ui/stat-grid";
import { IconTrophy, IconLock, IconBolt } from "@/components/ui/icons";
import { PrizePoolHero } from "@/components/theme/room-chrome";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function ArenaPage() {
  const tenders = await loadOpenTenders();
  const live = tenders ?? [];
  const poolMinor = live.reduce((sum, tender) => sum + tender.prizePoolMinor, 0);
  const poolLabel = formatMinor(poolMinor, live[0]?.currencyCode ?? SETTLEMENT_CURRENCY);
  const copy = SEN_VOICE.arena;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/arena/yeni" className="shadow-[0_0_24px_rgba(245,185,66,0.35)]">
            {copy.openCta}
          </LinkButton>
        }
      />
      <PrizePoolHero
        amount={poolLabel}
        live={live.length > 0}
        hint={live.length > 0 ? copy.liveHint(live.length) : copy.emptyHint}
      />
      <StatGrid
        columns={3}
        items={[
          { label: copy.stats.openLabel, value: live.length, icon: <IconTrophy /> },
          { label: copy.stats.poolLabel, value: copy.stats.poolValue, icon: <IconLock /> },
          {
            label: copy.stats.trackLabel,
            value: copy.stats.trackValue,
            hint: copy.stats.trackHint,
            icon: <IconBolt />,
          },
        ]}
      />
      {tenders === null ? <Badge tone="amber">{copy.unbound}</Badge> : null}
      <TenderBoard tenders={live} />
    </RoomFrame>
  );
}

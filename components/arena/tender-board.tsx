import type { ReactNode } from "react";
import { formatMinor } from "@/lib/kernel/money/format";
import type { ArenaTenderRecord } from "@/lib/arena/types";
import { ARENA_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconTrophy } from "@/components/ui/icons";
import { arenaTenderRoundLabel, arenaTenderStatusLabel } from "@/lib/copy/status-labels";

function PodiumList({ children }: { children: ReactNode }) {
  return <ul className="arena-podium grid gap-4 md:grid-cols-3">{children}</ul>;
}

export function TenderBoard({ tenders }: { tenders: ArenaTenderRecord[] }) {
  if (tenders.length === 0) {
    return (
      <Vitrine hint="Açık ihale yok. Ödüllü çağrılar vitrin düzenidir; ödül havuzu ancak gerçek emanette kilitlenir.">
        <PodiumList>
          {ARENA_SHOWCASE.map((item, index) => (
            <li key={item.title}>
              <ListingCard
                showcase
                rank={index < 3 ? ((index + 1) as 1 | 2 | 3) : undefined}
                title={item.title}
                summary={item.summary}
                price={item.price}
                badge={item.badge}
                badgeTone="gold"
                meta={item.meta}
                href="/arena/yeni"
                cta="Sahneye çık"
                icon={<IconTrophy />}
                lockLabel="Havuz kilit"
              />
            </li>
          ))}
        </PodiumList>
      </Vitrine>
    );
  }
  return (
    <PodiumList>
      {tenders.map((tender, index) => (
        <li key={tender.id}>
          <ListingCard
            rank={index < 3 ? ((index + 1) as 1 | 2 | 3) : undefined}
            title={tender.title}
            summary={`${arenaTenderRoundLabel(tender.round)} turu. Ödül havuzu emanette güvende.`}
            price={formatMinor(tender.prizePoolMinor, tender.currencyCode)}
            badge={arenaTenderStatusLabel(tender.status)}
            badgeTone="gold"
            meta={arenaTenderRoundLabel(tender.round)}
            href={`/arena/${tender.id}`}
            cta="İhaleyi aç"
            icon={<IconTrophy />}
            lockLabel="Emanet"
          />
        </li>
      ))}
    </PodiumList>
  );
}

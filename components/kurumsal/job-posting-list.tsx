import { formatMinor } from "@/lib/kernel/money/format";
import type { CorporateJobPostingRecord } from "@/lib/kurumsal/types";
import { KURUMSAL_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconBuilding } from "@/components/ui/icons";
import { kurumsalPostingStatusLabel, kurumsalWorkbenchLabel } from "@/lib/copy/status-labels";

export function JobPostingList({ postings }: { postings: CorporateJobPostingRecord[] }) {
  if (postings.length === 0) {
    return (
      <Vitrine hint="Henüz mühürlü ilan yok. Örnek işler vitrindir; emanet ancak şirket profili sonrası kilitlenir.">
        <ul className="grid gap-4 md:grid-cols-2">
          {KURUMSAL_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                price={item.price}
                badge={item.badge}
                meta={item.meta}
                href="/kurumsal/ilan/yeni"
                cta="Mühürlü ilan"
                icon={<IconBuilding />}
                lockLabel="Emanet"
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {postings.map((posting) => (
        <li key={posting.id}>
          <ListingCard
            title={posting.title}
            summary={`${kurumsalWorkbenchLabel(posting.workbenchKind)} tezgâhı`}
            price={formatMinor(posting.budgetMinor, posting.currencyCode)}
            badge={kurumsalPostingStatusLabel(posting.status)}
            href={`/kurumsal/ilan/${posting.id}`}
            cta="İlanı aç"
            icon={<IconBuilding />}
            lockLabel="Emanet"
          />
        </li>
      ))}
    </ul>
  );
}

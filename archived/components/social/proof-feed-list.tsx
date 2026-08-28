import { SOCIAL_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconMegaphone } from "@/components/ui/icons";
import type { ProofFeedItemDto } from "@/lib/social/proof-feed.dto";

function kindLabel(kind: ProofFeedItemDto["kind"]): string {
  switch (kind) {
    case "certificate":
      return "Akademi sertifikası";
    case "escrow-release":
      return "Freelancer teslim";
    case "award":
      return "Arena ödülü";
    case "studio":
      return "Studio üretimi";
    default:
      return "Mühürlü vize";
  }
}

export function ProofFeedList({ items }: { items: ProofFeedItemDto[] }) {
  if (items.length === 0) {
    return (
      <Vitrine hint="Meydanda mühürlü kanıt yok. Kartlar vitrindir; boost ve jüri bu odada yoktur.">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SOCIAL_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                badge={item.badge}
                meta={item.meta}
                href="/career"
                cta="Pasaporta git"
                icon={<IconMegaphone />}
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ListingCard
            title={item.title}
            summary={item.body}
            badge={kindLabel(item.kind)}
            href={`/social/${item.id}`}
            cta="Kanıtı aç"
            icon={<IconMegaphone />}
          />
        </li>
      ))}
    </ul>
  );
}

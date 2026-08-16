import { Card } from "@/components/ui/card";
import type { CareerPortfolioItemRecord } from "@/lib/career/types";

export function PortfolioList({ items }: { items: CareerPortfolioItemRecord[] }) {
  if (items.length === 0) {
    return (
      <Card variant="glass">
        Portföy boş. Vize basılınca mühürlü satır otomatik açılır. Serbest içerik bu yüzeyde yoktur.
      </Card>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <Card variant="glass" title={item.title} bodyClassName="text-[var(--foreground)]">
            <p>Mühürlü kanıt satırı. Serbest içerik bu yüzeyde yoktur.</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Kayıt: {item.createdAt.toLocaleString("tr-TR")}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

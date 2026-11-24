import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { CandidateApplicationStatusCard } from "@/lib/career/application-status";
import type { Route } from "next";

export function ApplicationStatusCards({
  cards,
}: {
  cards: CandidateApplicationStatusCard[];
}) {
  if (cards.length === 0) {
    return null;
  }
  return (
    <Card title="Başvuru durumun" eyebrow="Kurumsal eleme">
      <ul className="grid gap-3">
        {cards.map((card) => (
          <li
            key={card.applicationId}
            className="rounded-[var(--radius-card)] border border-[var(--border)] p-3"
            data-application-band={card.band}
          >
            <p className="text-sm font-medium">
              {card.companyName} — {card.jobTitle}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{card.bandLabel}</p>
            {card.weightedScore !== null ? (
              <p className="mt-1 text-xs tabular-nums text-[var(--muted)]">
                Ağırlıklı puan: {card.weightedScore}/100
              </p>
            ) : null}
            <div className="mt-2">
              <LinkButton href={card.applyPath as Route} variant="outline" size="sm">
                İlanı aç
              </LinkButton>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

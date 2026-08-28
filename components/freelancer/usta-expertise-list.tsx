import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DirectJobOfferButton } from "@/components/freelancer/direct-job-offer-button";
import { ACADEMY_LEVEL_PATHWAYS } from "@/lib/academy/level-pathway";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";

/**
 * Vizeli uzmanlıklar — ikincil yatay keşif şeridi.
 * Ana odak açık ilanlar; bu bölüm işverenin dikeye doğrudan teklif bağladığı alt vitrindir.
 */
export function UstaExpertiseList() {
  const copy = FREELANCER_SEN.directOffer;

  return (
    <section
      className="space-y-3 border-t border-[var(--border)]/60 pt-5"
      aria-label={copy.expertiseTitle}
    >
      <div>
        <h2 className="text-base font-semibold tracking-tight text-[var(--muted)]">
          {copy.expertiseTitle}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{copy.expertiseLead}</p>
      </div>
      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {ACADEMY_LEVEL_PATHWAYS.map((pathway) => (
          <li key={pathway.id} className="w-[min(100%,17.5rem)] shrink-0">
            <Card variant="default" className="h-full space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="safir" className="normal-case tracking-tight">
                  {pathway.title}
                </Badge>
              </div>
              <p className="line-clamp-3 text-sm text-[var(--muted)]">{pathway.summary}</p>
              <DirectJobOfferButton
                invitee={{
                  displayName: pathway.title,
                  visaPathwayIds: [pathway.id],
                }}
                defaultPathwayId={pathway.id}
              />
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

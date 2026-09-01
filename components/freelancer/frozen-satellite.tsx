import { Card } from "@/components/ui/card";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";

export function FrozenSquadNotice() {
  const copy = FREELANCER_SEN.satellite;
  return (
    <Card title={copy.squadTitle} eyebrow={copy.frozenEyebrow} className="shadow-sm">
      <p className="text-sm leading-6 text-[var(--muted)]">{copy.squadBody}</p>
    </Card>
  );
}

export function FrozenDirectOfferNotice() {
  const copy = FREELANCER_SEN.satellite;
  return (
    <Card title={copy.directOfferTitle} eyebrow={copy.frozenEyebrow} className="shadow-sm">
      <p className="text-sm leading-6 text-[var(--muted)]">{copy.directOfferBody}</p>
    </Card>
  );
}

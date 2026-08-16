import { Badge } from "@/components/ui/badge";
import type { MarketplaceOrderStatus } from "@/lib/pazaryeri/types";
import {
  pazaryeriCashPhaseTone,
  pazaryeriCitizenCashPhaseLabel,
  pazaryeriOrderCashPhases,
} from "@/lib/copy/status-labels";

export function CashPhaseBadges({ status }: { status: MarketplaceOrderStatus }) {
  const phases = pazaryeriOrderCashPhases(status);
  return (
    <div className="flex flex-wrap gap-1">
      {phases.map((phase) => (
        <Badge key={phase} tone={pazaryeriCashPhaseTone(phase)}>
          {pazaryeriCitizenCashPhaseLabel(phase)}
        </Badge>
      ))}
    </div>
  );
}

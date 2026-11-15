import { Badge, type BadgeTone } from "@/components/ui/badge";
import { magazamLabel } from "@/lib/copy/sen-voice/magazam";

export function CommerceStatusBadge({
  group,
  value,
}: {
  group: "store" | "product" | "variant" | "source" | "sync" | "movement" | "direction";
  value: string;
}) {
  return <Badge tone={toneFor(group, value)}>{magazamLabel(group, value)}</Badge>;
}

function toneFor(
  group: "store" | "product" | "variant" | "source" | "sync" | "movement" | "direction",
  value: string,
): BadgeTone {
  if (value === "ACTIVE" || value === "SYNCED") {
    return "emerald";
  }
  if (value === "FAILED" || value === "PASSIVE") {
    return "rose";
  }
  if (value === "DRAFT" || value === "PENDING" || value === "TEZGAH_PAZARYERI") {
    return "amber";
  }
  if (group === "source") {
    return "safir";
  }
  return "neutral";
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";

export function Forbidden({ message }: { message: string }) {
  return (
    <Card variant="glass" className="text-center" bodyClassName="text-[var(--foreground)]">
      <Badge tone="rose">{UX_SEN.http.forbidden}</Badge>
      <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
      <div className="mt-4">
        <LinkButton href="/dashboard" variant="secondary">
          {PUBLIC_SEN.error.homeCta}
        </LinkButton>
      </div>
    </Card>
  );
}

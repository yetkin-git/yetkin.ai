import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export function Forbidden({ message }: { message: string }) {
  return (
    <Card variant="glass" className="text-center" bodyClassName="text-[var(--foreground)]">
      <Badge tone="rose">Forbidden</Badge>
      <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
      <div className="mt-4">
        <LinkButton href="/dashboard" variant="secondary">
          Anasayfa
        </LinkButton>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export function AuthNeeded({ message }: { message: string }) {
  return (
    <Card variant="glass" className="text-center" bodyClassName="text-[var(--foreground)]">
      <p className="text-sm text-[var(--muted)]">{message}</p>
      <div className="mt-4">
        <LinkButton href="/login">Giriş yap</LinkButton>
      </div>
    </Card>
  );
}

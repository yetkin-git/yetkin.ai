import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/kernel/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RailMark } from "@/components/ui/rail-mark";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const copy = SEN_VOICE.auth.login;
  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 rail-grid-fade" />
      <div className="relative">
        <RailMark tone="onLight" className="mb-4 h-10 w-10" />
        <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.description}</p>
        <Card variant="glass" className="mt-6">
          {configured ? <LoginForm /> : <p>{copy.unbound}</p>}
        </Card>
        <div className="mt-4 flex gap-3">
          <LinkButton href="/register" variant="outline" size="sm">
            {copy.registerCta}
          </LinkButton>
          <LinkButton href="/" variant="ghost" size="sm">
            {copy.homeCta}
          </LinkButton>
        </div>
      </div>
    </main>
  );
}

import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/kernel/auth/session";
import { readPostLoginPathFromSearch } from "@/lib/kernel/auth/redirects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const configured = isSupabaseConfigured();
  const copy = SEN_VOICE.auth.login;
  const params = await searchParams;
  const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = readPostLoginPathFromSearch(null, nextRaw);
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pb-14 pt-16">
      <div className="relative">
        <BrandIcon className="mb-4 h-10 w-10" />
        <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.description}</p>
        <Card variant="glass" className="mt-6">
          {configured ? <LoginForm nextPath={nextPath} /> : <p>{copy.unbound}</p>}
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

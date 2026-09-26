import type { Metadata } from "next";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { AUTH_ROBOTS, PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { RegisterForm } from "@/components/auth/register-form";
import { buildCitizenLoginHref, readPostLoginPathFromSearch } from "@/lib/kernel/auth/redirects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.register,
  robots: AUTH_ROBOTS,
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const copy = SEN_VOICE.auth.register;
  const params = await searchParams;
  const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = readPostLoginPathFromSearch(null, nextRaw);
  return (
    <main className="mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col px-4 py-3 sm:px-6">
      <div className="flex h-full min-h-0 w-full flex-col justify-center">
        <div className="flex max-h-full min-h-0 w-full flex-col">
          <div className="flex shrink-0 items-center gap-3">
            <BrandIcon className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
              <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
            </div>
          </div>
          <p className="mt-1 shrink-0 text-sm text-slate-600">{copy.description}</p>
          <Card
            variant="glass"
            dense
            className="mt-3 flex min-h-0 flex-col overflow-hidden"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            <RegisterForm nextPath={nextPath} />
          </Card>
          <div className="mt-3 shrink-0">
            <LinkButton href={buildCitizenLoginHref(nextPath)} variant="secondary" size="md" className="w-full">
              {copy.loginCta}
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}

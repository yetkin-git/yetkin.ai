import type { Metadata } from "next";
import Link from "next/link";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";
import { getSession } from "@/lib/kernel/auth/session";

export const metadata: Metadata = pageMetadata(PAGE_SEO.home);

export default async function PublicHomePage() {
  const copy = SEN_VOICE.public.home;
  const session = await getSession();
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <header className="relative flex shrink-0 items-center gap-2.5 px-6 pt-4">
        <BrandIcon className="h-8 w-8" />
        <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{YETKIN_BRAND}</p>
        <nav aria-label="Hesap" className="ml-auto flex flex-wrap items-center gap-2">
          {session ? (
            <LinkButton href="/dashboard" size="sm">
              {copy.cockpitCta}
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="outline" size="sm">
                {copy.loginCta}
              </LinkButton>
              <LinkButton href="/register" size="sm">
                {copy.registerCta}
              </LinkButton>
            </>
          )}
        </nav>
      </header>
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-12 pt-4">
        <div className="grid shrink-0 items-start gap-6 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{copy.title}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">{copy.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <LinkButton href="/academy" size="lg">
                {copy.academyCta}
              </LinkButton>
            </div>
          </div>
          <Card variant="ink" title={copy.trustTitle} eyebrow={copy.trustEyebrow} bodyClassName="text-white/70">
            <ul className="space-y-2 text-sm">
              {copy.trust.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Card>
        </div>
        <section className="relative mt-6 min-h-0">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.roomsKicker}
          </p>
          <Link href={copy.hero.href} className="block">
            <Card variant="featured" className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {copy.hero.kicker}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-[var(--foreground)]">{copy.hero.title}</p>
              <p className="mt-1 text-sm leading-6">{copy.hero.body}</p>
            </Card>
          </Link>
        </section>
      </div>
    </main>
  );
}

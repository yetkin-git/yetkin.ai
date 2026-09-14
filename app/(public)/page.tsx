import type { Metadata } from "next";
import Link from "next/link";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";
import { HomeAccountNav } from "@/components/public/home-account-nav";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { HOME_LANDING_FAQ } from "@/lib/copy/sem-keywords";

export const metadata: Metadata = pageMetadata(PAGE_SEO.home);

export default function PublicHomePage() {
  const copy = SEN_VOICE.public.home;
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <JsonLd data={jsonLdDocument([faqPageJsonLd(HOME_LANDING_FAQ)])} />
      <header className="relative flex shrink-0 items-center gap-2.5 px-6 pt-4">
        <BrandIcon width={32} height={32} className="h-8 w-8" />
        <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{YETKIN_BRAND}</p>
        <HomeAccountNav />
      </header>
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-12 pt-4">
        <div className="grid shrink-0 items-start gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
              {copy.badge}
            </p>
            <h1 className="mt-2 text-pretty text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {copy.title}
            </h1>
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
        <section className="relative mt-8 min-h-0" aria-labelledby="home-cinema-heading">
          <h2
            id="home-cinema-heading"
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
          >
            {copy.cinemaKicker}
          </h2>
          <p className="mb-3 text-sm text-[var(--muted)]">{copy.cinemaHint}</p>
          <Card variant="default" className="border-dashed p-5" data-academy-production-band="">
            <p className="text-base font-semibold text-[var(--foreground)]">{ACADEMY_SEN.catalog.empty}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.cinemaHint}</p>
            <div className="mt-4">
              <LinkButton href="/academy">{copy.academyCta}</LinkButton>
            </div>
          </Card>
        </section>
        <section className="relative mt-6 min-h-0" aria-labelledby="home-rooms-heading">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.roomsKicker}
          </p>
          <Link href={copy.hero.href} className="block">
            <Card variant="featured" className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {copy.hero.kicker}
              </p>
              <h2
                id="home-rooms-heading"
                className="mt-1.5 text-lg font-semibold text-[var(--foreground)]"
              >
                {copy.hero.title}
              </h2>
              <p className="mt-1 text-sm leading-6">{copy.hero.body}</p>
            </Card>
          </Link>
        </section>
        <LandingFaq heading={copy.faqHeading} items={HOME_LANDING_FAQ} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";
import { HomeAccountNav } from "@/components/public/home-account-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { HOME_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { OFF_101_EXEMPTION_PATH } from "@/lib/academy/off101-exemption";

/**
 * Marka iniş katmanı — kök adres (`/`).
 * Freelancer üretim vitrini: ücretsiz yetkinlik testi, dört adımlı zincir, beş uzmanlık.
 * Kapalı oda önizlemesi bu sayfada basılmaz.
 */
export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.home,
  robots: { index: true, follow: true },
});

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
              <LinkButton href={OFF_101_EXEMPTION_PATH} size="lg" variant="success">
                {copy.primaryCta}
              </LinkButton>
              <LinkButton href="/tezgah" size="lg" variant="secondary">
                {copy.tezgahCta}
              </LinkButton>
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
        <section className="relative mt-8 min-h-0" aria-labelledby="home-chain-heading" data-home-value-chain="">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.chainKicker}
          </p>
          <h2
            id="home-chain-heading"
            className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
          >
            {copy.chainTitle}
          </h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.chain.map((step) => (
              <li key={step.step}>
                <Card variant="default" className="h-full p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
                    {step.step}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                  {"href" in step ? (
                    <Link
                      href={step.href}
                      className="mt-3 inline-flex text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                    >
                      {copy.tezgahCta}
                    </Link>
                  ) : null}
                </Card>
              </li>
            ))}
          </ol>
        </section>
        <section className="relative mt-8 min-h-0" aria-labelledby="home-tracks-heading">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.tracksKicker}
          </p>
          <h2
            id="home-tracks-heading"
            className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
          >
            {copy.tracksTitle}
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.tracks.map((track) => (
              <li key={track.href}>
                <Card variant="default" className="flex h-full flex-col p-5">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">
                    <Link href={track.href} className="hover:underline">
                      {track.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{track.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <LinkButton href={track.href} size="sm" variant="outline">
                      {copy.academyCta}
                    </LinkButton>
                    <LinkButton href={OFF_101_EXEMPTION_PATH} size="sm" variant="success">
                      {copy.tracksCta}
                    </LinkButton>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
        <LandingFaq heading={copy.faqHeading} items={HOME_LANDING_FAQ} />
      </div>
    </main>
  );
}

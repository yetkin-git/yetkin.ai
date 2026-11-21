import type { Metadata } from "next";
import type { Route } from "next";
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
import { GrantEligibilityWidget } from "@/components/hibe/grant-eligibility-widget";
import { HomeSocialProofStrip } from "@/components/public/home-social-proof-strip";
import { buildHomeProofLines, loadHomeSocialProof } from "@/lib/pricing/home-social-proof";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";

/**
 * Marka iniş katmanı — kök adres (`/`).
 * Ticari vitrin: AI Tezgâh, e-ticaret, hibe ve YetkinCV. Kapalı odalar (Akademi / Junior / Young) basılmaz.
 *
 * CRO (SEO Tedavi P0): ana sayfa bağları artık giriş duvarına çarpmaz.
 * Korumalı hedefler (`/e-ticaret`, `/hibe`) oturumsuz ziyaretçiye ham adresle
 * verilmez; `next` parametreli kayıt yoluna çevrilir (`buildCitizenRegisterHref`,
 * açık yön allowlist'i aynı fonksiyonda) veya sayfa içi çapaya indirilir.
 */
export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.home,
  robots: { index: true, follow: true },
});

/** Korumalı iç hedef → `next` taşıyan kayıt yolu. Açık yön allowlist'i çağrıda uygulanır. */
function homeCtaHref(href: string): string {
  if (!href.startsWith("/")) {
    return href;
  }
  return isProtectedCitizenPath(href) ? buildCitizenRegisterHref(href) : href;
}

export default async function PublicHomePage() {
  const copy = SEN_VOICE.public.home;
  // Sosyal kanıt gerçek veriden gelir. DB yoksa veya eşik dolmazsa şerit hiç basılmaz.
  const proofLines = buildHomeProofLines(await loadHomeSocialProof());
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-gradient-to-b from-slate-50 via-blue-50/40 to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.16),transparent_62%)]"
      />
      <JsonLd data={jsonLdDocument([faqPageJsonLd(HOME_LANDING_FAQ)])} />
      <header className="relative flex shrink-0 flex-wrap items-center gap-2.5 px-6 pt-4">
        <BrandIcon width={32} height={32} className="h-8 w-8" />
        <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{YETKIN_BRAND}</p>
        <Link
          href="/tezgah"
          className="ml-1 inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          AI Tezgâh
        </Link>
        <Link
          href="/fiyatlandirma"
          className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          Fiyatlar
        </Link>
        <Link
          href="/kurumsal"
          className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          Kurumsal
        </Link>
        <Link
          href="/rehber"
          className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          Nasıl Çalışır?
        </Link>
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
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <LinkButton href="/tezgah" size="lg" variant="success">
                {copy.primaryCta}
              </LinkButton>
              <Link
                href="/fiyatlandirma"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--safir-deep)] underline-offset-4 hover:underline"
              >
                {copy.secondaryCta}
              </Link>
              <Link
                href="/rehber"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                Nasıl Çalışır? (Süreç Şeması)
              </Link>
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
                      href={homeCtaHref(step.href) as Route}
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
        <section
          className="relative mt-10 w-screen bg-slate-950 px-6 py-12 text-white [margin-inline:calc(50%-50vw)]"
          aria-labelledby="home-bench-heading"
          data-home-bench=""
        >
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              {copy.benchKicker}
            </p>
            <h2
              id="home-bench-heading"
              className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              {copy.benchTitle}
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.bench.map((item) => (
                <li key={item.href}>
                  <Card variant="default" className="flex h-full flex-col p-5">
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      <Link href={homeCtaHref(item.href) as Route} className="hover:underline">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="relative mt-0 w-screen bg-gradient-to-b from-indigo-50 via-white to-white px-6 py-2 [margin-inline:calc(50%-50vw)]">
          <div className="mx-auto w-full max-w-6xl">
            <GrantEligibilityWidget />
          </div>
        </div>
        <HomeSocialProofStrip lines={proofLines} />
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
          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.tracks.map((track) => (
              <li key={track.href}>
                <Card variant="default" className="flex h-full flex-col p-5">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">
                    <Link href={homeCtaHref(track.href) as Route} className="hover:underline">
                      {track.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{track.body}</p>
                  <div className="mt-4">
                    <LinkButton href={homeCtaHref(track.href) as Route} size="sm" variant="outline">
                      {track.cta}
                    </LinkButton>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
        <section className="relative mt-10 min-h-0" aria-labelledby="home-resources-heading" data-home-resources="">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {copy.resourcesKicker}
          </p>
          <h2
            id="home-resources-heading"
            className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
          >
            {copy.resourcesTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.resourcesLead}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.resources.map((resource) => (
              <li key={resource.href}>
                <Card variant="default" className="flex h-full flex-col p-5">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">
                    <Link href={resource.href as Route} className="hover:underline">
                      {resource.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{resource.body}</p>
                  <div className="mt-4">
                    <LinkButton href={resource.href as Route} size="sm" variant="outline">
                      {resource.cta}
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

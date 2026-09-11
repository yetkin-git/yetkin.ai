import type { Metadata } from "next";
import Link from "next/link";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";
import { SecurePaymentMarks } from "@/components/legal/secure-payment-marks";
import { getSession } from "@/lib/kernel/auth/session";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import type { Route } from "next";

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
            <div className="mt-5 max-w-full" data-home-payment-marks="">
              <SecurePaymentMarks compact />
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
        <section className="relative mt-8 min-h-0" aria-labelledby="home-cinema-kicker">
          <p
            id="home-cinema-kicker"
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
          >
            {copy.cinemaKicker}
          </p>
          <p className="mb-3 text-sm text-[var(--muted)]">{copy.cinemaHint}</p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {ACADEMY_GROWTH_SKU_SLUGS.map((slug, index) => (
              <li key={slug}>
                <Link
                  aria-label={academyCourseTitleBySlug(slug) ?? slug}
                  href={`/academy/${slug}` as Route}
                  className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)] focus-visible:ring-offset-2"
                >
                  <img
                    src={academyCourseCoverPath(slug)}
                    alt={academyCourseTitleBySlug(slug) ?? slug}
                    width={480}
                    height={270}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "low"}
                    className="aspect-[16/9] h-auto w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
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

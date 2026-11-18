import type { Metadata, Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { IconArrow } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { guidePath, PUBLIC_GUIDES } from "@/lib/copy/guides";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { GUIDE_FAQ, PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import {
  breadcrumbListJsonLd,
  faqPageJsonLd,
  guideArticleJsonLd,
  jsonLdDocument,
} from "@/lib/copy/json-ld";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.guide,
  robots: { index: true, follow: true },
});

export default function GuidePage() {
  const copy = PUBLIC_SEN.guide;
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_46%)] px-6 pb-16 pt-12">
      <JsonLd
        data={jsonLdDocument([
          guideArticleJsonLd({
            headline: PAGE_SEO.guide.title,
            description: PAGE_SEO.guide.description,
            path: PAGE_SEO.guide.path,
          }),
          faqPageJsonLd(GUIDE_FAQ),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Rehber", path: PAGE_SEO.guide.path },
          ]),
        ])}
      />
      <PublicHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/tezgah" size="lg" variant="success">
            {copy.cta}
            <IconArrow className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/career" size="lg" variant="outline">
            {copy.catalogCta}
          </LinkButton>
        </div>
      </PublicHero>
      <section className="mt-8" aria-labelledby="guide-steps">
        <h2 id="guide-steps" className="text-lg font-semibold tracking-tight">
          {copy.stepsTitle}
        </h2>
        <ol className="mt-4 grid gap-3">
          {copy.steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <LandingFaq heading={copy.faqHeading} items={GUIDE_FAQ} />
      <section className="mt-10" aria-labelledby="rehber-makaleler">
        <h2 id="rehber-makaleler" className="text-lg font-semibold tracking-tight">
          Odaklı rehberler
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {PUBLIC_GUIDES.map((guide) => (
            <li key={guide.slug}>
              <LinkButton href={guidePath(guide.slug) as Route} variant="outline" size="sm" className="w-full justify-between">
                {guide.title}
                <IconArrow className="h-3.5 w-3.5" />
              </LinkButton>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

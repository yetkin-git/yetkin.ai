import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { LinkButton } from "@/components/ui/link-button";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { GUIDE_FAQ, OFFICE_AI_SEO, PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
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
    <main className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 pb-16 pt-12">
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
        {copy.eyebrow}
      </p>
      <h1 className="mt-2 text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-base leading-7 text-[var(--muted)]">{copy.description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton href={`${OFFICE_AI_SEO.path}/oyna`} size="lg" variant="success">
          {copy.cta}
        </LinkButton>
        <LinkButton href="/academy" size="lg" variant="outline">
          {copy.catalogCta}
        </LinkButton>
      </div>
      <section className="mt-8" aria-labelledby="guide-steps">
        <h2 id="guide-steps" className="text-lg font-semibold tracking-tight">
          {copy.stepsTitle}
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <LandingFaq heading={copy.faqHeading} items={GUIDE_FAQ} />
    </main>
  );
}

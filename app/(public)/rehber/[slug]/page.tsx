import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { LinkButton } from "@/components/ui/link-button";
import { GUIDE_HUB_PATH, guidePath, PUBLIC_GUIDES, publicGuide } from "@/lib/copy/guides";
import { breadcrumbListJsonLd, faqPageJsonLd, guideArticleJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { pageMetadata } from "@/lib/copy/seo";

export function generateStaticParams(): { slug: string }[] {
  return PUBLIC_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = publicGuide(slug);
  if (!guide) {
    return pageMetadata({
      title: "Rehber",
      description: "Rehber bulunamadı.",
      path: GUIDE_HUB_PATH,
      robots: { index: false, follow: true },
    });
  }
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: guidePath(guide.slug),
    robots: { index: true, follow: true },
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = publicGuide(slug);
  if (!guide) {
    notFound();
  }
  const path = guidePath(guide.slug);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 pb-16 pt-12">
      <JsonLd
        data={jsonLdDocument([
          guideArticleJsonLd({
            headline: guide.title,
            description: guide.description,
            path,
          }),
          faqPageJsonLd(guide.faqs),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Rehber", path: GUIDE_HUB_PATH },
            { name: guide.title, path },
          ]),
        ])}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">Rehber</p>
      <h1 className="mt-2 text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">{guide.h1}</h1>
      <p className="mt-3 text-base leading-7 text-[var(--muted)]">{guide.lead}</p>
      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <section className="mt-8" aria-labelledby="rehber-steps">
        <h2 id="rehber-steps" className="text-lg font-semibold tracking-tight">
          Uygulama
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href={guide.toolHref as Route}>{guide.toolLabel}</LinkButton>
        <LinkButton href={guide.examHref as Route} variant="outline">
          {guide.examLabel}
        </LinkButton>
      </div>
      <LandingFaq heading="Sık sorulanlar" items={guide.faqs} />
    </main>
  );
}

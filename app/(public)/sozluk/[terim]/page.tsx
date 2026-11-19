import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { IconArrow } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { GLOSSARY_PATH, GLOSSARY_TERMS, glossaryPath, glossaryTerm } from "@/lib/copy/glossary";
import { GUIDE_TEZGAH_CTA_HREF, GUIDE_TEZGAH_CTA_LABEL } from "@/lib/copy/guides";
import { breadcrumbListJsonLd, guideArticleJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { pageMetadata } from "@/lib/copy/seo";
import type { Route } from "next";

export function generateStaticParams(): { terim: string }[] {
  return GLOSSARY_TERMS.map((term) => ({ terim: term.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ terim: string }>;
}): Promise<Metadata> {
  const { terim } = await params;
  const term = glossaryTerm(terim);
  if (!term) {
    return pageMetadata({
      title: "Sözlük",
      description: "Terim bulunamadı.",
      path: GLOSSARY_PATH,
      robots: { index: false, follow: true },
    });
  }
  return pageMetadata({
    title: term.term,
    description: term.definition.slice(0, 160),
    path: glossaryPath(term.slug),
    robots: { index: true, follow: true },
  });
}

export default async function SozlukTermPage({
  params,
}: {
  params: Promise<{ terim: string }>;
}) {
  const { terim } = await params;
  const term = glossaryTerm(terim);
  if (!term) {
    notFound();
  }
  const path = glossaryPath(term.slug);
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          guideArticleJsonLd({
            headline: term.term,
            description: term.definition,
            path,
          }),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Sözlük", path: GLOSSARY_PATH },
            { name: term.term, path },
          ]),
        ])}
      />
      <PublicHero eyebrow="Sözlük" title={term.term} description={term.definition} />
      <section
        className="mt-8 rounded-2xl border border-slate-200/80 border-l-4 border-l-blue-600 bg-white p-5 shadow-sm"
        aria-labelledby="sozluk-tezgah"
      >
        <h2 id="sozluk-tezgah" className="text-lg font-semibold tracking-tight">
          AI Tezgâh&apos;ta nasıl uygulanır?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{term.tezgahExample}</p>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href={term.toolHref as Route}>
          {term.toolLabel}
          <IconArrow className="h-3.5 w-3.5" />
        </LinkButton>
        <LinkButton href={GUIDE_TEZGAH_CTA_HREF as Route} variant="success">
          {GUIDE_TEZGAH_CTA_LABEL}
          <IconArrow className="h-3.5 w-3.5" />
        </LinkButton>
      </div>
    </main>
  );
}

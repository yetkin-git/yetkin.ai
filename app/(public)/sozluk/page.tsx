import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { IconBook } from "@/components/ui/icons";
import { PublicHero } from "@/components/ui/public-hero";
import { GLOSSARY_PATH, GLOSSARY_TERMS, glossaryPath } from "@/lib/copy/glossary";
import { breadcrumbListJsonLd, itemListJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.sozluk,
  robots: { index: true, follow: true },
});

export default function SozlukPage() {
  return (
    <main className="mx-auto w-full max-w-6xl bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_46%)] px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          itemListJsonLd({
            name: PAGE_SEO.sozluk.title,
            path: GLOSSARY_PATH,
            items: GLOSSARY_TERMS.map((term) => ({ name: term.term, path: glossaryPath(term.slug) })),
          }),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Sözlük", path: GLOSSARY_PATH },
          ]),
        ])}
      />
      <PublicHero
        eyebrow="Sözlük"
        title="Yapay zekâ ve dijital ticaret"
        description="Otuz terim. Her sayfada tanım ve AI Tezgâh örneği vardır. Kapalı iş odası bu sözlükte açılmaz."
      />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {GLOSSARY_TERMS.map((term) => (
          <li
            key={term.slug}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Link
              href={glossaryPath(term.slug) as Route}
              className="inline-flex items-center gap-2 font-semibold text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IconBook className="h-4 w-4" />
              </span>
              {term.term}
            </Link>
            <p className="mt-2 border-l-4 border-slate-200 pl-3 text-sm leading-6 text-slate-600">
              {term.definition}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import {
  LEGAL_CARD_CLASSNAME,
  LegalEntityColophon,
  LegalHonestyCard,
  LegalSectionArticles,
  LegalSupportEmailLine,
} from "@/components/legal/legal-section-articles";
import {
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_UPDATED_LABEL,
  legalSectionBySlug,
  legalSectionLead,
} from "@/lib/copy/legal-launch";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbListJsonLd,
  jsonLdDocument,
  legalSectionBreadcrumbs,
} from "@/lib/copy/json-ld";
import { pageMetadata } from "@/lib/copy/seo";

export function generateStaticParams() {
  return LEGAL_LAUNCH_SECTIONS.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = legalSectionBySlug(slug);
  if (!section) {
    return { title: "Yasal sayfa" };
  }
  return pageMetadata({
    title: section.title,
    description: legalSectionLead(section),
    path: `/legal/${section.slug}`,
  });
}

export default async function LegalSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = legalSectionBySlug(slug);
  if (!section) {
    notFound();
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <JsonLd
        data={jsonLdDocument([
          breadcrumbListJsonLd(
            legalSectionBreadcrumbs({
              slug: section.slug,
              title: section.title,
            }),
          ),
        ])}
      />
      <div className="relative space-y-6">
        <div className="space-y-3">
          <LegalBackToHome />
          <div>
            <Badge tone="safir">Hukuk</Badge>
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
        <p className="text-sm leading-relaxed text-slate-700">{LEGAL_UPDATED_LABEL}</p>
        <LegalHonestyCard />
        <LegalSupportEmailLine />
        <Card className={LEGAL_CARD_CLASSNAME}>
          <LegalSectionArticles section={section} />
        </Card>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/legal" variant="outline" size="sm">
            Tüm yasal metinler
          </LinkButton>
          <LinkButton href="/iletisim" variant="outline" size="sm">
            İletişim
          </LinkButton>
        </div>
        <LegalEntityColophon />
      </div>
    </main>
  );
}

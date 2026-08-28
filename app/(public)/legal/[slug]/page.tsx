import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  LEGAL_HONESTY_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_UPDATED_LABEL,
  legalSectionBySlug,
} from "@/lib/copy/legal-launch";

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
  return { title: section.title, description: section.paragraphs[0] };
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
      <div className="relative space-y-6">
        <Badge tone="safir">Hukuk</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
        <p className="text-xs text-[var(--muted)]">{LEGAL_UPDATED_LABEL}</p>
        <Card variant="glass">{LEGAL_HONESTY_BODY}</Card>
        <Card>
          <div className="space-y-3">
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </Card>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/legal" variant="outline" size="sm">
            Tüm yasal metinler
          </LinkButton>
          <LinkButton href="/iletisim" variant="outline" size="sm">
            İletişim
          </LinkButton>
        </div>
      </div>
    </main>
  );
}

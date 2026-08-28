import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  LEGAL_HONESTY_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_PAGE_TITLE,
  LEGAL_UPDATED_LABEL,
} from "@/lib/copy/legal-launch";

export const metadata: Metadata = {
  title: LEGAL_PAGE_TITLE,
  description:
    "KVKK aydınlatma, çerez politikası, mesafeli satış, iade koşulları ve platform kullanım şartları.",
};

export default function LegalPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <Badge tone="safir">Hukuk</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{LEGAL_PAGE_TITLE}</h1>
        <p className="text-xs text-[var(--muted)]">{LEGAL_UPDATED_LABEL}</p>
        <Card variant="glass">{LEGAL_HONESTY_BODY}</Card>
        <nav aria-label="Hukuk bölümleri" className="flex flex-col gap-1 text-sm">
          {LEGAL_LAUNCH_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={section.href}
              className="font-semibold text-[var(--safir-deep)] hover:underline"
            >
              {section.title}
            </a>
          ))}
          <a href="/iletisim" className="font-semibold text-[var(--safir-deep)] hover:underline">
            İletişim
          </a>
        </nav>
        {LEGAL_LAUNCH_SECTIONS.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24">
            <Card title={section.title}>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </Card>
          </div>
        ))}
        <LinkButton href="/" variant="outline" size="sm">
          Ana sayfa
        </LinkButton>
      </div>
    </main>
  );
}

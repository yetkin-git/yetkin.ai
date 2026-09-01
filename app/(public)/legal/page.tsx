import type { Metadata } from "next";
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
  LEGAL_PAGE_TITLE,
  LEGAL_UPDATED_LABEL,
} from "@/lib/copy/legal-launch";

export const metadata: Metadata = {
  title: LEGAL_PAGE_TITLE,
  description:
    "KVKK aydınlatma, çerez politikası, mesafeli satış, ön bilgilendirme, iade koşulları ve platform kullanım şartları.",
};

export default function LegalPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <div className="space-y-3">
          <LegalBackToHome />
          <div>
            <Badge tone="safir">Hukuk</Badge>
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{LEGAL_PAGE_TITLE}</h1>
        <p className="text-sm leading-relaxed text-slate-700">{LEGAL_UPDATED_LABEL}</p>
        <LegalHonestyCard />
        <LegalSupportEmailLine />
        <nav aria-label="Hukuk bölümleri" className="flex flex-col gap-1 text-base">
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
            <Card title={section.title} className={LEGAL_CARD_CLASSNAME}>
              <LegalSectionArticles section={section} headingLevel="h3" />
            </Card>
          </div>
        ))}
        <LinkButton href="/" variant="outline" size="sm">
          Ana sayfa
        </LinkButton>
        <LegalEntityColophon />
      </div>
    </main>
  );
}

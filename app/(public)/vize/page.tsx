import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { VIZE_LANDING_FAQ } from "@/lib/copy/sem-keywords";

export const metadata: Metadata = pageMetadata(PAGE_SEO.publicTalent);

export default function PublicTalentLandingPage() {
  const copy = CAREER_SEN.publicPage;
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <LegalBackToHome />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{copy.landingTitle}</h1>
        <p className="text-base leading-7 text-slate-600">{copy.landingLead}</p>
        <JsonLd data={jsonLdDocument([faqPageJsonLd(VIZE_LANDING_FAQ)])} />
        <Card>
          <p>{copy.privacy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/career" size="sm">
              {copy.careerCta}
            </LinkButton>
            <LinkButton href="/academy/dogrula" variant="outline" size="sm">
              {CAREER_SEN.footnoteVerifyCta}
            </LinkButton>
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.academyCta}
            </LinkButton>
          </div>
        </Card>
        <LandingFaq heading={copy.faqHeading} items={VIZE_LANDING_FAQ} />
      </div>
    </main>
  );
}

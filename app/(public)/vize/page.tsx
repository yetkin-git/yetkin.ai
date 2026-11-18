import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { IconArrow } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
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
        <PublicHero eyebrow={copy.eyebrow} title={copy.landingTitle} description={copy.landingLead} />
        <JsonLd data={jsonLdDocument([faqPageJsonLd(VIZE_LANDING_FAQ)])} />
        <Card>
          <p>{copy.privacy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/career" size="sm">
              {copy.careerCta}
              <IconArrow className="h-3.5 w-3.5" />
            </LinkButton>
            <LinkButton href="/vize" variant="outline" size="sm">
              {CAREER_SEN.footnoteVerifyCta}
            </LinkButton>
            <LinkButton href="/career" variant="outline" size="sm">
              {copy.academyCta}
            </LinkButton>
          </div>
        </Card>
        <LandingFaq heading={copy.faqHeading} items={VIZE_LANDING_FAQ} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { CertificateVerifyForm } from "@/components/academy/certificate-verify-form";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academyVerify);

export default function AcademyCertificateVerifyLandingPage() {
  const copy = SEN_VOICE.academy.verify;
  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.landingTitle}
        description={copy.landingLead}
        actions={
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.catalogCta}
          </LinkButton>
        }
      />
      <Card variant="featured">
        <p className="mb-4 text-sm text-[var(--muted)]">{copy.privacy}</p>
        <CertificateVerifyForm />
      </Card>
    </RoomFrame>
  );
}

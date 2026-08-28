import { CertificateList } from "@/components/academy/certificate-list";
import { loadCertificatesForUser } from "@/lib/academy/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";

export default async function AcademyCertificatesPage() {
  const session = await getSession();
  const certificates = session ? await loadCertificatesForUser(session.id) : [];
  const copy = SEN_VOICE.academy.certificates;
  const hasSealed = Boolean(certificates && certificates.length > 0);

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {hasSealed ? (
              <LinkButton href={UX_SEN.bridge.examCareerHref} size="sm">
                {copy.careerVisaCta}
              </LinkButton>
            ) : null}
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          </div>
        }
      />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : certificates === null ? (
        <Card variant="default" className="shadow-sm">
          <p>{copy.unbound}</p>
          <div className="mt-4">
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.emptyCta}
            </LinkButton>
          </div>
        </Card>
      ) : certificates.length === 0 ? (
        <Card variant="default" className="shadow-sm">
          <p>{copy.empty}</p>
          <div className="mt-4">
            <LinkButton href="/academy" size="sm">
              {copy.emptyCta}
            </LinkButton>
          </div>
        </Card>
      ) : (
        <CertificateList certificates={certificates} />
      )}
    </RoomFrame>
  );
}

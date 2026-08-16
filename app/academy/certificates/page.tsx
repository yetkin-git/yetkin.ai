import { CertificateList } from "@/components/academy/certificate-list";
import { loadCertificatesForUser } from "@/lib/academy/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function AcademyCertificatesPage() {
  const session = await getSession();
  const certificates = session ? await loadCertificatesForUser(session.id) : [];
  const copy = SEN_VOICE.academy.certificates;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.catalogCta}
          </LinkButton>
        }
      />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : certificates === null ? (
        <Card variant="glass">{copy.unbound}</Card>
      ) : (
        <CertificateList certificates={certificates} />
      )}
    </RoomFrame>
  );
}

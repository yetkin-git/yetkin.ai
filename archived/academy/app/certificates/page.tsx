import { CertificateList } from "@/components/academy/certificate-list";
import { loadAcademyHolderName, loadCertificatesForUser } from "@/lib/academy/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  CAREER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
} from "@/lib/kernel/passport/types";

const ACADEMY_VERIFY_SURFACE_PATH = "/academy/dogrula";

export default async function AcademyCertificatesPage() {
  const session = await requirePageSession();
  const [certificates, holderName] = await Promise.all([
    loadCertificatesForUser(session.id),
    loadAcademyHolderName(session.id),
  ]);
  const copy = SEN_VOICE.academy.certificates;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={
          <>
            {copy.description}
            <span className="mt-1 block">{copy.careerVisaLead}</span>
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <LinkButton href={PASSPORT_SURFACE_PATH} variant="outline" size="sm">
              {copy.passportCta}
            </LinkButton>
            <LinkButton href={CAREER_STAMP_SURFACE_PATH} size="sm">
              {copy.careerBridgeCta}
            </LinkButton>
            <LinkButton href={ACADEMY_VERIFY_SURFACE_PATH} variant="outline" size="sm">
              {copy.verifyPublicCta}
            </LinkButton>
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          </div>
        }
      />
      {certificates === null ? (
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
        <CertificateList certificates={certificates} holderName={holderName} />
      )}
    </RoomFrame>
  );
}

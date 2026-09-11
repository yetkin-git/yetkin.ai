import { Card } from "@/components/ui/card";
import type { AcademyCertificateRecord } from "@/lib/academy/types";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { CertificateVerifyQr } from "@/components/academy/certificate-verify-qr";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function CertificateList({
  certificates,
  holderName,
}: {
  certificates: AcademyCertificateRecord[];
  holderName?: string;
}) {
  if (certificates.length === 0) {
    return <Card>{ACADEMY_SEN.certificates.empty}</Card>;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {certificates.map((certificate) => {
        const hash = certificate.certificateHash ?? certificate.serialKey;
        const revoked = Boolean(certificate.revokedAt);
        return (
          <li key={certificate.id} className="space-y-3">
            <CertificateSeal
              variant="diploma"
              hash={hash}
              score={certificate.score}
              issuedAt={certificate.issuedAt}
              courseTitle={certificate.title}
              holderName={holderName}
              verifyHref={hash ? `/academy/dogrula/${hash}` : undefined}
              revoked={revoked}
            />
            {hash && !revoked ? <CertificateVerifyQr hash={hash} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

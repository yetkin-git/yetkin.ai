import { Card } from "@/components/ui/card";
import type { AcademyCertificateRecord } from "@/lib/academy/types";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function CertificateList({ certificates }: { certificates: AcademyCertificateRecord[] }) {
  if (certificates.length === 0) {
    return <Card>{ACADEMY_SEN.certificates.empty}</Card>;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {certificates.map((certificate) => {
        const hash = certificate.certificateHash ?? certificate.serialKey;
        return (
          <li key={certificate.id}>
            <Card title={certificate.title} bodyClassName="text-[var(--foreground)]">
              <CertificateSeal
                variant="diploma"
                hash={hash}
                score={certificate.score}
                issuedAt={certificate.issuedAt}
                courseTitle={certificate.title}
                verifyHref={hash ? `/academy/dogrula/${hash}` : undefined}
              />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

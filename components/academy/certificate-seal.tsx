import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function CertificateSeal({
  hash,
  score,
  issuedAt,
  verifyHref,
}: {
  hash: string;
  score?: number | null;
  issuedAt?: Date;
  verifyHref?: string;
}) {
  return (
    <div className="space-y-2">
      <Badge tone="gold">{ACADEMY_SEN.certificates.sealed}</Badge>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {ACADEMY_SEN.certificates.hashLabel}
      </p>
      <p className="break-all font-mono text-xs leading-5 text-[var(--foreground)]">{hash}</p>
      {score != null ? (
        <p className="text-xs text-[var(--muted)]">
          {ACADEMY_SEN.certificates.scoreLabel}: {score}
        </p>
      ) : null}
      {issuedAt ? (
        <p className="text-xs text-[var(--muted)]">
          {ACADEMY_SEN.certificates.issuedLabel}: {issuedAt.toLocaleString("tr-TR")}
        </p>
      ) : null}
      {verifyHref ? (
        <div className="pt-1">
          <LinkButton href={verifyHref} variant="outline" size="sm">
            {ACADEMY_SEN.certificates.verifyCta}
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}

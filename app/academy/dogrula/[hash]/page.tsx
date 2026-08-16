import { loadPublicCertificateByHash } from "@/lib/academy/load";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { AcademyCertificateSealStatus } from "@/lib/academy/certificate-verify";

function sealTone(status: AcademyCertificateSealStatus): "emerald" | "rose" | "amber" {
  if (status === "valid") {
    return "emerald";
  }
  if (status === "mismatch") {
    return "rose";
  }
  return "amber";
}

function sealTitle(status: AcademyCertificateSealStatus): string {
  const copy = SEN_VOICE.academy.verify;
  if (status === "valid") {
    return copy.valid;
  }
  if (status === "mismatch") {
    return copy.mismatch;
  }
  return copy.incomplete;
}

function sealBody(status: AcademyCertificateSealStatus): string {
  const copy = SEN_VOICE.academy.verify;
  if (status === "valid") {
    return copy.validBody;
  }
  if (status === "mismatch") {
    return copy.mismatchBody;
  }
  return copy.incompleteBody;
}

export default async function AcademyCertificateVerifyPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const copy = SEN_VOICE.academy.verify;
  const resolution = await loadPublicCertificateByHash(hash);

  if (resolution == null) {
    return (
      <RoomFrame>
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={SEN_VOICE.academy.certificates.unbound}
        />
        <Card variant="glass">{SEN_VOICE.academy.certificates.unbound}</Card>
      </RoomFrame>
    );
  }

  if (resolution.status === "invalid-format") {
    return (
      <RoomFrame>
        <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.invalidFormat} />
        <Card variant="glass">
          <p>{copy.invalidFormat}</p>
          <div className="mt-4">
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          </div>
        </Card>
      </RoomFrame>
    );
  }

  if (resolution.status === "missing") {
    return (
      <RoomFrame>
        <PageHeader eyebrow={copy.eyebrow} title={copy.missing} description={copy.missingBody} />
        <Card variant="glass">
          <p className="break-all font-mono text-xs">{hash}</p>
          <p className="mt-3">{copy.missingBody}</p>
          <div className="mt-4">
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          </div>
        </Card>
      </RoomFrame>
    );
  }

  const view = resolution.view;
  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={view.courseTitle}
        description={copy.privacy}
        actions={
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.catalogCta}
          </LinkButton>
        }
      />
      <Card variant="featured" title={sealTitle(view.sealStatus)}>
        <Badge tone={sealTone(view.sealStatus)}>{sealTitle(view.sealStatus)}</Badge>
        <p className="mt-3">{sealBody(view.sealStatus)}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{copy.privacy}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.algorithm}
            </dt>
            <dd className="break-all font-mono text-xs text-[var(--foreground)]">{view.certificateHash}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.hashedFieldsLabel}
            </dt>
            <dd>{view.hashedFields.join(" · ")}</dd>
          </div>
          {view.curriculumSeal ? (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.curriculumSealLabel}
              </dt>
              <dd className="break-all font-mono text-xs text-[var(--foreground)]">
                {view.curriculumSeal}
              </dd>
            </div>
          ) : null}
          {view.score != null ? (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.scoreLabel}
              </dt>
              <dd>
                {view.score} / baraj {view.passScore}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.issuedLabel}
            </dt>
            <dd>{view.issuedAt.toLocaleString("tr-TR")}</dd>
          </div>
        </dl>
        {view.courseSlug ? (
          <div className="mt-4">
            <LinkButton href={`/academy/${view.courseSlug}`} variant="outline" size="sm">
              {copy.courseCta}
            </LinkButton>
          </div>
        ) : null}
      </Card>
    </RoomFrame>
  );
}

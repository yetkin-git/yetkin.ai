import type { Metadata } from "next";
import { loadPublicAcademyVerifyByHash } from "@/lib/academy/load";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { AcademyCertificateSealStatus } from "@/lib/academy/certificate-verify";
import { ProofOfWorkCard } from "@/components/academy/proof-of-work-card";
import { PathwayMasterySeal } from "@/components/academy/pathway-mastery-seal";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { CertificateVerifyQr } from "@/components/academy/certificate-verify-qr";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import { pageMetadata } from "@/lib/copy/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  const preview = parseSha256Hex(hash)?.slice(0, 12);
  const title = preview ? `Doğrula ${preview} · Akademi` : "Doğrula · Akademi";
  return pageMetadata({
    title,
    description:
      "Akademi sertifikasının SHA-256 bütünlük kaydı. Oturum istenmez; vatandaş kimliği gösterilmez.",
    path: `/academy/dogrula/${hash}`,
  });
}

function hashSubjectRow(label: string, body: string) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="text-xs text-[var(--foreground)]">{body}</dd>
    </div>
  );
}

function sealTone(status: AcademyCertificateSealStatus): "emerald" | "rose" | "amber" {
  if (status === "valid") {
    return "emerald";
  }
  if (status === "mismatch" || status === "revoked") {
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
  if (status === "revoked") {
    return copy.revoked;
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
  if (status === "revoked") {
    return copy.revokedBody;
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
  const resolution = await loadPublicAcademyVerifyByHash(hash);

  if (resolution == null) {
    return (
      <RoomFrame>
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={SEN_VOICE.academy.certificates.unbound}
        />
        <Card>{SEN_VOICE.academy.certificates.unbound}</Card>
      </RoomFrame>
    );
  }

  if (resolution.status === "invalid-format") {
    return (
      <RoomFrame>
        <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.invalidFormat} />
        <Card>
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
        <Card>
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

  if (resolution.kind === "pathway-mastery") {
    const view = resolution.view;
    return (
      <RoomFrame>
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.masteryTitle}
          description={copy.privacy}
          actions={
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          }
        />
        <Card variant="featured" title={copy.masteryTitle}>
          <dl className="mb-4 space-y-2 text-sm">
            {hashSubjectRow(copy.hashSubjectLabel, copy.hashSubjectPathway)}
          </dl>
          <PathwayMasterySeal mastery={view} boundToHolder={false} showVerify={false} />
        </Card>
      </RoomFrame>
    );
  }

  if (resolution.kind === "proof") {
    const view = resolution.view;
    return (
      <RoomFrame>
        <PageHeader
          eyebrow={copy.proofEyebrow}
          title={view.courseTitle}
          description={copy.privacy}
          actions={
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.catalogCta}
            </LinkButton>
          }
        />
        <Card variant="featured" title={view.kind === "curriculum" ? copy.proofCurriculumValid : copy.proofValid}>
          <Badge tone="emerald">
            {view.kind === "curriculum" ? copy.proofCurriculumValid : copy.proofValid}
          </Badge>
          <p className="mt-3">
            {view.kind === "curriculum" ? copy.proofCurriculumBody : copy.proofValidBody}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">{copy.privacy}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {hashSubjectRow(copy.hashSubjectLabel, copy.hashSubjectTask)}
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.proofKindLabel}
              </dt>
              <dd className="text-xs text-[var(--foreground)]">{view.integrityKind}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.algorithm}
              </dt>
              <dd className="break-all font-mono text-xs text-[var(--foreground)]">{view.proofOfWorkHash}</dd>
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
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.instructorLabel}
              </dt>
              <dd>Eğitmen {view.instructorName}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <ProofOfWorkCard
              model={{
                lessonTitle: view.lessonTitle ?? view.courseTitle,
                courseTitle: view.courseTitle,
                instructorName: view.instructorName,
                proofOfWorkHash: view.proofOfWorkHash,
                kind: view.kind,
              }}
              showDownload
              showHolder={false}
            />
          </div>
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
        {view.sealStatus === "valid" ? (
          <div className="mt-4">
            <CertificateSeal
              variant="diploma"
              hash={view.certificateHash}
              score={view.score}
              issuedAt={view.issuedAt}
              courseTitle={view.courseTitle}
              showCareerVisa={false}
            />
            <CertificateVerifyQr hash={view.certificateHash} />
          </div>
        ) : null}
        <p className="mt-3">{sealBody(view.sealStatus)}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{copy.privacy}</p>
        <dl className="mt-4 space-y-2 text-sm">
          {hashSubjectRow(copy.hashSubjectLabel, copy.hashSubjectPerson)}
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.integrityKindLabel}
            </dt>
            <dd className="text-xs text-[var(--foreground)]">{view.integrityKind}</dd>
          </div>
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
          {view.revokedAt ? (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.revokedLabel}
              </dt>
              <dd>{view.revokedAt.toLocaleString("tr-TR")}</dd>
            </div>
          ) : null}
        </dl>
        {view.courseSlug ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href={`/academy/${view.courseSlug}`} variant="outline" size="sm">
              {copy.courseCta}
            </LinkButton>
            {view.sealStatus === "valid" ? (
              <LinkButton href="/career" size="sm">
                {copy.careerVisaCta}
              </LinkButton>
            ) : null}
          </div>
        ) : view.sealStatus === "valid" ? (
          <div className="mt-4">
            <LinkButton href="/career" size="sm">
              {copy.careerVisaCta}
            </LinkButton>
          </div>
        ) : null}
        {view.pathwayMastery ? (
          <div className="mt-4">
            <PathwayMasterySeal mastery={view.pathwayMastery} boundToHolder={false} />
          </div>
        ) : null}
      </Card>
    </RoomFrame>
  );
}

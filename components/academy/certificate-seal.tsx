import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import type { Route } from "next";

export function CertificateSeal({
  hash,
  score,
  issuedAt,
  verifyHref,
  careerVisaHref = UX_SEN.bridge.examCareerHref,
  showCareerVisa = true,
  holderName,
  courseTitle,
  instructorName,
  variant = "ledger",
  revoked = false,
}: {
  hash: string;
  score?: number | null;
  issuedAt?: Date;
  verifyHref?: string;
  careerVisaHref?: string;
  showCareerVisa?: boolean;
  holderName?: string;
  courseTitle?: string;
  instructorName?: string;
  variant?: "ledger" | "diploma";
  revoked?: boolean;
}) {
  const copy = ACADEMY_SEN.certificates;
  const diploma = variant === "diploma" || Boolean(courseTitle);
  const holder = holderName?.trim() || ACADEMY_SEN.proof.anonymousHolder;
  const sealLabel = revoked ? ACADEMY_SEN.verify.revoked : copy.sealed;
  const careerAllowed = showCareerVisa && !revoked;

  if (!diploma) {
    return (
      <div className="space-y-2">
        <Badge tone={revoked ? "rose" : "gold"}>{sealLabel}</Badge>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.hashLabel}
        </p>
        <p className="break-all font-mono text-xs leading-5 text-[var(--foreground)]">{hash}</p>
        {score != null ? (
          <p className="text-xs text-[var(--muted)]">
            {copy.scoreLabel}: {score}
          </p>
        ) : null}
        {issuedAt ? (
          <p className="text-xs text-[var(--muted)]">
            {copy.issuedLabel}: {issuedAt.toLocaleString("tr-TR")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {verifyHref ? (
            <LinkButton href={verifyHref as Route} variant="outline" size="sm">
              {copy.verifyCta}
            </LinkButton>
          ) : null}
          {careerAllowed ? (
            <LinkButton href={careerVisaHref as Route} size="sm">
              {copy.careerVisaCta}
            </LinkButton>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border-2 border-[color-mix(in_srgb,var(--gold)_55%,var(--safir))] bg-[color-mix(in_srgb,#fbf6eb_88%,white)] px-6 py-8 shadow-[var(--shadow-lift)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border-8 border-[color-mix(in_srgb,var(--gold)_35%,transparent)]"
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
        {ACADEMY_SEN.course.certificateEyebrow}
      </p>
      <h3 className="mt-2 font-serif text-2xl tracking-tight text-[var(--foreground)]">{sealLabel}</h3>
      {courseTitle ? (
        <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{courseTitle}</p>
      ) : null}
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {ACADEMY_SEN.proof.studentLabel}
          </dt>
          <dd className="text-base font-medium text-[var(--foreground)]">{holder}</dd>
        </div>
        {instructorName ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {ACADEMY_SEN.proof.instructorLabel}
            </dt>
            <dd className="text-base text-[var(--foreground)]">Eğitmen {instructorName}</dd>
          </div>
        ) : null}
        {score != null ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.scoreLabel}
            </dt>
            <dd className="text-base text-[var(--foreground)]">{score}</dd>
          </div>
        ) : null}
        {issuedAt ? (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.issuedLabel}
            </dt>
            <dd className="text-base text-[var(--foreground)]">{issuedAt.toLocaleString("tr-TR")}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {ACADEMY_SEN.exam.forensicHash}
        </p>
        <p className="mt-1 break-all font-mono text-[11px] leading-5 text-[var(--muted)]">{hash}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {verifyHref ? (
          <LinkButton href={verifyHref as Route} size="sm">
            {copy.verifyCta}
          </LinkButton>
        ) : null}
        {careerAllowed ? (
          <LinkButton href={careerVisaHref as Route} variant="outline" size="sm">
            {copy.careerVisaCta}
          </LinkButton>
        ) : null}
      </div>
    </article>
  );
}

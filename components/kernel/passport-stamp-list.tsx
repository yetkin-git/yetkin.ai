import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CopyVisaValue } from "@/components/kernel/copy-visa-value";
import { VisaWaxSeal } from "@/components/kernel/visa-wax-seal";
import {
  formatPassportIssuedAt,
  passportAcademyVerifyHref,
  passportFreelancerContractHref,
  passportModuleLabel,
  passportSourceLabel,
} from "@/lib/kernel/passport/display";
import {
  ACADEMY_STAMP_SURFACE_PATH,
  CAREER_STAMP_SURFACE_PATH,
  FREELANCER_STAMP_SURFACE_PATH,
  type SealedPassportStamp,
} from "@/lib/kernel/passport/types";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function PassportStampList({ stamps }: { stamps: SealedPassportStamp[] }) {
  const copy = SEN_VOICE.pasaport;
  const list = copy.list;

  return (
    <Card
      title={list.title}
      eyebrow={list.eyebrow}
      bodyClassName="text-[var(--foreground)]"
      className="shadow-sm"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{list.intro}</p>
      {stamps.length === 0 ? (
        <div className="space-y-4">
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
            {list.empty}
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href={ACADEMY_STAMP_SURFACE_PATH} variant="primary" size="sm">
              {copy.academyCta}
            </LinkButton>
            <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="secondary" size="sm">
              {copy.freelancerCta}
            </LinkButton>
            <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="ghost" size="sm">
              {copy.careerCta}
            </LinkButton>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4">
          {stamps.map((stamp) => {
            const verifyHref = passportAcademyVerifyHref(stamp);
            const contractHref = passportFreelancerContractHref(stamp);
            const academy = stamp.sourceKind === "ACADEMY_CERTIFICATE";
            const sealed = Boolean(verifyHref || contractHref);
            return (
              <li key={stamp.id}>
                <article className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
                  <div className="flex items-start gap-4">
                    <VisaWaxSeal sourceKind={stamp.sourceKind} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-[var(--muted)]">
                        {formatPassportIssuedAt(stamp.issuedAt)}
                      </p>
                      <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
                        {stamp.title}
                      </h3>
                      <p className="text-[11px] text-[var(--muted)]">
                        {passportModuleLabel(stamp.moduleId)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={academy ? "safir" : "emerald"}>
                          {passportSourceLabel(stamp.sourceKind)}
                        </Badge>
                        {sealed ? <Badge tone="gold">{list.sealed}</Badge> : null}
                      </div>
                      <p className="mt-3 text-sm font-medium text-[var(--safir-deep)]">
                        {list.doorHint}
                      </p>
                    </div>
                  </div>
                  <CopyVisaValue value={stamp.visaKey} label={list.copyVisa} />
                  {stamp.certificateHash ? (
                    <CopyVisaValue value={stamp.certificateHash} label={list.hashLabel} />
                  ) : null}
                  {verifyHref || contractHref ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {contractHref ? (
                        <LinkButton href={contractHref} variant="primary" size="sm">
                          {list.openContractCta}
                        </LinkButton>
                      ) : null}
                      {verifyHref ? (
                        <LinkButton href={verifyHref} variant="outline" size="sm">
                          {list.verifyCta}
                        </LinkButton>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

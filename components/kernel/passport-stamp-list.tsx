import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconLock } from "@/components/ui/icons";
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
  buildPassportGrowthCard,
  PASSPORT_GROWTH_LOCKED_LABEL,
  passportFreelancerStamps,
  passportGrowthDoorLabel,
  passportNonGrowthAcademyStamps,
  passportStampCourseHref,
  passportStampCourseSlug,
  type PassportGrowthSlot,
} from "@/lib/kernel/passport/growth-card";
import {
  ACADEMY_STAMP_SURFACE_PATH,
  CAREER_STAMP_SURFACE_PATH,
  FREELANCER_STAMP_SURFACE_PATH,
  type SealedPassportStamp,
} from "@/lib/kernel/passport/types";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

function StampArticle({ stamp }: { stamp: SealedPassportStamp }) {
  const copy = SEN_VOICE.pasaport;
  const list = copy.list;
  const verifyHref = passportAcademyVerifyHref(stamp);
  const contractHref = passportFreelancerContractHref(stamp);
  const courseHref = passportStampCourseHref(stamp);
  const academy = stamp.sourceKind === "ACADEMY_CERTIFICATE";
  const sealed = Boolean(verifyHref || contractHref);
  const slug = passportStampCourseSlug(stamp);
  const door = slug ? passportGrowthDoorLabel(slug) : null;

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        <VisaWaxSeal sourceKind={stamp.sourceKind} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[var(--muted)]">{formatPassportIssuedAt(stamp.issuedAt)}</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {stamp.title}
          </h3>
          <p className="text-[11px] text-[var(--muted)]">{passportModuleLabel(stamp.moduleId)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={academy ? "safir" : "emerald"}>{passportSourceLabel(stamp.sourceKind)}</Badge>
            {sealed ? <Badge tone="gold">{list.sealed}</Badge> : null}
          </div>
          {door ? (
            <p className="mt-3 text-sm font-medium text-[var(--safir-deep)]">
              {copy.growth.eyebrow}: {door}
            </p>
          ) : null}
        </div>
      </div>
      <CopyVisaValue value={stamp.visaKey} label={list.copyVisa} />
      {stamp.certificateHash ? (
        <CopyVisaValue value={stamp.certificateHash} label={list.hashLabel} />
      ) : null}
      {verifyHref || contractHref || courseHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {courseHref ? (
            <LinkButton href={courseHref} variant="outline" size="sm">
              {list.openCourseCta}
            </LinkButton>
          ) : null}
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
  );
}

function GrowthSlotCard({ slot }: { slot: PassportGrowthSlot }) {
  const copy = SEN_VOICE.pasaport;
  return (
    <li>
      <article
        data-passport-growth-slot={slot.slug}
        data-passport-growth-held={slot.held ? "true" : "false"}
        className={`flex h-full flex-col rounded-[var(--radius-card)] border p-3 ${
          slot.held
            ? "border-[var(--border)] bg-[var(--surface)] shadow-sm"
            : "border-dashed border-[var(--border)] bg-[var(--surface-muted)]"
        }`}
      >
        <div className="flex items-start gap-3">
          {slot.held ? (
            <VisaWaxSeal sourceKind="ACADEMY_CERTIFICATE" size="sm" />
          ) : (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--border)] text-[var(--muted)]"
              aria-hidden
            >
              <IconLock className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {slot.skuCode ? (
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {slot.skuCode}
              </p>
            ) : null}
            <h3 className="mt-0.5 text-sm font-semibold tracking-tight text-[var(--foreground)]">
              {slot.doorLabel}
            </h3>
            {slot.held ? (
              <Badge tone="gold" className="mt-2">
                {copy.list.sealed}
              </Badge>
            ) : (
              <p className="mt-2 text-xs text-[var(--muted)]">{PASSPORT_GROWTH_LOCKED_LABEL}</p>
            )}
          </div>
        </div>
        <div className="mt-3">
          <LinkButton href={slot.href} variant={slot.held ? "outline" : "ghost"} size="sm">
            {copy.list.openCourseCta}
          </LinkButton>
        </div>
      </article>
    </li>
  );
}

export function PassportStampList({ stamps }: { stamps: SealedPassportStamp[] }) {
  const copy = SEN_VOICE.pasaport;
  const list = copy.list;
  const growth = buildPassportGrowthCard(stamps);
  const freelancer = passportFreelancerStamps(stamps);
  const extraAcademy = passportNonGrowthAcademyStamps(stamps);
  const ledger = [...freelancer, ...extraAcademy];

  return (
    <Card
      title={list.title}
      eyebrow={list.eyebrow}
      bodyClassName="text-[var(--foreground)]"
      className="shadow-sm"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{list.intro}</p>
      <section data-passport-growth-card="" className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          {copy.growth.eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
          {copy.growth.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.growth.intro}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {growth.map((slot) => (
            <GrowthSlotCard key={slot.slug} slot={slot} />
          ))}
        </ul>
      </section>
      <section className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          {copy.freelancerStrip.title}
        </h3>
        {freelancer.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--muted)]">
            {copy.freelancerStrip.empty}
          </p>
        ) : (
          <ul className="grid gap-4">
            {freelancer.map((stamp) => (
              <li key={stamp.id}>
                <StampArticle stamp={stamp} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {extraAcademy.length > 0 ? (
        <ul className="mb-6 grid gap-4">
          {extraAcademy.map((stamp) => (
            <li key={stamp.id}>
              <StampArticle stamp={stamp} />
            </li>
          ))}
        </ul>
      ) : null}
      {ledger.length === 0 && stamps.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          <LinkButton href={ACADEMY_STAMP_SURFACE_PATH} variant="primary" size="sm">
            {copy.academyCta}
          </LinkButton>
          <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="secondary" size="sm">
            {copy.freelancerBoardCta}
          </LinkButton>
          <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="ghost" size="sm">
            {copy.careerCta}
          </LinkButton>
        </div>
      ) : null}
    </Card>
  );
}

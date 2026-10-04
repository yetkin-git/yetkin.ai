import { VisaPageFrame, VisaWaxSeal } from "@/components/kernel/visa-wax-seal";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { CAREER_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/** Oturumsuz Kariyer. Kişisel vize defteri ve kimlik burada yok. */
export function PublicCareerPanel() {
  const copy = SEN_VOICE.career.publicRoom;

  return (
    <RoomFrame data-public-view="career">
      <JsonLd data={jsonLdDocument([faqPageJsonLd(CAREER_LANDING_FAQ)])} />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.lead}
        actions={
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/academy/dogrula" size="sm">
              {copy.verifyCta}
            </LinkButton>
            <LinkButton href="/academy" variant="outline" size="sm">
              {copy.academyCta}
            </LinkButton>
            <LinkButton href="/login" variant="secondary" size="sm">
              {copy.loginCta}
            </LinkButton>
          </div>
        }
      />
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
        <SampleCertificate />
        <Card title={copy.stepsTitle}>
          <p className="text-[var(--foreground)]">{copy.stepsLead}</p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--foreground)]">
            {copy.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-5">
            <LinkButton href="/academy/dogrula" size="sm">
              {copy.verifyCta}
            </LinkButton>
          </div>
        </Card>
      </div>
      <LandingFaq heading={SEN_VOICE.career.faqHeading} items={CAREER_LANDING_FAQ} />
    </RoomFrame>
  );
}

function SampleCertificate() {
  const copy = SEN_VOICE.career.publicRoom;

  return (
    <figure aria-label={copy.sampleTitle} data-sample-certificate="true">
      <VisaPageFrame className="px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
              {copy.sampleEyebrow}
            </p>
            <h2 className="mt-2 font-serif text-2xl tracking-tight text-[var(--foreground)]">
              {copy.sampleTitle}
            </h2>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{copy.sampleCourse}</p>
          </div>
          <VisaWaxSeal sourceKind="ACADEMY_CERTIFICATE" size="lg" />
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.sampleHolderLabel}
            </dt>
            <dd className="text-base font-medium text-[var(--foreground)]">{copy.sampleHolder}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.sampleScoreLabel}
            </dt>
            <dd className="text-base font-medium tabular-nums text-[var(--foreground)]">
              {copy.sampleScore}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.sampleStatus}
            </dt>
            <dd className="text-sm leading-6 text-[var(--foreground)]">{copy.sampleNote}</dd>
          </div>
        </dl>
      </VisaPageFrame>
    </figure>
  );
}

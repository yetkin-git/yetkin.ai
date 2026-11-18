import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

const PREVIEW = 8;

export function MeritSealBand({
  stamps,
  proofCount,
  publicTalentHref,
}: {
  stamps: readonly { id: string; title: string }[];
  proofCount: number;
  publicTalentHref: string | null;
}) {
  const copy = CAREER_SEN.merit;
  const scope = CAREER_SEN.scope;

  if (stamps.length === 0) {
    return (
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_28%,transparent)] bg-[var(--surface)] shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[var(--safir)] via-indigo-500 to-emerald-500" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div
            className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.35rem] bg-[color-mix(in_srgb,var(--safir)_10%,white)] text-[var(--safir-deep)] ring-1 ring-[color-mix(in_srgb,var(--safir)_22%,transparent)]"
            aria-hidden
          >
            <IconBadge className="h-9 w-9" />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
              <IconLock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.title}</h2>
            <p data-merit-seal="empty" className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {CAREER_SEN.proofEmpty}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:min-w-52">
            <LinkButton href="#yetkincv" variant="primary" size="sm">
              YetkinCV testini aç
            </LinkButton>
            <LinkButton href="/tezgah" variant="outline" size="sm">
              {CAREER_SEN.academyCta}
            </LinkButton>
          </div>
        </div>
      </section>
    );
  }

  const preview = stamps.slice(0, PREVIEW);
  const rest = stamps.slice(PREVIEW);

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} dense>
      <div data-merit-seal="ready" className="space-y-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          {stamps.length} doğrulanmış rozet
        </p>
        <ul className="flex flex-wrap gap-2">
          {preview.map((stamp) => (
            <li
              key={stamp.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-medium text-emerald-950"
            >
              <IconBadge className="h-3.5 w-3.5 text-emerald-600" />
              {stamp.title}
            </li>
          ))}
        </ul>
        {rest.length > 0 ? (
          <details>
            <summary className="cursor-pointer text-xs font-medium text-[var(--safir-deep)]">
              +{rest.length} {copy.moreSuffix}
            </summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {rest.map((stamp) => (
                <li
                  key={stamp.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-medium text-emerald-950"
                >
                  <IconBadge className="h-3.5 w-3.5 text-emerald-600" />
                  {stamp.title}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">{scope.benefitResume}</p>
            {publicTalentHref ? (
              <div className="mt-2">
                <LinkButton href={publicTalentHref as Route} variant="outline" size="sm">
                  {scope.publicCardCta}
                </LinkButton>
              </div>
            ) : (
              <p className="mt-1 text-xs">{copy.resumeMissing}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">{scope.benefitProof}</p>
            <p className="mt-1 text-xs">
              {proofCount > 0 ? `${proofCount} ${copy.proofReady}` : copy.proofMissing}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

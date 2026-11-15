import type { Route } from "next";
import { Card } from "@/components/ui/card";
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
      <Card eyebrow={copy.eyebrow} title={copy.title} dense>
        <p data-merit-seal="empty">{CAREER_SEN.proofEmpty}</p>
        <div className="mt-3">
          <LinkButton href="/academy" variant="outline" size="sm">
            {CAREER_SEN.academyCta}
          </LinkButton>
        </div>
      </Card>
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
              className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] px-2.5 py-1 text-xs text-[var(--foreground)]"
            >
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
                  className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] px-2.5 py-1 text-xs text-[var(--foreground)]"
                >
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

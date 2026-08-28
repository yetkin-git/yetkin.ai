import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import {
  latestPassportStamp,
  passportSourceLabel,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import {
  CAREER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
  type PassportStampSourceKind,
  type SealedPassportStamp,
} from "@/lib/kernel/passport/types";

const SOURCE_TONE: Record<PassportStampSourceKind, "safir" | "emerald"> = {
  ACADEMY_CERTIFICATE: "safir",
  FREELANCER_RELEASE: "emerald",
};

export function IdentityMeritSummary({
  stamps,
  soft = false,
}: {
  stamps: readonly SealedPassportStamp[];
  soft?: boolean;
}) {
  const copy = SEN_VOICE.profil;
  const merit = copy.merit;
  const latest = latestPassportStamp(stamps);
  const sourceKinds = soft
    ? []
    : ([...new Set(stamps.map((stamp) => stamp.sourceKind))] as PassportStampSourceKind[]);

  return (
    <Card title={merit.title} eyebrow={merit.eyebrow} bodyClassName="text-[var(--foreground)]" className="shadow-sm">
      <p className="mb-4 text-sm text-[var(--muted)]">{merit.intro}</p>
      {soft ? (
        <p className="mb-4 text-sm text-[var(--muted)]">{merit.loadSoft}</p>
      ) : stamps.length === 0 ? (
        <p className="mb-4 rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--muted)]">
          {merit.empty}
        </p>
      ) : (
        <dl className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {merit.countLabel}
            </dt>
            <dd className="mt-1 text-lg font-semibold tracking-tight">{stamps.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {merit.latestLabel}
            </dt>
            <dd className="mt-1 text-sm font-medium">{latest?.title ?? PASSPORT_UNSET_LABEL}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {merit.sourcesLabel}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {sourceKinds.map((kind) => (
                <Badge key={kind} tone={SOURCE_TONE[kind]}>
                  {passportSourceLabel(kind)}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>
      )}
      <div className="flex flex-wrap gap-2">
        <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
          {copy.passportCta}
        </LinkButton>
        <LinkButton href={WALLET_SURFACE_PATH} variant="outline" size="sm">
          {copy.walletCta}
        </LinkButton>
        <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="ghost" size="sm">
          {copy.careerCta}
        </LinkButton>
      </div>
    </Card>
  );
}

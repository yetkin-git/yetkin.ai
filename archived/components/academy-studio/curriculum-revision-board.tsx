import { CurriculumRevisionApproveButton } from "@/archived/components/academy-studio/curriculum-revision-approve-button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type {
  AcademyCurriculumRevisionRecord,
  AcademySeedUpdateLogEntry,
} from "@/archived/lib/academy-studio/curriculum-revisions";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
  ADMIN_SURFACE_PATH,
} from "@/lib/kernel/admin/types";

function RevisionEmptyActions() {
  const copy = ACADEMY_SEN.revisions;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <LinkButton href={ADMIN_SURFACE_PATH} variant="primary" size="sm">
        {copy.catalogCta}
      </LinkButton>
      <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="secondary" size="sm">
        {copy.academyCta}
      </LinkButton>
      <LinkButton href={ADMIN_FREELANCER_SHELTER_PATH} variant="outline" size="sm">
        {copy.freelancerCta}
      </LinkButton>
      <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size="sm">
        {copy.dashboardCta}
      </LinkButton>
    </div>
  );
}

export function CurriculumRevisionBoard({
  pending,
  log,
}: {
  pending: readonly AcademyCurriculumRevisionRecord[];
  log: readonly AcademySeedUpdateLogEntry[];
}) {
  const copy = ACADEMY_SEN.revisions;
  return (
    <div className="space-y-6">
      <Card
        eyebrow={copy.queueEyebrow}
        title={copy.queueTitle}
        bodyClassName="text-[var(--foreground)]"
      >
        {pending.length === 0 ? (
          <div className="space-y-1">
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
              {copy.empty}
            </p>
            <p className="pt-2 text-sm text-[var(--muted)]">{copy.emptyHint}</p>
            <RevisionEmptyActions />
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-xs text-[var(--muted)]">
                    {copy.courseLabel}: {row.courseSlug}
                  </p>
                  {row.lessonKey ? (
                    <p className="text-xs text-[var(--muted)]">
                      {copy.lessonLabel}: {row.lessonKey}
                    </p>
                  ) : null}
                  <p className="text-sm text-[var(--foreground)]">{row.comment}</p>
                </div>
                <CurriculumRevisionApproveButton revisionId={row.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card eyebrow={copy.logEyebrow} title={copy.logTitle} bodyClassName="text-[var(--foreground)]">
        {log.length === 0 ? (
          <div className="space-y-1">
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
              {copy.logEmpty}
            </p>
            <p className="pt-2 text-sm text-[var(--muted)]">{copy.logEmptyHint}</p>
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {log.map((row) => (
              <li key={row.id}>
                {copy.fromLabel} {row.fromVersion} → {row.toVersion} · {row.courseSlug}
                {row.lessonKey ? ` · ${row.lessonKey}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

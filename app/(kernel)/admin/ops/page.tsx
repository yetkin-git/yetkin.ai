import type { Metadata } from "next";
import { AdminCatalogList } from "@/components/kernel/admin-catalog-list";
import { AdminOpsActions } from "@/components/kernel/admin-ops-actions";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { loadLicenseGapSnapshot } from "@/app/api/(kernel)/payments/license-gap-runtime";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadAdminCatalogBoard } from "@/lib/kernel/admin/load";
import { loadAdminOpsReadout } from "@/lib/kernel/admin/ops-load";
import { projectAdminOpsBoard, type AdminOpsView } from "@/lib/kernel/admin/ops-desk";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";
import type { LicenseGapSnapshot } from "@/lib/kernel/payments/license-gap";

export const metadata: Metadata = {
  title: "Operasyon",
  robots: { index: false, follow: false },
};

export default async function AdminOpsPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const copy = ADMIN_SEN.ops;
  const adminUser = access.kind === "ok" ? access.user : null;
  const [readout, catalog] = adminUser
    ? await Promise.all([loadAdminOpsReadout(adminUser), loadAdminCatalogBoard(adminUser)])
    : [null, null];
  let snapshot: LicenseGapSnapshot | null = null;
  let snapshotFailed = false;
  if (readout?.access === "ok") {
    try {
      snapshot = await loadLicenseGapSnapshot();
    } catch {
      snapshotFailed = true;
    }
  }
  const view =
    readout?.access === "ok"
      ? projectAdminOpsBoard({
          readout: readout.readout,
          snapshot: snapshotFailed ? null : snapshot,
          now: new Date(),
        })
      : null;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href={ADMIN_SURFACE_PATH} variant="ghost" size="sm">
            {copy.back}
          </LinkButton>
        }
      />
      {!signedIn ? (
        <AuthNeeded message={ADMIN_SEN.auth} />
      ) : !isAdmin || readout?.access === "forbidden" || catalog?.access === "forbidden" ? (
        <Forbidden message={ADMIN_SEN.forbidden} />
      ) : readout?.access === "unavailable" || !view ? (
        <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p>
      ) : (
        <div className="space-y-4">
          <EventDesk view={view} />
          <Card eyebrow={copy.actionsEyebrow} title={copy.actionsTitle}>
            <p className="mb-4 text-sm text-[var(--muted)]">{copy.actionsBody}</p>
            {catalog?.access === "ok" ? (
              <AdminCatalogList entries={catalog.entries} coursePublish={catalog.coursePublish} />
            ) : (
              <p className="mb-4 text-sm text-[var(--muted)]">{ADMIN_SEN.loadSoft}</p>
            )}
            <AdminOpsActions
              slugs={
                catalog?.access === "ok" ? catalog.coursePublish.map((row) => row.slug) : []
              }
              gaps={view.gaps}
            />
          </Card>
          <SealDesk view={view} />
        </div>
      )}
    </RoomFrame>
  );
}

function EventDesk({ view }: { view: AdminOpsView }) {
  const copy = ADMIN_SEN.ops;
  return (
    <Card eyebrow={copy.eventEyebrow} title={copy.eventTitle}>
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.eventBody}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold">{copy.gapsTitle}</h3>
          {view.gapCount === null ? (
            <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              CLEARED {view.clearedLicenseOrders} · eksik {view.gapCount} · iade ile kapanmış{" "}
              {view.compensatedCount} · kayıtlı license_gap {view.licenseGapAnomalyCount}
            </p>
          )}
        </section>
        <section>
          <h3 className="text-sm font-semibold">{copy.ghostTitle}</h3>
          <p className="text-sm text-[var(--muted)]">
            {view.ghosts.count} · {view.ghosts.grossLabel}
          </p>
          <p className="text-xs text-[var(--muted)]">{copy.ghostHint}</p>
        </section>
      </div>
      <h3 className="mt-4 text-sm font-semibold">{copy.pendingTitle}</h3>
      <p className="text-sm text-[var(--muted)]">
        {view.pending.total} PENDING · tavan aşımı {view.pending.timedOut} · en yaşlı {view.pending.oldestHours} sa
      </p>
      {view.pending.rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.emptyPending}</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {view.pending.rows.map((row) => (
            <li key={row.merchantOid}>
              {row.merchantOid} · {row.amountLabel} · {row.ageHours} sa · {row.stale} · {row.userMasked}
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-4 text-sm font-semibold">{copy.anomaliesTitle}</h3>
      {view.anomalies.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.emptyAnomalies}</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {view.anomalies.map((row) => (
            <li key={`${row.kind}-${row.merchantOid}-${row.at}`}>
              {row.kind} · {row.merchantOid} · {row.amounts} · {row.at}
              <span className="block text-[var(--muted)]">{row.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SealDesk({ view }: { view: AdminOpsView }) {
  const copy = ADMIN_SEN.ops;
  return (
    <Card eyebrow={copy.sealEyebrow} title={copy.sealTitle}>
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.sealBody}</p>
      {view.audits.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.emptyAudits}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {view.audits.map((row) => (
            <li key={`${row.action}-${row.at}-${row.target}`}>
              {row.at} · {row.action} · {row.target} · {row.actorMasked}
              <span className="block text-[var(--muted)]">{row.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

import { AdminAuditChambers } from "@/components/kernel/admin-audit-chambers";
import { AdminCatalogList } from "@/components/kernel/admin-catalog-list";
import { AdminPriceDecisionLedger } from "@/components/kernel/admin-price-decision-ledger";
import { AdminShelterActions } from "@/components/kernel/admin-shelter-actions";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Forbidden } from "@/components/ui/forbidden";
import { IconCoin, IconLock, IconShield } from "@/components/ui/icons";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import {
  HOLD_BPS_BAND_LABEL,
  countCatalogBpsEntries,
  countCatalogModules,
} from "@/lib/kernel/admin/display";
import { loadAdminCatalogBoard } from "@/lib/kernel/admin/load";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function AdminPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const board = access.kind === "ok" ? await loadAdminCatalogBoard(access.user.id) : null;
  const entries = board?.access === "ok" ? board.entries : [];
  const decisions = board?.access === "ok" ? board.decisions : [];
  const live = board?.access === "ok";
  const copy = SEN_VOICE.admin;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={<AdminShelterActions />}
      />
      <StatGrid
        columns={3}
        items={[
          {
            label: copy.stats.catalogLabel,
            value: live
              ? String(entries.length)
              : signedIn
                ? isAdmin
                  ? "—"
                  : copy.stats.locked
                : copy.stats.guest,
            hint: live
              ? copy.stats.catalogHintLive(REQUIRED_CATALOG_DEFINITIONS.length)
              : copy.stats.catalogHintPending,
            icon: <IconShield />,
          },
          {
            label: copy.stats.moduleLabel,
            value: live
              ? String(countCatalogModules(entries))
              : signedIn
                ? isAdmin
                  ? copy.stats.waiting
                  : "—"
                : "—",
            hint: copy.stats.moduleHint,
            icon: <IconLock />,
          },
          {
            label: copy.stats.holdLabel,
            value: HOLD_BPS_BAND_LABEL,
            hint: live
              ? copy.stats.holdHintLive(countCatalogBpsEntries(entries))
              : copy.stats.holdHintPending,
            icon: <IconCoin />,
          },
        ]}
      />
      {!signedIn ? (
        <AuthNeeded message={copy.auth} />
      ) : !isAdmin || board?.access === "forbidden" ? (
        <Forbidden message={copy.forbidden} />
      ) : board?.access === "unavailable" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
          <AdminShelterActions soft />
          <AdminAuditChambers />
          <AdminCatalogList entries={[]} showEmptyActions={false} />
        </div>
      ) : (
        <div className="space-y-4">
          <AdminAuditChambers />
          <AdminPriceDecisionLedger decisions={decisions} />
          <AdminCatalogList entries={entries} />
        </div>
      )}
      <Card variant="ink" title={copy.honestyTitle} bodyClassName="text-white/70">
        {copy.honestyBody(HOLD_BPS_BAND_LABEL)}
      </Card>
    </RoomFrame>
  );
}

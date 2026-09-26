import { AdminAuditChambers } from "@/components/kernel/admin-audit-chambers";
import { AdminCatalogList } from "@/components/kernel/admin-catalog-list";
import { AdminFunnelBoard } from "@/components/kernel/admin-funnel-board";
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
import { loadAdminFunnelBoard } from "@/lib/kernel/admin/funnel-load";
import { coerceFunnelRange } from "@/lib/kernel/admin/funnel-window";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import { AdminCatalogAmountForm } from "@/components/kernel/admin-catalog-amount-form";
import {
  OFF_201_CATALOG_MODULE_KEY,
  OFF_201_CATALOG_UNIT_KEY,
  off201CatalogPriceIsSet,
} from "@/lib/academy/off201-catalog-slot";
import { logEvent } from "@/lib/kernel/observability/log";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const params = await searchParams;
  const funnelRange = coerceFunnelRange(params.range);
  const [board, funnel] =
    access.kind === "ok"
      ? await Promise.all([
          loadAdminCatalogBoard(access.user),
          loadAdminFunnelBoard(access.user, funnelRange),
        ])
      : [null, null];
  const entries = board?.access === "ok" ? board.entries : [];
  const decisions = board?.access === "ok" ? board.decisions : [];
  const live = board?.access === "ok";
  const off201PriceUnset = live && !off201CatalogPriceIsSet(entries);
  const copy = SEN_VOICE.admin;
  if (off201PriceUnset) {
    logEvent({
      level: "info",
      event: "academy.off201.catalog_price_unset",
      action: "super_admin_notice",
      purpose: "off201_prep_ready",
      route: "/admin",
    });
  }

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
          <AdminFunnelBoard board={funnel} range={funnelRange} />
          <AdminAuditChambers />
          <AdminCatalogList entries={[]} showEmptyActions={false} />
        </div>
      ) : (
        <div className="space-y-4">
          {off201PriceUnset ? (
            <Card title={copy.off201PriceUnset.title} eyebrow="OFF-201">
              <p className="text-sm text-[var(--muted)]">{copy.off201PriceUnset.body}</p>
              <div className="mt-3 flex justify-end">
                <AdminCatalogAmountForm
                  moduleKey={OFF_201_CATALOG_MODULE_KEY}
                  unitKey={OFF_201_CATALOG_UNIT_KEY}
                  unitType="MINOR"
                  initialAmountMinor={0}
                />
              </div>
            </Card>
          ) : null}
          <AdminFunnelBoard board={funnel} range={funnelRange} />
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

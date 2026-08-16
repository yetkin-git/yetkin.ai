import { AdminCatalogList } from "@/components/kernel/admin-catalog-list";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const board = access.kind === "ok" ? await loadAdminCatalogBoard(access.user.id) : null;
  const entries = board?.access === "ok" ? board.entries : [];
  const live = board?.access === "ok";

  return (
    <RoomFrame>
      <PageHeader
        eyebrow="Platform idaresi"
        title="Admin"
        description="Fiyat birimleri PriceCatalogEntry sicilinden okunur. Satış fiyatı kod sabiti değildir. Super Admin amountMinor değerini tamsayı olarak günceller."
      />
      <StatGrid
        columns={3}
        items={[
          {
            label: "Katalog",
            value: live ? String(entries.length) : signedIn ? (isAdmin ? "—" : "Kilitli") : "Oturum yok",
            hint: live
              ? `Ops tohumu ${REQUIRED_CATALOG_DEFINITIONS.length} birim bekler`
              : "Bağlanınca sicil dolar",
            icon: <IconShield />,
          },
          {
            label: "Modül",
            value: live ? String(countCatalogModules(entries)) : signedIn ? (isAdmin ? "Bekleniyor" : "—") : "—",
            hint: "moduleKey grupları",
            icon: <IconLock />,
          },
          {
            label: "Hold bandı",
            value: HOLD_BPS_BAND_LABEL,
            hint: live
              ? `${countCatalogBpsEntries(entries)} BPS satırı — kod tavanı %10–15`
              : "S11-A kod kilidi, veri değil",
            icon: <IconCoin />,
          },
        ]}
      />
      {!signedIn ? (
        <AuthNeeded message="Admin kataloğu oturum ister. Sahte fiyat basılmaz." />
      ) : !isAdmin || board?.access === "forbidden" ? (
        <Forbidden message="Bu sığınak Super Admin kilidine bağlıdır. SUPER_ADMIN_USER_ID eşleşmezse katalog okunmaz." />
      ) : board?.access === "unavailable" ? (
        <div className="space-y-3">
          <Badge tone="amber">Liste henüz yüklenemedi — örnek düzen</Badge>
          <p className="text-sm text-[var(--muted)]">
            Veritabanı bağlanınca gerçek PriceCatalogEntry satırları burada durur. Uydurma fiyat
            yok.
          </p>
          <AdminCatalogList entries={[]} />
        </div>
      ) : (
        <AdminCatalogList entries={entries} />
      )}
      <Card variant="ink" title="Fiyat veridir" bodyClassName="text-white/70">
        Super Admin amountMinor günceller; updatedBy oturum kimliğidir. Platform payı kodda{" "}
        {HOLD_BPS_BAND_LABEL} bandındadır — katalog satırı o tavanı aşamaz. Gayri-admin istek 403
        döner.
      </Card>
    </RoomFrame>
  );
}

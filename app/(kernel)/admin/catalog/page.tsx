import { AdminCatalogList } from "@/components/kernel/admin-catalog-list";
import { AdminShelterActions } from "@/components/kernel/admin-shelter-actions";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Forbidden } from "@/components/ui/forbidden";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { loadAdminCatalogBoard } from "@/lib/kernel/admin/load";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/** Super Admin fiyat ve yayın tahtası. Kapı `/admin` ile aynı: `resolveSuperAdminAccess`. */
export default async function AdminCatalogPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const board = access.kind === "ok" ? await loadAdminCatalogBoard(access.user) : null;
  const entries = board?.access === "ok" ? board.entries : [];
  const coursePublish = board?.access === "ok" ? board.coursePublish : [];
  const copy = SEN_VOICE.admin;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.catalogEyebrow}
        title={copy.catalogTitle}
        description={copy.catalogIntro}
        actions={access.kind === "ok" ? <AdminShelterActions /> : undefined}
      />
      {!signedIn ? (
        <AuthNeeded message={copy.auth} />
      ) : access.kind === "forbidden" || board?.access === "forbidden" ? (
        <Forbidden message={copy.forbidden} />
      ) : board?.access === "unavailable" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
          <AdminShelterActions soft />
          <AdminCatalogList entries={[]} coursePublish={coursePublish} showEmptyActions={false} />
        </div>
      ) : (
        <AdminCatalogList entries={entries} coursePublish={coursePublish} />
      )}
    </RoomFrame>
  );
}

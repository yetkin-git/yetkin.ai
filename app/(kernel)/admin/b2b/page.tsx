import type { Metadata } from "next";
import { AdminB2bDesk } from "@/components/kernel/admin-b2b-desk";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadB2bBoard } from "@/lib/kernel/admin/b2b-load";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";

export const metadata: Metadata = {
  title: "B2B Fırsat Motoru",
  robots: { index: false, follow: false },
};

export default async function AdminB2bPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const copy = ADMIN_SEN.b2b;
  const board = access.kind === "ok" ? await loadB2bBoard(access.user) : null;

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
      ) : !isAdmin || board?.access === "forbidden" ? (
        <Forbidden message={ADMIN_SEN.forbidden} />
      ) : board?.access !== "ok" ? (
        <p className="text-sm text-[var(--muted)]">{copy.unavailable}</p>
      ) : (
        <AdminB2bDesk board={board.board} />
      )}
    </RoomFrame>
  );
}

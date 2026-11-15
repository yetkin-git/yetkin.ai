import type { Metadata } from "next";
import { AdminSocialDesk } from "@/components/kernel/admin-social-desk";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadSocialBoard } from "@/lib/kernel/admin/social-load";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";

export const metadata: Metadata = {
  title: "Sosyal Medya Masası",
  robots: { index: false, follow: false },
};

export default async function AdminSocialPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const copy = ADMIN_SEN.social;
  const board = access.kind === "ok" ? await loadSocialBoard(access.user) : null;

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
      ) : board?.access === "unavailable" ? (
        <AdminSocialDesk connections={board.connections} items={[]} unavailable />
      ) : board?.access === "ok" ? (
        <AdminSocialDesk connections={board.board.connections} items={board.board.items} />
      ) : null}
    </RoomFrame>
  );
}

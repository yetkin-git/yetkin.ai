import type { Metadata } from "next";
import { AdminOutreachDesk } from "@/components/kernel/admin-outreach-desk";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadOutreachBoard } from "@/lib/kernel/outreach/load";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";

export const metadata: Metadata = {
  title: "Otonom Outreach Kokpiti",
  robots: { index: false, follow: false },
};

export default async function AdminOutreachPage() {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const copy = ADMIN_SEN.outreach;
  const board = access.kind === "ok" ? await loadOutreachBoard(access.user) : null;

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
        <AdminOutreachDesk board={board.board} />
      )}
    </RoomFrame>
  );
}

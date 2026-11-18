import type { Metadata } from "next";
import { AdminB2bDesk } from "@/components/kernel/admin-b2b-desk";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadB2bBoard } from "@/lib/kernel/admin/b2b-load";
import { loadKurumsalOfferBoard } from "@/lib/kernel/admin/kurumsal-offer-load";
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
  const offers = access.kind === "ok" ? await loadKurumsalOfferBoard(access.user) : null;

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
        <div className="space-y-8">
          <Card title={copy.offersTitle}>
            <p className="text-sm text-[var(--muted)]">{copy.offersBody}</p>
            {offers?.access === "unavailable" ? (
              <p className="mt-3 text-sm text-[var(--muted)]">{copy.offersUnavailable}</p>
            ) : offers?.access === "ok" && offers.rows.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">{copy.offersEmpty}</p>
            ) : offers?.access === "ok" ? (
              <ul className="mt-4 divide-y divide-[var(--border)]">
                {offers.rows.map((row) => (
                  <li key={row.id} className="py-3 text-sm">
                    <p className="font-medium text-[var(--foreground)]">
                      {row.companyName}
                      <span className="ml-2 font-normal text-[var(--muted)]">{row.city}</span>
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {copy.offersPackage}: {row.packageLabel}
                      <span className="mx-2">·</span>
                      {row.email}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {copy.offersWhen}: {row.createdAt.slice(0, 16).replace("T", " ")}
                    </p>
                    {row.note ? <p className="mt-1 text-[var(--foreground)]">{row.note}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
          <AdminB2bDesk board={board.board} />
        </div>
      )}
    </RoomFrame>
  );
}

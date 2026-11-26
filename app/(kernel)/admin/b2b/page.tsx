import type { Metadata } from "next";
import { AdminB2bDesk } from "@/components/kernel/admin-b2b-desk";
import { AdminKurumsalOffers } from "@/components/kernel/admin-kurumsal-offers";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Forbidden } from "@/components/ui/forbidden";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { loadB2bBoard } from "@/lib/kernel/admin/b2b-load";
import {
  loadKurumsalOfferBoard,
  parseKurumsalOfferStatusFilter,
} from "@/lib/kernel/admin/kurumsal-offer-load";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";

export const metadata: Metadata = {
  title: "B2B Fırsat Motoru",
  robots: { index: false, follow: false },
};

export default async function AdminB2bPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await resolveSuperAdminAccess();
  const signedIn = access.kind !== "unauthenticated";
  const isAdmin = access.kind === "ok";
  const copy = ADMIN_SEN.b2b;
  const params = (await searchParams) ?? {};
  const pageRaw = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const status = parseKurumsalOfferStatusFilter(
    typeof params.status === "string" ? params.status : "ALL",
  );
  const board = access.kind === "ok" ? await loadB2bBoard(access.user) : null;
  const offers =
    access.kind === "ok"
      ? await loadKurumsalOfferBoard(access.user, { page, status })
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
            ) : offers?.access === "ok" ? (
              <div className="mt-4">
                <AdminKurumsalOffers
                  rows={offers.rows}
                  page={offers.page}
                  pageSize={offers.pageSize}
                  total={offers.total}
                  status={offers.status}
                />
              </div>
            ) : null}
          </Card>
          <AdminB2bDesk board={board.board} />
        </div>
      )}
    </RoomFrame>
  );
}

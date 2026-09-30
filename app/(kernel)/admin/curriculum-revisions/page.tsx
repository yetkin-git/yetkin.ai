import { LinkButton } from "@/components/ui/link-button";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Forbidden } from "@/components/ui/forbidden";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
  ADMIN_SURFACE_PATH,
} from "@/lib/kernel/admin/types";
import { resolveSuperAdminAccess } from "@/lib/kernel/auth/session";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ACADEMY_STUDIO_GONE = {
  revisions: "Müfredat revizyon kuyruğu kapalı.",
} as const;

function RevisionShelterActions() {
  const copy = ACADEMY_SEN.revisions;
  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href={ADMIN_SURFACE_PATH} variant="secondary" size="sm">
        {copy.catalogCta}
      </LinkButton>
      <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="outline" size="sm">
        {copy.academyCta}
      </LinkButton>
      <LinkButton href={ADMIN_FREELANCER_SHELTER_PATH} variant="outline" size="sm">
        {copy.freelancerCta}
      </LinkButton>
      <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size="sm">
        {copy.dashboardCta}
      </LinkButton>
    </div>
  );
}

/** Faz 3 — revizyon kuyruğu arşivde. Kapı `/admin` ile aynı: `resolveSuperAdminAccess`. */
export default async function AdminCurriculumRevisionsPage() {
  const access = await resolveSuperAdminAccess();
  const copy = ACADEMY_SEN.revisions;
  const allowed = access.kind === "ok";
  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={allowed ? ACADEMY_STUDIO_GONE.revisions : copy.description}
        actions={allowed ? <RevisionShelterActions /> : undefined}
      />
      {access.kind === "unauthenticated" ? <AuthNeeded message={copy.auth} /> : null}
      {access.kind === "forbidden" ? <Forbidden message={copy.forbidden} /> : null}
    </RoomFrame>
  );
}

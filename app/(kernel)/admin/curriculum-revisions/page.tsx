import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ACADEMY_STUDIO_GONE } from "@/lib/academy/studio-gone";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
  ADMIN_SURFACE_PATH,
} from "@/lib/kernel/admin/types";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

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

/** Faz 3 — revizyon kuyruğu arşivde; Super Admin sığınak iskeleti durur. */
export default function AdminCurriculumRevisionsPage() {
  const copy = ACADEMY_SEN.revisions;
  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={ACADEMY_STUDIO_GONE.revisions}
        actions={<RevisionShelterActions />}
      />
    </RoomFrame>
  );
}

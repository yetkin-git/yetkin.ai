import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_CURRICULUM_REVISIONS_PATH } from "@/lib/academy/curriculum-revision-paths";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
} from "@/lib/kernel/admin/types";

type ShelterSize = "sm" | "md";

/** Admin sığınak CTA şeridi — Quiet Luxury hiyerarşi: müfredat → akademi → ilan → panel. */
export function AdminShelterActions({
  soft = false,
  size,
}: {
  soft?: boolean;
  size?: ShelterSize;
}) {
  const copy = ADMIN_SEN;
  const resolved: ShelterSize = size ?? (soft ? "sm" : "md");
  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href={ACADEMY_CURRICULUM_REVISIONS_PATH} variant="secondary" size={resolved}>
        {copy.revisionsCta}
      </LinkButton>
      <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="outline" size={resolved}>
        {copy.academyCta}
      </LinkButton>
      <LinkButton href={ADMIN_FREELANCER_SHELTER_PATH} variant="outline" size={resolved}>
        {copy.freelancerCta}
      </LinkButton>
      <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size={resolved}>
        {copy.dashboardCta}
      </LinkButton>
    </div>
  );
}

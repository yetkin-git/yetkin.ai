import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_CURRICULUM_REVISIONS_PATH } from "@/lib/academy/curriculum-revision-paths";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_CATALOG_SURFACE_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
} from "@/lib/kernel/admin/types";

type ShelterSize = "sm" | "md";

/** Admin sığınak CTA şeridi — müfredat, akademi, panel. Kilitli Freelancer yolu basılmaz. */
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
      <LinkButton href={ADMIN_CATALOG_SURFACE_PATH as Route} variant="secondary" size={resolved}>
        {copy.catalogTitle}
      </LinkButton>
      <LinkButton href={ACADEMY_CURRICULUM_REVISIONS_PATH} variant="secondary" size={resolved}>
        {copy.revisionsCta}
      </LinkButton>
      <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="outline" size={resolved}>
        {copy.academyCta}
      </LinkButton>
      <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size={resolved}>
        {copy.dashboardCta}
      </LinkButton>
    </div>
  );
}

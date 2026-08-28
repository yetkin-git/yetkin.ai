import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_CURRICULUM_REVISIONS_PATH } from "@/lib/academy/curriculum-revision-paths";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
} from "@/lib/kernel/admin/types";

/** Müfredat · ilan · sığınak denetim paneli — pasif metin yerine canlı LinkButton. */
export function AdminAuditChambers() {
  const copy = ADMIN_SEN;
  return (
    <Card
      eyebrow={copy.audit.eyebrow}
      title={copy.audit.title}
      variant="featured"
      bodyClassName="text-[var(--foreground)]"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.audit.body}</p>
      <div className="flex flex-wrap gap-2">
        <LinkButton href={ACADEMY_CURRICULUM_REVISIONS_PATH} variant="primary" size="sm">
          {copy.revisionsCta}
        </LinkButton>
        <LinkButton href={ADMIN_ACADEMY_SHELTER_PATH} variant="secondary" size="sm">
          {copy.academyCta}
        </LinkButton>
        <LinkButton href={ADMIN_FREELANCER_SHELTER_PATH} variant="outline" size="sm">
          {copy.freelancerCta}
        </LinkButton>
        <LinkButton href={ADMIN_DASHBOARD_SHELTER_PATH} variant="ghost" size="sm">
          {copy.dashboardCta}
        </LinkButton>
      </div>
    </Card>
  );
}

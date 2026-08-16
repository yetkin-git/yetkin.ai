import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProjectCreateForm } from "@/components/devlabs/project-create-form";
import { IntegrationStrip, SandboxPreviewCards } from "@/components/devlabs/lab-vitrine";
import { ProductionFlowStrip, WorkbenchHonestySteps } from "@/components/devlabs/workbench-honesty-steps";
import { loadOwnerProjects } from "@/lib/devlabs/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { IconCode, IconKey, IconLock } from "@/components/ui/icons";
import { TerminalRibbon } from "@/components/theme/room-chrome";
import { devlabsProjectStatusLabel } from "@/lib/copy/status-labels";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function DevlabsPage() {
  const session = await getSession();
  const projects = session ? await loadOwnerProjects(session.id) : null;
  const count = projects?.length ?? 0;
  const copy = SEN_VOICE.devlabs.catalog;
  const stats = SEN_VOICE.devlabs.stats;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <TerminalRibbon />
      <StatGrid
        columns={3}
        items={[
          { label: stats.projectLabel, value: count, icon: <IconCode /> },
          { label: stats.benchLabel, value: stats.benchValue, icon: <IconLock /> },
          { label: stats.vaultLabel, value: stats.vaultValue, hint: stats.vaultHint, icon: <IconKey /> },
        ]}
      />
      <WorkbenchHonestySteps />
      <ProductionFlowStrip />
      <IntegrationStrip />
      <SandboxPreviewCards />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card variant="featured" className="lg:col-span-2" title={copy.newProject}>
          {session ? (
            <ProjectCreateForm />
          ) : (
            <p>
              {copy.loginLead}{" "}
              <Link href="/login" className="font-semibold text-[var(--safir-deep)] hover:underline">
                {copy.loginCta}
              </Link>{" "}
              {copy.loginTail}
            </p>
          )}
        </Card>
        <div className="lg:col-span-3">
          {projects === null ? (
            <Card variant="glass" title={copy.consoleTitle}>
              <Badge tone="amber">{copy.unbound}</Badge>
              <p className="mt-3">{copy.unboundBody}</p>
            </Card>
          ) : projects.length === 0 ? (
            <Card variant="glass" title={copy.consoleTitle}>
              {copy.empty}
            </Card>
          ) : (
            <ul className="space-y-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Card
                    variant="glass"
                    title={project.name}
                    action={<Badge tone={project.status === "ACTIVE" ? "emerald" : "neutral"}>{devlabsProjectStatusLabel(project.status)}</Badge>}
                    bodyClassName="text-[var(--foreground)]"
                  >
                    <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{copy.sandboxLabel}</p>
                    <p className="mt-2">{project.summary}</p>
                    <div className="mt-4">
                      <LinkButton href={`/devlabs/projeler/${project.id}`} size="sm">
                        {copy.vaultCta}
                      </LinkButton>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </RoomFrame>
  );
}

import { JobList } from "@/components/freelancer/job-list";
import { loadOpenJobs } from "@/lib/freelancer/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { StatGrid } from "@/components/ui/stat-grid";
import { IconBriefcase, IconLock, IconCheck } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function FreelancerPage() {
  const jobs = await loadOpenJobs();
  const live = jobs ?? [];
  const copy = SEN_VOICE.freelancer.catalog;
  const stats = SEN_VOICE.freelancer.stats;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={<LinkButton href="/freelancer/new">{copy.createCta}</LinkButton>}
      />
      <StatGrid
        columns={3}
        items={[
          { label: stats.openLabel, value: live.length, icon: <IconBriefcase /> },
          { label: stats.escrowLabel, value: stats.escrowValue, hint: stats.escrowHint, icon: <IconLock /> },
          { label: stats.pathLabel, value: stats.pathValue, hint: stats.pathHint, icon: <IconCheck /> },
        ]}
      />
      {jobs === null ? (
        <Badge tone="amber">{copy.unbound}</Badge>
      ) : live.length > 0 ? (
        <Badge tone="emerald">{copy.live(live.length)}</Badge>
      ) : null}
      <JobList jobs={live} />
    </RoomFrame>
  );
}

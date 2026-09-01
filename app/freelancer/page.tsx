import { connection } from "next/server";
import { JobList } from "@/components/freelancer/job-list";
import { loadOpenJobs } from "@/lib/freelancer/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function FreelancerPage() {
  await connection();
  const jobs = await loadOpenJobs();
  const live = jobs ?? [];
  const copy = SEN_VOICE.freelancer.catalog;
  const stats = SEN_VOICE.freelancer.stats;

  return (
    <RoomFrame className="space-y-2.5">
      <PageHeader
        tight
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <ul className="flex flex-wrap items-center gap-1.5" aria-label={stats.barLabel}>
              <li>
                <Badge tone="neutral" className="normal-case tracking-tight">
                  {stats.open(live.length)}
                </Badge>
              </li>
            </ul>
            <LinkButton href="/freelancer/new" variant="primary" size="sm">
              {copy.createCta}
            </LinkButton>
          </>
        }
      />
      <JobList jobs={live} />
    </RoomFrame>
  );
}

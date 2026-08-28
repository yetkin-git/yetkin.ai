import { JobList } from "@/components/freelancer/job-list";
import { loadOpenJobs } from "@/lib/freelancer/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function FreelancerPage() {
  const jobs = await loadOpenJobs();
  const live = jobs ?? [];
  const copy = SEN_VOICE.freelancer.catalog;
  const stats = SEN_VOICE.freelancer.stats;

  return (
    <RoomFrame className="space-y-5">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <ul className="flex flex-wrap justify-end gap-1.5" aria-label={stats.barLabel}>
              <li>
                <Badge tone="neutral" className="normal-case tracking-tight">
                  {stats.open(live.length)}
                </Badge>
              </li>
            </ul>
            <LinkButton href="/freelancer/new" variant="primary">
              {copy.createCta}
            </LinkButton>
          </div>
        }
      />
      <p className="text-sm text-[var(--muted)]">{SEN_VOICE.freelancer.accept.paymentsClosedBody}</p>
      <JobList jobs={live} />
    </RoomFrame>
  );
}

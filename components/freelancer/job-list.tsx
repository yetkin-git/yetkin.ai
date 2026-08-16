import { formatMinor } from "@/lib/kernel/money/format";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { FREELANCER_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconBriefcase } from "@/components/ui/icons";
import { freelancerJobStatusLabel } from "@/lib/copy/status-labels";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function JobList({ jobs }: { jobs: FreelancerJobRecord[] }) {
  const copy = SEN_VOICE.freelancer;

  if (jobs.length === 0) {
    return (
      <Vitrine hint={copy.list.emptyHint}>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FREELANCER_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                price={item.price}
                badge={item.badge}
                meta={item.meta}
                href="/freelancer/new"
                cta={copy.catalog.createCta}
                icon={<IconBriefcase />}
                lockLabel={copy.list.lockLabel}
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <ListingCard
            title={job.title}
            summary={job.brief}
            price={formatMinor(job.budgetMinor, job.currencyCode as CurrencyCode)}
            badge={freelancerJobStatusLabel(job.status)}
            badgeTone="emerald"
            href={`/freelancer/jobs/${job.id}`}
            cta={copy.list.openCta}
            icon={<IconBriefcase />}
            lockLabel={copy.list.lockLabel}
          />
        </li>
      ))}
    </ul>
  );
}

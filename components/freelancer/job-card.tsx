import { formatMinor } from "@/lib/kernel/money/format";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { JobBoardViewMode } from "@/lib/freelancer/job-board-view-pref";
import { jobListingFace, jobListingMetaLine } from "@/lib/freelancer/listing-face";
import { ListingCard } from "@/components/showcase/listing-card";
import { IconBriefcase } from "@/components/ui/icons";
import { freelancerJobStatusLabel } from "@/lib/copy/status-labels";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/**
 * İş Pazarı ilan kartı — Quiet Luxury: üst rozet kalabalığı yok;
 * özet `line-clamp-2`; format ve süre meta satırında; fiyat + CTA altta hizalı.
 */
export function FreelancerJobCard({
  job,
  layout = "grid",
}: {
  job: FreelancerJobRecord;
  layout?: JobBoardViewMode;
}) {
  const copy = SEN_VOICE.freelancer;
  const face = jobListingFace(job);

  return (
    <ListingCard
      layout={layout}
      title={job.title}
      summary={job.brief}
      meta={jobListingMetaLine(face)}
      price={formatMinor(job.budgetMinor, job.currencyCode as CurrencyCode)}
      footerBadge={freelancerJobStatusLabel(job.status)}
      footerBadgeTone="emerald"
      href={`/freelancer/jobs/${job.id}`}
      cta={copy.list.openCta}
      icon={<IconBriefcase />}
    />
  );
}

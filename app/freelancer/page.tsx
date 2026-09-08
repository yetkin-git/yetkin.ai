import type { Metadata } from "next";
import { connection } from "next/server";
import { JobList } from "@/components/freelancer/job-list";
import { FreelancerJobCard } from "@/components/freelancer/job-card";
import { loadOpenJobs } from "@/lib/freelancer/load";
import { partitionFreelancerBoardJobs } from "@/lib/freelancer/listing-face";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import {
  ACADEMY_CERTIFICATES_SURFACE_PATH,
  CAREER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
} from "@/lib/kernel/passport/types";

export const metadata: Metadata = pageMetadata(PAGE_SEO.freelancer);

export default async function FreelancerPage() {
  await connection();
  const jobs = await loadOpenJobs();
  const { live, examples } = partitionFreelancerBoardJobs(jobs ?? []);
  const copy = SEN_VOICE.freelancer.catalog;
  const listCopy = SEN_VOICE.freelancer.list;
  const stats = SEN_VOICE.freelancer.stats;

  return (
    <RoomFrame className="space-y-2.5">
      <PageHeader
        tight
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
                {copy.passportCta}
              </LinkButton>
              <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="outline" size="sm">
                {copy.careerCta}
              </LinkButton>
              <LinkButton href={ACADEMY_CERTIFICATES_SURFACE_PATH} variant="outline" size="sm">
                {copy.certificatesCta}
              </LinkButton>
            </div>
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
      {examples.length > 0 ? (
        <Card variant="default">
          <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
            {listCopy.exampleBoardTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{listCopy.exampleBoardLead}</p>
        </Card>
      ) : null}
      <JobList jobs={live} />
      {examples.length > 0 ? (
        <section className="space-y-3" aria-label={listCopy.exampleBoardTitle}>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {listCopy.exampleBoardTitle}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {examples.map((job) => (
              <li key={job.id} className="h-full">
                <FreelancerJobCard job={job} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </RoomFrame>
  );
}

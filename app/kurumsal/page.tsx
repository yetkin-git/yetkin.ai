import Link from "next/link";
import { CompanyForm } from "@/components/kurumsal/company-form";
import { JobPostingList } from "@/components/kurumsal/job-posting-list";
import { loadOwnerCompany, loadOwnerPostings } from "@/lib/kurumsal/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { MetricTable } from "@/components/ui/metric-table";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function KurumsalPage() {
  const session = await getSession();
  const company = session ? await loadOwnerCompany(session.id) : null;
  const postings = session ? await loadOwnerPostings(session.id) : null;
  const livePostings = postings ?? [];
  const sealed = livePostings.filter((row) => row.status === "SEALED").length;
  const escrowMinor = livePostings
    .filter((row) => row.status === "SEALED" || row.status === "AWARDED")
    .reduce((sum, row) => sum + row.budgetMinor, 0);
  const copy = SEN_VOICE.kurumsal;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          company ? (
            <LinkButton href="/kurumsal/ilan/yeni">{copy.sealedCta}</LinkButton>
          ) : null
        }
      />
      <MetricTable
        title={copy.metricsTitle}
        rows={[
          { label: copy.legalNameLabel, value: company?.legalName ?? "—", hint: company ? company.jurisdiction : copy.noProfile },
          { label: copy.sealedLabel, value: sealed, hint: copy.sealedHint(livePostings.length) },
          {
            label: copy.escrowLabel,
            value: formatMinor(escrowMinor, livePostings[0]?.currencyCode ?? SETTLEMENT_CURRENCY),
            hint: copy.escrowHint,
          },
        ]}
      />
      <Card variant="featured" title={copy.profileTitle}>
        {session ? (
          <CompanyForm initial={company} />
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
      {postings === null ? <Badge tone="amber">{copy.unbound}</Badge> : null}
      <JobPostingList postings={postings ?? []} />
    </RoomFrame>
  );
}

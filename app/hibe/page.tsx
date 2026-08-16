import Link from "next/link";
import { MatchForm } from "@/components/hibe/match-form";
import { ProgramList } from "@/components/hibe/program-list";
import { loadApplicationsForUser, loadMatchedPrograms } from "@/lib/hibe/load";
import { grantMatchInputSchema } from "@/lib/hibe/schemas";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricTable } from "@/components/ui/metric-table";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function HibePage({
  searchParams,
}: {
  searchParams: Promise<{
    jurisdiction?: string;
    applicantKind?: string;
    hasTaxId?: string;
    tags?: string;
    agency?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const parsed = grantMatchInputSchema.safeParse({
    jurisdiction: params.jurisdiction || "TR",
    applicantKind: params.applicantKind || "INDIVIDUAL",
    hasTaxId: params.hasTaxId === "1" || params.hasTaxId === "true",
    sectorTags: (params.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    agency: params.agency || undefined,
    query: params.q || undefined,
  });
  const query = parsed.success
    ? parsed.data
    : {
        jurisdiction: "TR",
        applicantKind: "INDIVIDUAL" as const,
        hasTaxId: false,
        sectorTags: [],
      };
  const programs = await loadMatchedPrograms(query);
  const session = await getSession();
  const applications = session ? await loadApplicationsForUser(session.id) : null;
  const copy = SEN_VOICE.hibe;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <MetricTable
        title={copy.metricsTitle}
        rows={[
          {
            label: copy.matchedLabel,
            value: programs?.length ?? 0,
            hint: query.jurisdiction,
          },
          {
            label: copy.openGuideLabel,
            value: applications?.length ?? 0,
            hint: session ? copy.sessionHint : copy.guestHint,
          },
          {
            label: copy.catalogLabel,
            value: copy.catalogValue,
            hint: copy.catalogHint,
          },
        ]}
      />
      <Card variant="featured" title={copy.matchTitle}>
        <MatchForm
          jurisdiction={query.jurisdiction}
          applicantKind={query.applicantKind}
          hasTaxId={query.hasTaxId}
          tags={query.sectorTags.join(", ")}
          agency={query.agency ?? ""}
          query={query.query ?? ""}
        />
      </Card>
      {applications && applications.length > 0 ? (
        <Card variant="glass" title={copy.openGuidesTitle}>
          {copy.openGuidesBody(applications.length)}
        </Card>
      ) : null}
      {programs === null ? <Badge tone="amber">{copy.unbound}</Badge> : null}
      <ProgramList programs={programs ?? []} />
      <p className="text-xs text-[var(--muted)]">
        <Link href="/kurumsal" className="font-semibold text-[var(--safir-deep)] hover:underline">
          {copy.corporateLead}
        </Link>{" "}
        {copy.corporateHint}
      </p>
    </RoomFrame>
  );
}

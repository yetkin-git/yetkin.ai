import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ApplyGuideButton } from "@/components/hibe/apply-guide-button";
import { loadApplicationForUserProgram, loadProgramBySlug } from "@/lib/hibe/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";

function applicantKindLabel(kind: string): string {
  switch (kind) {
    case "INDIVIDUAL":
      return "Birey";
    case "CORPORATE":
      return "Şirket";
    case "BOTH":
      return "Birey / şirket";
    default:
      return kind;
  }
}

export default async function HibeProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await loadProgramBySlug(slug);
  if (!program) {
    notFound();
  }
  const session = await getSession();
  const application = session ? await loadApplicationForUserProgram(session.id, program.id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {program.agency === "TUBITAK" ? "TÜBİTAK" : program.agency} · {program.jurisdiction}
      </p>
      <h1 className="text-2xl font-semibold">{program.title}</h1>
      <Card>
        <p>{program.summary}</p>
        <p className="mt-2 text-xs uppercase tracking-wide">
          {applicantKindLabel(program.applicantKind)} · {program.sectorTags.join(" · ")}
        </p>
        {program.maxAwardMinor != null ? (
          <p className="mt-3 font-medium text-[var(--foreground)]">
            Üst bilgi tavanı: {formatMinor(program.maxAwardMinor, program.currencyCode)} — cüzdan
            hareketi yoktur.
          </p>
        ) : null}
      </Card>
      <Card title="Başvuru rehberi">
        <p className="whitespace-pre-wrap">{program.applicationGuide}</p>
        <p className="mt-3 text-xs">Bilgi kaydı. Resmi başvuru bu ekrandan yapılmaz.</p>
        {session ? (
          <div className="mt-3">
            <ApplyGuideButton
              programId={program.id}
              alreadyOpen={application?.status === "GUIDE_OPEN"}
              alreadyDone={application?.status === "CHECKLIST_DONE"}
            />
          </div>
        ) : (
          <p className="mt-3">
            Rehberi kaydetmek için{" "}
            <Link href="/login" className="text-[var(--safir)] hover:underline">
              giriş yapın
            </Link>
            .
          </p>
        )}
      </Card>
      <Link href="/hibe" className="text-sm text-[var(--safir)] hover:underline">
        Kataloga dön
      </Link>
    </div>
  );
}

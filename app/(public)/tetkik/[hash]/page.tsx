import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { IconArrow } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { pageMetadata } from "@/lib/copy/seo";
import { loadPublicTetkikReport, parsePublicTetkikId, publicTetkikPath } from "@/lib/tezgah/tetkik/public-report";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  const id = parsePublicTetkikId(hash);
  const report = id ? await loadPublicTetkikReport(id) : null;
  const path = id ? publicTetkikPath(id) : "/tetkik";
  return pageMetadata({
    title: report ? `${report.score}/100 web site analizi` : "Web Site Analizi raporu",
    description: report?.disclaimer ?? "Paylaşılabilir web site analizi. Skor kodda hesaplanır.",
    path,
    robots: { index: false, follow: true },
  });
}

export default async function TetkikReportPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const report = await loadPublicTetkikReport(hash);
  if (!report) {
    notFound();
  }
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10">
      <PublicHero
        eyebrow="Paylaşılabilir Web Site Analizi"
        title={`${report.score} / ${report.maxScore}`}
        description={report.disclaimer}
      >
        <p
          className={
            report.score >= 70
              ? "inline-flex rounded-2xl bg-emerald-50 px-4 py-2 text-2xl font-semibold text-emerald-700 ring-1 ring-emerald-200"
              : report.score >= 40
                ? "inline-flex rounded-2xl bg-amber-50 px-4 py-2 text-2xl font-semibold text-amber-700 ring-1 ring-amber-200"
                : "inline-flex rounded-2xl bg-rose-50 px-4 py-2 text-2xl font-semibold text-rose-700 ring-1 ring-rose-200"
          }
        >
          {report.score}
          <span className="ml-1 text-base font-medium opacity-70">/ {report.maxScore}</span>
        </p>
      </PublicHero>
      <p className="mt-4 break-all text-sm text-[var(--safir-deep)]">{report.url}</p>
      {report.pageTitle ? <p className="mt-2 text-sm text-[var(--muted)]">Sayfa başlığı: {report.pageTitle}</p> : null}
      <p className="mt-2 text-sm text-[var(--muted)]">
        İlk bayt {report.ttfbMs} ms · HTML {report.htmlBytes} bayt
      </p>
      <ol className="mt-8 space-y-4">
        {report.checks.map((check) => (
          <li
            key={check.id}
            className={
              check.earned >= check.weight
                ? "rounded-2xl border border-emerald-200/80 border-l-4 border-l-emerald-500 bg-white p-4 shadow-sm"
                : "rounded-2xl border border-amber-200/80 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm"
            }
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold">{check.label}</h2>
              <p className="text-sm text-[var(--muted)]">
                {check.earned}/{check.weight}
              </p>
            </div>
            {check.detail ? <p className="mt-1 text-sm text-[var(--muted)]">{check.detail}</p> : null}
            {check.opportunity ? <p className="mt-2 text-sm leading-6">{check.opportunity}</p> : null}
          </li>
        ))}
      </ol>
      <section className="mt-8 rounded-2xl border border-[var(--border)] p-5">
        <h2 className="text-lg font-semibold">{report.action.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{report.action.body}</p>
      </section>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href={"/tezgah" as Route}>
          Bu eksikleri AI Tezgâh ile kendin düzelt
          <IconArrow className="h-3.5 w-3.5" />
        </LinkButton>
        <LinkButton href={"/career/vitrin" as Route} variant="outline">
          Onaylı yetenek vitrinine bak
        </LinkButton>
      </div>
    </main>
  );
}

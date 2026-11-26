import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { pageMetadata } from "@/lib/copy/seo";
import { KURUMSAL_JOB_VERTICALS } from "@/lib/sales/kurumsal-screening";
import { listPublicOpenKurumsalJobs } from "@/lib/sales/kurumsal-screening-load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Açık iş ilanları — YetkinCV ile eleme",
  description:
    "Aktif kurumsal ilanları gör, pozisyon ve uzmanlığa göre filtrele. Başvuruda YetkinCV vaka testini sunucuda çözersin; puan satın alınmaz.",
  path: "/ilan",
});

export default async function PublicKurumsalJobDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vertical?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const vertical = typeof params.vertical === "string" ? params.vertical.trim() : "";
  let jobs: Awaited<ReturnType<typeof listPublicOpenKurumsalJobs>> = [];
  let unavailable = false;
  try {
    jobs = await listPublicOpenKurumsalJobs({ query, vertical });
  } catch {
    unavailable = true;
  }

  return (
    <RoomFrame className="px-6 pb-16 pt-10">
      <PageHeader
        eyebrow="Açık ilanlar"
        title="İş ilanı dizini"
        description="Aktif ve son başvuru tarihi geçmemiş ilanlar burada. Başvuruda seçilen yetkinliklerin YetkinCV testini sunucuda çözersin. Puan satın alınmaz."
      />
      <form className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]" method="get" action="/ilan">
        <label className="grid gap-1.5 text-sm font-medium">
          Ara
          <input
            className={INPUT_SURFACE_CLASS}
            name="q"
            defaultValue={query}
            placeholder="Pozisyon veya şirket"
            maxLength={120}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Uzmanlık
          <select className={INPUT_SURFACE_CLASS} name="vertical" defaultValue={vertical}>
            <option value="">Tümü</option>
            {KURUMSAL_JOB_VERTICALS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--safir)] px-4 text-sm font-semibold text-white sm:w-auto"
          >
            Filtrele
          </button>
        </div>
      </form>
      {unavailable ? (
        <p className="mt-6 text-sm text-[var(--foreground)]">İlan listesi şu an okunamadı. Sahte ilan basılmaz.</p>
      ) : jobs.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Bu filtreyle açık ilan yok. Yeni ilanlar işveren doğrulamasından sonra burada görünür.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {jobs.map((job) => (
            <li key={job.slug}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                      {job.companyName} · {job.verticalLabel}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      <Link href={job.applyPath} className="text-[var(--foreground)] hover:text-[var(--safir)]">
                        {job.title}
                      </Link>
                    </h2>
                    {job.deadlineLabel ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">Son başvuru {job.deadlineLabel}</p>
                    ) : null}
                  </div>
                  {job.employerVerified ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Doğrulanmış İşveren ✓
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                      Kimlik doğrulaması beklemede
                    </span>
                  )}
                </div>
                <Link
                  href={job.applyPath}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--safir)]"
                >
                  İlana git
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </RoomFrame>
  );
}

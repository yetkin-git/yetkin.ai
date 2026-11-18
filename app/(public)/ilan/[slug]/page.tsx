import type { Metadata } from "next";
import { KurumsalJobApplyGate } from "@/components/kurumsal/job-apply-gate";
import { Card } from "@/components/ui/card";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { pageMetadata } from "@/lib/copy/seo";
import { isKurumsalJobSlug, type PublicKurumsalJobView } from "@/lib/sales/kurumsal-screening";
import { loadPublicKurumsalJob } from "@/lib/sales/kurumsal-screening-load";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = isKurumsalJobSlug(slug) ? `/ilan/${slug}` : "/kurumsal";
  let job: PublicKurumsalJobView | null = null;
  try {
    job = await loadPublicKurumsalJob(slug);
  } catch {
    return pageMetadata({
      title: "İlan okunamadı",
      description: "Başvuru kaydı şu an yüklenemedi.",
      path,
      robots: { index: false, follow: false },
    });
  }
  if (!job) {
    return pageMetadata({
      title: "İlan bulunamadı",
      description: "Bu başvuru adresi açık bir ilana bağlı değil.",
      path,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: `${job.title} — ${job.companyName}`,
    description: job.description.slice(0, 160),
    path: `/ilan/${job.slug}`,
    robots: { index: true, follow: true },
  });
}

export default async function KurumsalJobApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let unavailable = false;
  let job: PublicKurumsalJobView | null = null;
  try {
    job = await loadPublicKurumsalJob(slug);
  } catch {
    unavailable = true;
  }
  if (unavailable) {
    return (
      <RoomFrame className="px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="Başvuru"
          title="İlan okunamadı"
          description="Kayıt şu an yüklenemedi. Sahte ilan basılmaz."
        />
      </RoomFrame>
    );
  }
  if (!job) {
    return (
      <RoomFrame className="px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="Başvuru"
          title="İlan bulunamadı"
          description="Bu başvuru adresi açık bir ilana bağlı değil. Sahte ilan basılmaz."
        />
      </RoomFrame>
    );
  }
  const session = await getSession();

  return (
    <RoomFrame className="px-6 pb-16 pt-10">
      <PageHeader
        eyebrow={job.companyName}
        title={job.title}
        description={`${job.verticalLabel}. ${job.criteriaLine ?? "Yetkinlik ağırlığı tanımlı değil."} Baraj ${job.minScore}/100. Mülakat kontenjanı ilk ${job.shortlistLimit} aday.`}
      />
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card title="Pozisyon" eyebrow="İlan">
          <p className="whitespace-pre-wrap text-sm leading-6">{job.description}</p>
          {job.criteria.length > 0 ? (
            <ul className="mt-4 grid gap-1 text-sm">
              {job.criteria.map((row) => (
                <li key={row.key}>
                  {row.label} %{row.weight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">Bu ilanın yetkinlik ağırlığı tanımlı değil. Sahte kriter yazılmaz.</p>
          )}
          <p className="mt-3 text-sm font-medium">{job.criteriaLine ?? "Ağırlık toplamı yok."}</p>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>Minimum baraj: {job.minScore}/100</li>
            {job.deadlineLabel ? <li>Son başvuru: {job.deadlineLabel}</li> : null}
            <li>İlk {job.shortlistLimit} aday mülakat listesine girer.</li>
            <li>Alt puanlar sunucudaki YetkinCV vaka testinden yazılır. Ağırlıklı sonuç o puanlardan hesaplanır.</li>
          </ul>
        </Card>
        <KurumsalJobApplyGate
          slug={job.slug}
          signedIn={Boolean(session)}
          loginHref={buildCitizenLoginHref(`/ilan/${job.slug}`)}
          defaultName=""
          defaultEmail={session?.email ?? ""}
          minScore={job.minScore}
        />
      </div>
    </RoomFrame>
  );
}

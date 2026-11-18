import type { Metadata } from "next";
import { KurumsalOpsDeck } from "@/components/kurumsal/ops-deck";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { pageMetadata } from "@/lib/copy/seo";
import { loadKurumsalOfferPrices } from "@/lib/sales/kurumsal-offers";
import type { OwnerJobView } from "@/lib/sales/kurumsal-screening";
import { kurumsalSkillCatalog, loadOwnerKurumsalBoard } from "@/lib/sales/kurumsal-screening-load";

export const metadata: Metadata = pageMetadata({
  title: "Kurumsal ilanlar ve mülakat kısa listesi",
  description:
    "Şirketin açtığı ilanlar ve ağırlıklı YetkinCV puanına göre dizilen adaylar. CV özeti yalnız ilan sahibine görünür.",
  path: "/kurumsal/ilanlar",
  robots: { index: false, follow: false },
});

export const dynamic = "force-dynamic";

export default async function KurumsalJobsPage() {
  const skills = kurumsalSkillCatalog();
  const [prices, session] = await Promise.all([loadKurumsalOfferPrices(), getSession()]);
  let jobs: OwnerJobView[] = [];
  let boardUnavailable = false;
  if (session) {
    try {
      jobs = await loadOwnerKurumsalBoard(session.id);
    } catch {
      boardUnavailable = true;
    }
  }

  return (
    <RoomFrame className="px-6 pb-16 pt-10">
      <PageHeader
        eyebrow="Kurumsal İK"
        title="İlanlar ve kısa liste"
        description="Açtığın ilanların başvuru bağlantısı ve ağırlıklı puana göre mülakat sırası burada durur."
      />
      <a href="/kurumsal" className="mt-3 inline-flex text-sm font-semibold text-[var(--safir)]">
        İşletim merkezine dön
      </a>
      <div className="pt-4">
        <KurumsalOpsDeck
          jobs={jobs}
          skills={skills}
          boardUnavailable={boardUnavailable}
          signedIn={Boolean(session)}
          loginHref={buildCitizenLoginHref("/kurumsal/ilanlar")}
          screeningPrice={prices.jobScreening}
          offerHref="/kurumsal#kurumsal-teklif"
        />
      </div>
    </RoomFrame>
  );
}

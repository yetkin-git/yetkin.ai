import type { Metadata } from "next";
import { KurumsalOpsDeck } from "@/components/kurumsal/ops-deck";
import { PageHeader } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { requirePageSession } from "@/lib/kernel/auth/session";
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
  const session = await requirePageSession();
  const skills = kurumsalSkillCatalog();
  const prices = await loadKurumsalOfferPrices();
  let jobs: OwnerJobView[] = [];
  let boardUnavailable = false;
  try {
    jobs = await loadOwnerKurumsalBoard(session.id);
  } catch {
    boardUnavailable = true;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:px-6">
      <PageHeader
        compact
        eyebrow="Kurumsal İK"
        title="İlanlar ve kısa liste"
        description="Açtığın ilanların başvuru bağlantısı ve ağırlıklı puana göre mülakat sırası burada durur."
      />
      <a href="/kurumsal" className="inline-flex text-sm font-semibold text-[var(--safir)]">
        Satış vitrinine dön
      </a>
      <KurumsalOpsDeck
        jobs={jobs}
        skills={skills}
        boardUnavailable={boardUnavailable}
        signedIn
        loginHref={buildCitizenLoginHref("/kurumsal/ilanlar")}
        screeningPrice={prices.jobScreening}
        offerHref="/kurumsal#kurumsal-teklif"
      />
    </div>
  );
}

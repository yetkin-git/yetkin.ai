import type { Metadata } from "next";
import { KurumsalOfferForm } from "@/components/kurumsal/offer-form";
import { KurumsalOpsDeck } from "@/components/kurumsal/ops-deck";
import { Card } from "@/components/ui/card";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { TipPanel } from "@/components/ui/public-hero";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { cn } from "@/components/ui/cn";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { loadKurumsalOfferPrices } from "@/lib/sales/kurumsal-offers";
import { kurumsalSkillCatalog, loadOwnerKurumsalBoard } from "@/lib/sales/kurumsal-screening-load";
import type { OwnerJobView } from "@/lib/sales/kurumsal-screening";

export const metadata: Metadata = pageMetadata(PAGE_SEO.kurumsal);
export const dynamic = "force-dynamic";

const TRUST_BADGES = [
  "PayTR 3D Secure güvencesi",
  "Fatura tahsilatta kesilir",
  "Kapalı katalog tutarı yazılmaz",
] as const;

function OfferChecks({ lines, featured }: { lines: readonly string[]; featured?: boolean }) {
  return (
    <ul className="mt-4 grid gap-2">
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2 text-sm leading-6">
          <IconCheck className={cn("mt-1 h-4 w-4 shrink-0", featured ? "text-emerald-300" : "text-emerald-500")} />
          <span className={featured ? "text-slate-100" : "text-[var(--foreground)]"}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function OfferCta({ featured }: { featured?: boolean }) {
  return (
    <a
      href="#kurumsal-teklif"
      className={cn(
        "mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold",
        featured
          ? "bg-white text-slate-950 shadow-md hover:bg-blue-50"
          : "bg-[var(--safir)] text-white hover:bg-[var(--safir-deep)]",
      )}
    >
      Talebinizi bırakın
    </a>
  );
}

export default async function KurumsalSalesPage() {
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
  const teamPrice = prices.teamSeat;
  const agencyPrice = prices.agency;

  return (
    <RoomFrame className="px-6 pb-16 pt-10">
      <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-slate-50 via-blue-50/80 to-white px-6 py-8 ring-1 ring-blue-100">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_68%)]"
        />
        <PageHeader
          eyebrow="Kurumsal İK"
          title="Doğru Adayı Günler Değil, Dakikalar İçinde Seçin."
          description="İlan aç, yetkinliklere yüzde ver, adaya o kriterlerin YetkinCV vaka testini uygula. Ağırlıklı puana göre ilk N aday mülakat listesine çıkar. CV metni kamu dizinine basılmaz."
        />
        <ul className="mt-5 flex flex-wrap gap-2">
          {TRUST_BADGES.map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
            >
              <IconShield className="h-3.5 w-3.5 text-blue-600" />
              {badge}
            </li>
          ))}
        </ul>
        <a href="/kurumsal/ilanlar" className="mt-4 inline-flex text-sm font-semibold text-[var(--safir)]">
          İlanlar ve kısa liste
        </a>
      </section>
      <div className="pt-4">
        <KurumsalOpsDeck
          jobs={jobs}
          skills={skills}
          boardUnavailable={boardUnavailable}
          signedIn={Boolean(session)}
          loginHref={buildCitizenLoginHref("/kurumsal")}
          screeningPrice={prices.jobScreening}
          offerHref="#kurumsal-teklif"
        />
      </div>
      <div className="grid items-stretch gap-4 pt-4 lg:grid-cols-2">
        <article className="relative flex h-full flex-col rounded-[var(--radius-card)] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl ring-2 ring-blue-500">
          <span className="absolute -top-3 left-5 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
            Kurumsal Ekipler İçin
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">10 mağaza koltuğu</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">E-ticaret ajans paketi</h2>
          <OfferChecks
            featured
            lines={[
              "Çoklu mağaza yönetimi.",
              "Trendyol ile Hepsiburada senkronizasyonu.",
              "Ajans ekibi için ortak işletim paneli.",
              "Ciro platformda bölünmez; tahsilat size özel teklifle yürür.",
            ]}
          />
          <p className="mt-5 text-3xl font-semibold tracking-tight text-white" data-price-honesty={agencyPrice.honesty}>
            {agencyPrice.label}
          </p>
          <OfferCta featured />
        </article>
        <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">5+ koltuk</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">KOBİ ekip rozeti</h2>
          <OfferChecks
            lines={[
              "Şirket çalışanları için toplu yetkinlik ölçümü.",
              "Sunucu onaylı yetkinlik sertifikasyonu.",
              "Tek teklif, kurumsal fatura künyesi.",
              "Ekip koltukları teklifle açılır.",
            ]}
          />
          <p className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]" data-price-honesty={teamPrice.honesty}>
            {teamPrice.label}
          </p>
          <OfferCta />
        </article>
      </div>
      <div id="kurumsal-teklif" className="mt-4 grid scroll-mt-6 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)]">
        <Card title="Kurumsal talep" eyebrow="Self-servis">
          <KurumsalOfferForm />
        </Card>
        <TipPanel title="Self-serviste ne olur">
          <ul className="grid gap-2">
            <li className="border-l-4 border-blue-500 pl-3">
              Talebinizi bırakın, kurumsal paneliniz tanımlansın. Bu formda kart çekilmez.
            </li>
            <li className="border-l-4 border-emerald-500 pl-3">
              Hesabınızı şimdi oluşturun, kurulumunuzu dakikalar içinde kendiniz tamamlayın.
            </li>
            <li className="border-l-4 border-amber-500 pl-3">
              İlan açma ve aday eleme bu sayfadaki panelden yürür; özel paketler talep formundan tanımlanır.
            </li>
          </ul>
        </TipPanel>
      </div>
    </RoomFrame>
  );
}

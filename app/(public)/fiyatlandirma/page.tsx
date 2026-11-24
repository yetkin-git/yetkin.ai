import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { JsonLd } from "@/components/seo/json-ld";
import { PricingCheckoutTracker } from "@/components/pricing/pricing-checkout-tracker";
import { TezgahGuestCheckoutCard } from "@/components/tezgah/guest-checkout-card";
import { breadcrumbListJsonLd, jsonLdDocument, productsJsonLd } from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";
import { loadPublicPricingVitrine, type PublicVitrineItem } from "@/lib/pricing/public-vitrine";
import { TRIAL_COPY, TRIAL_HONESTY_NOTE } from "@/lib/pricing/trial-copy";
import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_PRO_MONTHLY_CREDITS,
} from "@/lib/tezgah/catalog";

export const metadata: Metadata = pageMetadata(PAGE_SEO.pricing);

const FEATURED_VITRINE_ID = "commerce:growth";

const TRUST_BADGES = [
  "PayTR 3D Secure güvencesi",
  "Fatura tahsilatta kesilir",
  "Kapalı paket satın alınamaz",
] as const;

type CompareCell = boolean | string;

type CompareRow = {
  id: string;
  label: string;
  /** Vitrin sırası: free, pro, commerce, grant, career, kurumsal. */
  values: readonly [CompareCell, CompareCell, CompareCell, CompareCell, CompareCell, CompareCell];
};

const COMPARE_COLUMNS = [
  { id: "free", label: "Ücretsiz" },
  { id: "pro", label: "Tezgâh Pro" },
  { id: "commerce", label: "E-Ticaret" },
  { id: "grant", label: "Hibe Dosyası" },
  { id: "career", label: "YetkinCV" },
  { id: "kurumsal", label: "Kurumsal" },
] as const;

/**
 * Karşılaştırma matrisi — satırlar ürünün gerçek sınırlarıdır.
 * Değerler uydurulmaz: her hücre `lib/tezgah/catalog.ts`, `lib/pricing/public-vitrine.ts`
 * ve `/career` sınav sözleşmesinden türetilmiştir. "—" = paket kapsamı dışında.
 * S-01: kredi rakamları elle yazılmaz; `TEZGAH_*_MONTHLY_CREDITS` sabitinden okunur.
 */
const COMPARE_ROWS: readonly CompareRow[] = [
  {
    id: "quota",
    label: "Aylık Tezgâh Kredisi",
    values: [
      `Ayda ${TEZGAH_FREE_MONTHLY_CREDITS} kredi (misafir günde ${TEZGAH_GUEST_DAILY_LIMIT})`,
      `Ayda ${TEZGAH_PRO_MONTHLY_CREDITS} kredi`,
      "—",
      "—",
      "—",
      "Ekip kotası",
    ],
  },
  {
    id: "download",
    label: "DOCX / ZIP İndirme",
    values: ["—", true, "—", true, true, true],
  },
  {
    id: "marketplace",
    label: "Pazaryeri Entegrasyonu",
    values: ["—", "Ürün açıklaması", true, "—", "—", true],
  },
  {
    id: "grant",
    label: "Hibe Dosyası",
    values: ["Ücretsiz uygunluk testi", "—", "—", true, "—", "Talep üzerine"],
  },
  {
    id: "passport",
    label: "YetkinCV Pasaportu",
    values: ["Sınav ücretsiz", "—", "—", "—", "Sınav ücretsiz · yayın tek seferlik", "Aday eleme"],
  },
  {
    id: "support",
    label: "Öncelikli Destek",
    values: ["—", true, true, true, "—", true],
  },
];

function compareCell(cell: CompareCell): string {
  return typeof cell === "string" ? cell : "Var";
}

function featureLines(summary: string): string[] {
  const lines = summary
    .split(/(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.length > 0 ? lines : [summary];
}

/**
 * SEO-01: `Offer.price` için tam lira metni.
 * `amountMinor` null ise `null` döner ve ürün şemaya girmez — fiyat uydurulmaz.
 * Kuruş hanesi varsa `"590.50"`, yoksa `"590.00"` biçiminde yazılır (schema.org ondalık ister).
 */
function priceMajorOf(item: PublicVitrineItem): string | null {
  if (item.amountMinor == null || !Number.isInteger(item.amountMinor) || item.amountMinor <= 0) {
    return null;
  }
  const whole = Math.floor(item.amountMinor / 100);
  const kurus = item.amountMinor % 100;
  return `${whole}.${String(kurus).padStart(2, "0")}`;
}

/**
 * Vitrin CTA'sı korumalı hedefi ham basmaz: `/panel/e-ticaret` oturumsuz ziyaretçiyi
 * çıplak `/login` duvarına düşürmesin diye `next` parametreli kayıt yoluna çevrilir.
 */
function vitrineHref(href: string): Route {
  if (!href.startsWith("/")) {
    return href as Route;
  }
  return (isProtectedCitizenPath(href) ? buildCitizenRegisterHref(href) : href) as Route;
}

function PriceMark({ item, featured }: { item: PublicVitrineItem; featured?: boolean }) {
  const planned = item.honesty === "planned";
  return (
    <p
      className={cn(
        "text-3xl font-semibold tracking-tight",
        featured ? "text-white" : "text-[var(--foreground)]",
      )}
      data-price-honesty={item.honesty}
    >
      {planned ? item.statusLabel : item.priceLabel}
    </p>
  );
}

function FeatureList({ lines, featured }: { lines: readonly string[]; featured?: boolean }) {
  return (
    <ul className="mt-4 grid flex-1 gap-2">
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2 text-sm leading-6">
          <IconCheck className={cn("mt-1 h-4 w-4 shrink-0", featured ? "text-emerald-300" : "text-emerald-500")} />
          <span className={featured ? "text-slate-100" : "text-[var(--foreground)]"}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function VitrineCard({ item, cta }: { item: PublicVitrineItem; cta: string }) {
  const planned = item.honesty === "planned";
  const featured = item.id === FEATURED_VITRINE_ID;
  const grant = item.id === "tezgah:grant-dossier";
  return (
    <article
      data-vitrine-item={item.id}
      className={cn(
        "relative flex h-full flex-col rounded-[var(--radius-card)] p-5",
        featured
          ? "bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl ring-2 ring-blue-500"
          : grant
            ? "border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-sm ring-2 ring-emerald-500/40"
            : "border border-[var(--border)] bg-[var(--surface)] shadow-sm",
      )}
    >
      {featured ? (
        <span className="absolute -top-3 left-5 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
          KOBİ&apos;ler İçin Önerilen
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.16em]",
            featured ? "text-blue-200" : "text-[var(--muted)]",
          )}
        >
          {item.code}
        </p>
        <Badge tone={planned ? "amber" : "emerald"}>{planned ? item.statusLabel : "Açık"}</Badge>
      </div>
      <h3 className={cn("mt-3 text-lg font-semibold tracking-tight", featured ? "text-white" : "text-[var(--foreground)]")}>
        {item.title}
      </h3>
      <FeatureList lines={item.lines && item.lines.length > 0 ? item.lines : featureLines(item.summary)} featured={featured} />
      <div className="mt-5">
        {item.trial ? (
          <>
            {/* Deneme teklifi önce: müşteri bugün ne ödeyeceğini bilir. */}
            <p
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
                featured ? "bg-emerald-400/20 text-emerald-200" : "bg-emerald-100 text-emerald-800",
              )}
              data-vitrine-trial-headline={item.id}
            >
              {item.trial.headline}
            </p>
            <p className={cn("mt-2 text-sm font-medium", featured ? "text-blue-100" : "text-[var(--muted)]")}>
              {item.trial.verifyLabel}
            </p>
          </>
        ) : null}
        <PriceMark item={item} featured={featured} />
        {planned ? null : (
          <p className={cn("mt-1 text-xs", featured ? "text-blue-100" : "text-[var(--muted)]")}>
            {item.trial?.renewalLabel ?? item.statusLabel}
          </p>
        )}
        {item.trial ? (
          <p className={cn("mt-1 text-xs", featured ? "text-emerald-200" : "text-[var(--emerald)]")}>
            {item.trial.cancelLine}
          </p>
        ) : null}
      </div>
      {item.href ? (
        <div className="mt-5">
          <LinkButton
            href={vitrineHref(item.href)}
            size="md"
            variant={featured ? "secondary" : planned ? "outline" : "primary"}
            data-pricing-cta={item.id}
            className={
              featured
                ? "!h-auto !min-h-10 !w-full !whitespace-normal !bg-white !px-3 !py-2.5 !text-center !leading-snug !text-slate-950 shadow-md hover:!bg-blue-50"
                : "!w-full"
            }
          >
            {planned ? "Talebinizi bırakın" : cta}
          </LinkButton>
        </div>
      ) : null}
    </article>
  );
}

export default async function PricingPage() {
  const vitrine = await loadPublicPricingVitrine();
  // SEO-01: Product/Offer yalnız canlı katalog tutarı olan satırlardan üretilir.
  const productNodes = productsJsonLd({
    name: "yetkin.ai paketleri",
    path: PAGE_SEO.pricing.path,
    items: [
      {
        id: vitrine.tezgahPro.id,
        name: vitrine.tezgahPro.title,
        description: vitrine.tezgahPro.summary,
        priceMajor: priceMajorOf(vitrine.tezgahPro),
        path: PAGE_SEO.pricing.path,
        monthly: true,
      },
      ...vitrine.commercePlans.map((plan) => ({
        id: plan.id,
        name: plan.title,
        description: plan.summary,
        priceMajor: priceMajorOf(plan),
        path: PAGE_SEO.pricing.path,
        monthly: true,
      })),
      {
        id: vitrine.grantDossier.id,
        name: vitrine.grantDossier.title,
        description: vitrine.grantDossier.summary,
        priceMajor: priceMajorOf(vitrine.grantDossier),
        path: PAGE_SEO.pricing.path,
      },
    ],
  });
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          ...productNodes,
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Fiyatlar", path: PAGE_SEO.pricing.path },
          ]),
        ])}
      />
      <PricingCheckoutTracker
        items={[vitrine.tezgahPro, ...vitrine.commercePlans, vitrine.grantDossier].map((item) => ({
          id: item.id,
          title: item.title,
          amountMinor: item.amountMinor,
        }))}
      />
      <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-slate-50 via-blue-50/80 to-white px-6 py-8 ring-1 ring-blue-100">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_68%)]"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">Fiyatlar</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Ücretsiz başla. Kredi ve işletme lisansını katalogdaki tutarla aç.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Uygulama rehberleri ücretsizdir. Tahsilat AI Tezgâh Pro, YetkinHibe dosyası ve e-ticaret lisansındadır.
          Tezgâh artık aylık kredi havuzuyla çalışır: ayda {TEZGAH_FREE_MONTHLY_CREDITS} ücretsiz kredi, Pro'da{" "}
          {TEZGAH_PRO_MONTHLY_CREDITS} kredi. Kullanılmayan kredinin yarısı sonraki aya devreder.
          E-Ticaret lisansında ilk 30 gün ücretsizdir: bugün yalnız sembolik kart doğrulama bedeli tahsil edilir,
          ardından aylık yenileme başlar. Ekip rozeti, ajans lisansı ve aday eleme için talebini bırak; paneli
          kendin tanımla. YetkinCV sınavı, puanı, SWOT'u ve 30/60/90 planı ücretsizdir; yalnız kamuya açık yayın
          tek seferlik ücretlidir. Tutar katalog satırından okunur; satır yoksa fiyat basılmaz.
        </p>
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
        <p className="mt-4 text-sm font-medium">
          <Link href="/" className="text-[var(--safir-deep)] hover:underline">
            Ana sayfa
          </Link>
        </p>
      </section>

      <section className="mt-10" aria-label="Ücretsiz başlangıç ve lisanslar">
        <h2 id="pricing-packages-heading" className="text-xl font-semibold tracking-tight">
          Paketler
        </h2>
        <ul className="mt-4 grid items-stretch gap-6 md:grid-cols-2">
          <li>
            <VitrineCard item={vitrine.freeStart} cta="Ücretsiz başla" />
          </li>
          <li>
            <VitrineCard item={vitrine.tezgahPro} cta="AI Tezgâh Pro’yu aç" />
          </li>
          {vitrine.commercePlans.map((plan) => (
            <li key={plan.id} className={plan.id === FEATURED_VITRINE_ID ? "pt-3" : undefined}>
              <VitrineCard item={plan} cta={TRIAL_COPY.cta} />
            </li>
          ))}
          <li>
            <VitrineCard item={vitrine.grantDossier} cta="YetkinHibe dosyasını aç" />
          </li>
          <li>
            <VitrineCard item={vitrine.yetkinCv} cta="YetkinCV'yi İncele" />
          </li>
          <li>
            <VitrineCard item={vitrine.kurumsal} cta="Kurumsal teklife git" />
          </li>
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="guest-checkout-heading" data-pricing-guest="">
        <h2 id="guest-checkout-heading" className="text-xl font-semibold tracking-tight">
          Kayıt olmadan Pro'ya geç
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Tezgâh zaten kayıtsız üretim yapıyor; ödemesi de kayıtsız olabilir. E-posta ve fatura künyeni ver,
          ödemeyi yap. Hesabın ödeme onayından sonra e-postandaki tek kullanımlık bağlantıyla açılır. Ödemeden
          önce hesap açılmaz; para, hesabın açıldığı anda cüzdanına ve Pro aboneliğine yazılır.
        </p>
        <div className="mt-4">
          <TezgahGuestCheckoutCard />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="pricing-compare-heading" data-pricing-compare="">
        <h2 id="pricing-compare-heading" className="text-xl font-semibold tracking-tight">
          Paketleri yan yana karşılaştır
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Satırlar ürünün gerçek sınırlarıdır. “—” o paketin kapsamı dışında demektir.
        </p>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Yetkin paketlerinin özellik karşılaştırması: günlük tezgâh kotası, DOCX/ZIP indirme,
              pazaryeri entegrasyonu, hibe dosyası, YetkinCV pasaportu ve öncelikli destek.
            </caption>
            <thead>
              <tr className="bg-[var(--surface-muted)]">
                <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Özellik
                </th>
                {COMPARE_COLUMNS.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)]">
                  <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {row.label}
                  </th>
                  {row.values.map((cell, index) => (
                    <td
                      key={COMPARE_COLUMNS[index]?.id ?? index}
                      className={cn(
                        "px-4 py-3",
                        cell === true ? "text-emerald-700" : "text-[var(--muted)]",
                      )}
                    >
                      {cell === true ? (
                        <span className="inline-flex items-center gap-1.5">
                          <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="sr-only">Kapsam içinde</span>
                        </span>
                      ) : (
                        compareCell(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 max-w-3xl rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5" data-pricing-honesty="">
        <h2 className="text-base font-semibold">Dürüstlük notu</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Listelenen tutarlar KDV dahildir. Fatura, tahsilat sırasında kesilir. {TRIAL_HONESTY_NOTE}{" "}
          YetkinCV puanı katalog tutarıyla değil, sunucudaki vaka testi sonucuyla yazılır. Satın alma tek başına
          puan basmaz; yalnız kamuya açık kart yayınını açar.
        </p>
      </section>
    </main>
  );
}

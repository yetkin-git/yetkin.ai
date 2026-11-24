import type { Metadata, Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { TipPanel } from "@/components/ui/public-hero";
import { breadcrumbListJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { buildCitizenLoginHref, buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { loadPublicPricingVitrine } from "@/lib/pricing/public-vitrine";
import { TRIAL_COPY } from "@/lib/pricing/trial-copy";

export const metadata: Metadata = pageMetadata(PAGE_SEO.eTicaret);
export const dynamic = "force-dynamic";

/** Kokpitin korumalı yolu. Oturumu açık ziyaretçi doğrudan buraya gider. */
const PANEL_PATH = "/panel/e-ticaret" as const;

/** Katalog satırı yoksa yenileme tutarı basılmaz; bu cümle yerine geçer. */
const RENEWAL_FALLBACK = "Deneme bitince aylık yenileme katalogdaki tutardan başlar.";

const HERO_BADGES = ["Trendyol ve Hepsiburada", "Stok onayı sende", TRIAL_COPY.badge] as const;

/** Bugün çalışan akışlar. Her madde kod yolunda var; kapsam dışı bir şey burada yazılmaz. */
const LIVE_CAPABILITIES = [
  {
    title: "Stok ve sipariş, iki yönlü",
    body: "Stok ve fiyat panelden pazaryerine gider. Pazaryerinde düşen sipariş panele gelir.",
  },
  {
    title: "Müşteri sorusuna AI taslağı",
    body: "Gelen soruya marka dilinde taslak yanıt hazırlanır. Taslak, sen onaylamadan müşteriye gitmez.",
  },
  {
    title: "Stok defteri",
    body: "Her stok hareketi deftere işlenir. Satış stoğu eksiye düşmez.",
  },
] as const;

/** Dört kâr ve büyüme motoru — panelde canlı. Rakamlar kodda; AI yalnız metin yazar. */
const PROFIT_ENGINES = [
  {
    title: "Kâr korumalı indirim",
    body: "İndirim ve komisyon sonrası net kârını, indirimi yayına almadan önce görürsün. Başabaşın üstü zarar uyarısı verir.",
  },
  {
    title: "Barem kırıcı paketler",
    body: "2'li ve 3'lü setlerle aynı kargo bandında kargo tasarrufu ve net kâr artışı önerir.",
  },
  {
    title: "Günlük kâr özeti",
    body: "Zarar eden SKU'ları ve kritik stoğu sabah özetler; tek tıkla fiyat veya paket aksiyonu sunar.",
  },
  {
    title: "Ne satılır? radarı",
    body: "Katalogundaki kategori ve fiyat boşluklarını tarar. Yeterli veri yoksa uydurma yapmaz.",
  },
] as const;

const STEPS = [
  "Ücretsiz hesabını aç, denemeyi başlat.",
  "Trendyol veya Hepsiburada bağlantını panelde tanımla.",
  "Ürünlerini eşleştir, stoğunu onayla. Müşteri soruları AI taslağıyla gelir.",
] as const;

/**
 * Yenileme tutarı canlı katalogdan okunur. Veritabanı yanıt vermezse sayfa
 * düşmez; tutar basılmaz ve yalnız dürüst yedek cümle görünür.
 */
async function loadCommerceVitrine() {
  try {
    return await loadPublicPricingVitrine();
  } catch {
    return null;
  }
}

export default async function ETicaretVitrinePage() {
  const [session, vitrine] = await Promise.all([getSession(), loadCommerceVitrine()]);
  const renewalLabel = vitrine?.commerce.trial?.renewalLabel ?? null;
  const plans = vitrine?.commercePlans ?? [];
  const registerHref = buildCitizenRegisterHref(PANEL_PATH) as Route;
  const loginHref = buildCitizenLoginHref(PANEL_PATH) as Route;

  return (
    <RoomFrame className="px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "E-Ticaret", path: PAGE_SEO.eTicaret.path },
          ]),
        ])}
      />

      <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-slate-50 via-blue-50/80 to-white px-6 py-8 ring-1 ring-blue-100">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_68%)]"
        />
        <PageHeader
          eyebrow="Yetkin Commerce"
          title={PAGE_SEO.eTicaret.title}
          description="Trendyol ve Hepsiburada stokun, fiyatın ve siparişin tek panelde. Stok, sen onaylamadan pazaryerine yayılmaz; müşteri soruları AI taslağıyla gelir ve göndermeyi yine sen seçersin."
        />
        <ul className="mt-5 flex flex-wrap gap-2">
          {HERO_BADGES.map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
            >
              <IconShield className="h-3.5 w-3.5 text-blue-600" />
              {badge}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {session ? (
            <LinkButton href={PANEL_PATH} size="lg">
              E-Ticaret panelini aç
            </LinkButton>
          ) : (
            <>
              <LinkButton href={registerHref} size="lg">
                {TRIAL_COPY.cta}
              </LinkButton>
              <LinkButton href={loginHref} variant="outline" size="lg">
                Giriş yap
              </LinkButton>
            </>
          )}
          <LinkButton href="/fiyatlandirma" variant="ghost" size="lg">
            Fiyatları gör
          </LinkButton>
        </div>
      </section>

      <section aria-labelledby="eticaret-bugun" className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
            Bugün canlı
          </p>
          <h2 id="eticaret-bugun" className="mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]">
            Bugün ne çalışır
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Pazaryeri kapsamı: Trendyol ve Hepsiburada.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {LIVE_CAPABILITIES.map((item) => (
            <Card key={item.title} title={item.title}>
              {item.body}
            </Card>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)]">
        <Card variant="featured" eyebrow="Kart doğrulamalı deneme" title={TRIAL_COPY.title}>
          <p className="text-base leading-7 text-[var(--foreground)]">{TRIAL_COPY.verifyLabel}</p>
          <ul className="mt-4 grid gap-2">
            <li className="flex items-start gap-2">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{renewalLabel ?? RENEWAL_FALLBACK}</span>
            </li>
            <li className="flex items-start gap-2">
              <IconCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{TRIAL_COPY.cancelLine}</span>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{TRIAL_COPY.honestyLine}</p>
        </Card>
        <TipPanel title="Nasıl başlarsın">
          <ol className="list-decimal space-y-2 pl-5">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </TipPanel>
      </div>

      <section aria-labelledby="eticaret-planlar" className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
            Üç plan
          </p>
          <h2 id="eticaret-planlar" className="mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]">
            Başlangıç, Büyüme ve Kurumsal
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{TRIAL_COPY.headline}. Süre bitince seçtiğin planın tutarı yenilenir.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} eyebrow={plan.code} title={plan.title} variant={plan.id === "commerce:growth" ? "featured" : "default"}>
              <p className="text-lg font-semibold">{plan.priceLabel}</p>
              <ul className="mt-3 grid gap-1.5">
                {(plan.lines ?? []).map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="eticaret-kar" className="space-y-4">
        <div>
          <Badge tone="emerald">Canlı</Badge>
          <h2 id="eticaret-kar" className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
            Dört kâr ve büyüme motoru
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Panelde maliyetini girersin; kâr, indirim ve paket hesabı kodda yapılır. AI yalnız açıklama metni yazar.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PROFIT_ENGINES.map((item) => (
            <Card key={item.title} title={item.title}>
              {item.body}
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold tracking-tight text-white">Denemeyi bugün başlat</h2>
          <p className="mt-1 text-sm leading-6 text-blue-100">{TRIAL_COPY.cancelLine}</p>
        </div>
        {session ? (
          <LinkButton href={PANEL_PATH} size="lg">
            E-Ticaret panelini aç
          </LinkButton>
        ) : (
          <LinkButton href={registerHref} size="lg">
            {TRIAL_COPY.cta}
          </LinkButton>
        )}
      </section>
    </RoomFrame>
  );
}

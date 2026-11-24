import type { Metadata } from "next";
import { GrantEligibilityWidget } from "@/components/hibe/grant-eligibility-widget";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { loadPublicPricingVitrine } from "@/lib/pricing/public-vitrine";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.hibe,
  robots: { index: true, follow: true },
});

export const dynamic = "force-dynamic";

const FAQ = [
  {
    question: "YetkinHibe resmî başvuru penceresi midir?",
    answer:
      "Hayır. Uygunluk skoru ve proje dosyası katalogdaki açık çağrıya göre hazırlanır. Başvuru kurumun kendi ilanından yapılır. Resmî onay değildir.",
  },
  {
    question: "Ücretsiz uygunluk neyi gösterir?",
    answer:
      "Seçtiğin NACE, il ve ölçek gerçek firma profili olarak açık çağrılarla eşleşir. Program üst limiti katalog tavanıdır. Tutarlar toplanmaz.",
  },
  {
    question: "Tam proje dosyasının fiyatı nereden gelir?",
    answer:
      "Fiyat canlı katalog satırındadır. Sayfa tutar uydurmaz. Satın alma PayTR ile kokpitte tamamlanır.",
  },
] as const;

export default async function HibeVitrinePage() {
  let priceLabel: string | null = null;
  try {
    const vitrine = await loadPublicPricingVitrine();
    priceLabel = vitrine.grantDossier.priceLabel;
  } catch {
    priceLabel = null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <JsonLd data={jsonLdDocument([faqPageJsonLd(FAQ)])} />
      <PageHeader
        eyebrow="YetkinHibe"
        title="Hibe uygunluğunu gör, proje dosyasını hazırla"
        description="KOSGEB, TÜBİTAK, TKDK, kalkınma ajansları ve bakanlık çağrıları firma profiline göre eşleşir. Skor katalogdandır. Resmî onay değildir."
      />
      <GrantEligibilityWidget />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-lg font-semibold">Tam proje dosyası</h2>
        <p className="mt-2 text-sm leading-6">
          {priceLabel
            ? `Katalog fiyatı ${priceLabel}. Ödeme PayTR ile kokpitte açılır.`
            : "Katalog satırı okunamadı. Tutar uydurulmaz."}
        </p>
        <div className="mt-4">
          <LinkButton href={buildCitizenRegisterHref("/panel/hibe")}>Kokpite geç</LinkButton>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Sık sorulanlar</h2>
        <dl className="mt-3 space-y-3">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-medium">{item.question}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

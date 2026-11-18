import type { Metadata } from "next";
import { PublicTetkikForm } from "@/components/tezgah/public-tetkik-form";
import { PublicHero, TipPanel } from "@/components/ui/public-hero";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.tetkik,
  robots: { index: true, follow: true },
});

export default function TetkikPage() {
  return (
    <main className="mx-auto w-full max-w-6xl bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_46%)] px-6 pb-16 pt-10">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
        <div className="space-y-4">
          <PublicHero
            eyebrow="Web sitesi tetkiki"
            title="Siten kaç puan?"
            description="Herkese açık ana sayfanın başlığı, hızı ve dönüşüm kapısı kodda ölçülür. Kayıt yoktur. Model anlatımı yoktur. Adres okunamazsa skor yazılmaz."
          />
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <PublicTetkikForm />
          </section>
        </div>
        <TipPanel title="Skor nasıl okunur">
          <ul className="grid gap-3">
            <li className="rounded-xl bg-blue-50 px-3 py-2 text-blue-800">
              Başlık, sayfanın ne sattığını ilk bakışta söylüyor mu?
            </li>
            <li className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
              İlk bayt gecikmesi ziyaretçiyi bekletiyor mu?
            </li>
            <li className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
              Dönüşüm kapısı görünür mü, yoksa sayfa yalnız duruyor mu?
            </li>
          </ul>
        </TipPanel>
      </div>
    </main>
  );
}

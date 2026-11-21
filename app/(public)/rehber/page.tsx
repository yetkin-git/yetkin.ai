import type { Metadata, Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { WorkflowFlowMap } from "@/components/rehber/workflow-flow-map";
import { WorkflowModuleTabs, WorkflowStepper } from "@/components/rehber/workflow-stepper";
import { IconArrow, IconBolt, IconCheck } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { getSession } from "@/lib/kernel/auth/session";
import { PUBLIC_GUIDES, guidePath } from "@/lib/copy/guides";
import { breadcrumbListJsonLd, faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { GUIDE_FAQ, PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { readWorkflowProgress } from "@/lib/rehber/progress";
import {
  parseWorkflowModuleId,
  TRIAL_VERIFY_AMOUNT_LABEL,
  WORKFLOW_MODULES,
  workflowModule,
} from "@/lib/rehber/workflows";

/**
 * /rehber — Görsel İş Akış ve Kurulum Merkezi.
 *
 * Makale dizini değil: dört aktif ticari modülün uçtan uca kurulum akışı.
 * Modül sekmesi sunucuda çözülür (`?modul=`); JS çalışmadan da akış okunur.
 * Oturum açmış kullanıcıda tamamlanan adımlar rozetlenir; okuma fırlatmaz,
 * hata olursa ziyaretçi görünümüne düşer (`lib/rehber/progress.ts`).
 *
 * Oturumsuz ziyaretçi adım içinde `/register` duvarına zorlanmaz: korumalı
 * adımda örnek ekran önizlemesi, açık araçta kayıt gerekmeyen bağ, en altta
 * tek ana davet kartı vardır.
 */

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.guide,
  robots: { index: true, follow: true },
});

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ modul?: string }>;
}) {
  const params = await searchParams;
  const activeId = parseWorkflowModuleId(params.modul);
  const active = workflowModule(activeId) ?? WORKFLOW_MODULES[0]!;

  // Sessiz okuma: hata fırlatmaz, ziyaretçide boş duruma düşer.
  const [progress, session] = await Promise.all([
    readWorkflowProgress(),
    getSession().catch(() => null),
  ]);
  const signedIn = Boolean(session?.id);
  const activeProgress = progress[active.id] ?? { completed: [], note: null };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_46%)] px-6 pb-8 pt-12">
      <JsonLd
        data={jsonLdDocument([
          faqPageJsonLd(GUIDE_FAQ),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Rehber", path: PAGE_SEO.guide.path },
          ]),
        ])}
      />

      <PublicHero
        eyebrow="Rehber · İş akışı"
        title="Hangi modülü kuruyorsun? Adım adım gör."
        description="Dört aktif modülün uçtan uca kurulum akışı: her adımda süre, somut girdi → çıktı, kritik ipucu ve örnek ekran. Makale değil, süreç şeması — önce anlayın, sonra hesabınızı açın."
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/tezgah" size="lg" variant="success">
            <IconBolt className="h-4 w-4" />
            Ücretsiz dene
          </LinkButton>
          <LinkButton href="/fiyatlandirma" size="lg" variant="outline">
            Paketleri karşılaştır
            <IconArrow className="h-4 w-4" />
          </LinkButton>
        </div>
      </PublicHero>

      <WorkflowFlowMap activeId={active.id} />

      <WorkflowModuleTabs
        modules={WORKFLOW_MODULES}
        activeId={active.id}
        basePath={PAGE_SEO.guide.path}
      />

      <WorkflowStepper
        module={active}
        completed={activeProgress.completed}
        note={activeProgress.note}
        signedIn={signedIn}
      />

      <section className="mt-10" aria-labelledby="rehber-kisa-yol">
        <h2 id="rehber-kisa-yol" className="text-lg font-semibold tracking-tight">
          Tek iş için kısa yol
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Kurulum akışı yerine tek bir çıktı lazımsa aşağıdaki odaklı rehberler doğrudan ilgili araca gider.
        </p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {PUBLIC_GUIDES.map((guide) => (
            <li key={guide.slug}>
              <LinkButton
                href={guidePath(guide.slug) as Route}
                variant="outline"
                size="sm"
                className="w-full justify-between"
              >
                {guide.title}
                <IconArrow className="h-3.5 w-3.5" />
              </LinkButton>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <IconCheck className="h-4 w-4 text-[var(--emerald)]" />
          Dürüstlük notu
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Bu sayfa kurulum sırasını ve gerçek ekranları gösterir. Tahsilat, kabul ve onay kararı
          ilgili kurumun veya ödeme sağlayıcısının kendi sistemindedir; burada tutar veya sonuç
          vaat edilmez.
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          E-Ticaret lisansında ilk 30 gün ücretsizdir. Kart doğrulaması için{" "}
          <strong className="font-semibold text-[var(--foreground)]">
            {TRIAL_VERIFY_AMOUNT_LABEL} alınır
          </strong>
          ; bu bedel bakiyenize yazılmaz ve iade taahhüdü değildir. Deneme bitince aylık yenileme
          katalogdaki tutardan başlar. Beğenmezseniz dönem sonu iptali tek tıkla mağaza panelindedir.
        </p>
      </section>

      <LandingFaq heading="Sık sorulanlar" items={GUIDE_FAQ} />
    </main>
  );
}

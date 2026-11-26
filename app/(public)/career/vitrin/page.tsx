import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { IconArrow, IconSearch } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { loadTalentDirectory } from "@/lib/career/talent-directory-load";
import {
  TALENT_DIRECTORY_EXAM_CTA,
  TALENT_DIRECTORY_EXAM_HREF,
  TALENT_DIRECTORY_JOBS_CTA,
  TALENT_DIRECTORY_JOBS_HREF,
  TALENT_DIRECTORY_PATH,
  TALENT_DIRECTORY_PROVINCES,
  TALENT_DIRECTORY_VERTICALS,
  parseTalentCity,
  parseTalentVertical,
} from "@/lib/career/talent-directory";
import {
  breadcrumbListJsonLd,
  buildTalentDirectoryJsonLd,
  faqPageJsonLd,
  jsonLdDocument,
} from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

const DIRECTORY_FAQ = [
  {
    question: "Bu sayfa freelancer pazar yeri midir?",
    answer:
      "Hayır. Burası YetkinCV mührü kazanmış yeteneklerin kamu doğrulama dizinidir. Teklif, emanet (escrow) ve proje ticareti burada yapılmaz.",
  },
  {
    question: "Liste neden boş görünebilir?",
    answer:
      "Aynı dikey veya ilde 5'ten az onaylı profil varken liste basılmaz. Sahte profil üretilmez.",
  },
  {
    question: "Nasıl listelenirim?",
    answer:
      "YetkinCV'nin 60 soruluk sınavını Kariyer (/career) sayfasında çöz. Mühür kamu kanıtı /vize adresinde oluşur. Eşik dolunca vitrin açılır.",
  },
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dikey?: string; il?: string; page?: string; pageSize?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  const filtered = Boolean(query.dikey?.trim() || query.il?.trim() || query.page?.trim());
  return pageMetadata({
    ...PAGE_SEO.uzmanlar,
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  });
}

export default async function CareerVitrinPage({
  searchParams,
}: {
  searchParams: Promise<{ dikey?: string; il?: string; page?: string; pageSize?: string }>;
}) {
  const query = await searchParams;
  const vertical = parseTalentVertical(query.dikey);
  const city = parseTalentCity(query.il);
  const directory = await loadTalentDirectory({
    dikey: query.dikey,
    il: query.il,
    page: query.page,
    pageSize: query.pageSize,
  });
  const directoryNodes =
    directory.status === "listed"
      ? [
          buildTalentDirectoryJsonLd({
            name: "YetkinCV Onaylı Yetenek Vitrini",
            path: TALENT_DIRECTORY_PATH,
            experts: directory.experts.map((expert) => ({
              name: expert.displayName,
              path: expert.href,
              credentialName: expert.title,
              credentialUrl: expert.href,
            })),
          }),
        ]
      : [];
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          faqPageJsonLd(DIRECTORY_FAQ),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Kariyer", path: "/career" },
            { name: "Yetenek Vitrini", path: TALENT_DIRECTORY_PATH },
          ]),
          ...directoryNodes,
        ])}
      />
      <PublicHero
        eyebrow="YetkinCV kamu dizini"
        title="YetkinCV Onaylı Yetenek Vitrini"
        description="Burası freelancer pazar yeri değildir. 60 soruluk sınavı geçip YetkinCV mührü kazanmış yeteneklerin kamu doğrulama dizinidir. Teklif, emanet (escrow) ve proje ticareti burada yapılmaz. İletişim, kartın sahibiyle senin arandadır."
      />

      <form
        method="get"
        action={TALENT_DIRECTORY_PATH}
        className="mt-8 grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-2"
      >
        <label className="flex min-w-40 flex-col gap-1.5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <IconSearch className="h-3.5 w-3.5 text-blue-600" />
            Dikey
          </span>
          <select name="dikey" defaultValue={vertical ?? ""} className={INPUT_SURFACE_CLASS}>
            <option value="">Tümü</option>
            {TALENT_DIRECTORY_VERTICALS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-40 flex-col gap-1.5 text-sm">
          <span className="font-medium">İl</span>
          <select
            name="il"
            defaultValue={city.kind === "province" ? city.name : ""}
            className={INPUT_SURFACE_CLASS}
          >
            <option value="">Tümü</option>
            {TALENT_DIRECTORY_PROVINCES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 md:col-span-2 md:w-fit"
        >
          Filtrele
          <IconArrow className="h-3.5 w-3.5" />
        </button>
      </form>

      {directory.status === "listed" && directory.stats.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {directory.stats.map((stat) => (
            <li
              key={stat.verticalId}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted)]"
            >
              {stat.label}: {stat.count}
            </li>
          ))}
        </ul>
      ) : null}

      {directory.status === "empty" ? (
        <Card className="mt-8 space-y-4 p-6">
          <p className="text-[var(--foreground)]">{directory.message}</p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Liste, aynı kırılımda en az beş onaylı profil varken açılır. Sahte veri basılmaz.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={TALENT_DIRECTORY_EXAM_HREF as Route} size="sm">
              {TALENT_DIRECTORY_EXAM_CTA}
              <IconArrow className="h-3.5 w-3.5" />
            </LinkButton>
            <LinkButton href={TALENT_DIRECTORY_JOBS_HREF as Route} size="sm" variant="outline">
              {TALENT_DIRECTORY_JOBS_CTA}
              <IconArrow className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </Card>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {directory.experts.map((expert) => (
            <li key={expert.stampId}>
              <Card className="flex h-full flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {expert.verticalLabels.length > 0
                    ? expert.verticalLabels.join(" · ")
                    : "Doğrulanmış rozet"}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">{expert.displayName}</h2>
                <p className="mt-1 text-sm text-[var(--foreground)]">{expert.title}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Doğrulanmış rozet: {expert.badgeCount}
                </p>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">
                  {expert.portfolioSummary}
                </p>
                <div className="mt-4">
                  <Link
                    href={expert.href as Route}
                    className="text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                  >
                    Kamu kanıt kartı
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 space-y-4" aria-labelledby="career-vitrin-faq">
        <h2 id="career-vitrin-faq" className="text-lg font-semibold tracking-tight">
          Sık sorulanlar
        </h2>
        {DIRECTORY_FAQ.map((item) => (
          <div key={item.question}>
            <h3 className="text-sm font-semibold">{item.question}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

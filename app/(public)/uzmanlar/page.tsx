import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { IconArrow, IconLock, IconSearch } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { PublicHero } from "@/components/ui/public-hero";
import { loadTalentDirectory } from "@/lib/career/talent-directory-load";
import {
  TALENT_DIRECTORY_PATH,
  TALENT_DIRECTORY_PROVINCES,
  TALENT_DIRECTORY_VERTICALS,
  parseTalentCity,
  parseTalentVertical,
} from "@/lib/career/talent-directory";
import { breadcrumbListJsonLd, faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

const DIRECTORY_FAQ = [
  {
    question: "Bu dizin iş ilanı mıdır?",
    answer:
      "Hayır. Para platformdan geçmez. Kart, kamuya açık rozet sayfasına gider. Anlaşma kişilerin kendi arasındadır.",
  },
  {
    question: "Liste neden boş görünebilir?",
    answer:
      "Aynı dikey veya ilde 5'ten az doğrulanmış rozet varken liste basılmaz. Sahte profil üretilmez.",
  },
  {
    question: "Nasıl listelenirim?",
    answer:
      "YetkinCV vaka testini Kariyer (/career) sayfasında çöz. YetkinCV Onaylı Yetenek Rozetin kamu kanıtı /vize adresinde oluşur. Eşik dolunca dizin açılır.",
  },
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ dikey?: string; il?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  const filtered = Boolean(query.dikey?.trim() || query.il?.trim());
  return pageMetadata({
    ...PAGE_SEO.uzmanlar,
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  });
}

export default async function UzmanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ dikey?: string; il?: string }>;
}) {
  const query = await searchParams;
  const vertical = parseTalentVertical(query.dikey);
  const city = parseTalentCity(query.il);
  const directory = await loadTalentDirectory({ dikey: query.dikey, il: query.il });
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <JsonLd
        data={jsonLdDocument([
          faqPageJsonLd(DIRECTORY_FAQ),
          breadcrumbListJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Uzmanlar", path: TALENT_DIRECTORY_PATH },
          ]),
        ])}
      />
      <PublicHero
        eyebrow="Kamu vitrini"
        title="Doğrulanmış rozetli uzmanlar"
        description="Dizin yalnız YetkinCV Onaylı Yetenek Rozetini gösterir. Doğrulama Kariyer (/career) ve kamu kanıt sayfası (/vize) üzerindedir. Tahsilat, emanet ve iş ilanı bu sayfada yoktur. İletişim, kartın sahibiyle senin arandadır."
      />

      <form method="get" action={TALENT_DIRECTORY_PATH} className="mt-8 grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="flex min-w-40 flex-col gap-1.5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <IconSearch className="h-3.5 w-3.5 text-blue-600" />
            Dikey
          </span>
          <select
            name="dikey"
            defaultValue={vertical ?? ""}
            className={INPUT_SURFACE_CLASS}
          >
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
        <div className="mt-8 space-y-4">
          <Card>
            <p className="text-[var(--foreground)]">{directory.message}</p>
            <div className="mt-4">
              <LinkButton href={directory.ctaHref} size="sm">
                {directory.ctaLabel}
                <IconArrow className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
          </Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Onaylı Uzman Vitrini Önizlemesi
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {TALENT_DIRECTORY_VERTICALS.map((item) => (
              <li key={item.id}>
                <article className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 shadow-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    <IconLock className="h-3.5 w-3.5" />
                    Kilitli önizleme
                  </span>
                  <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-800">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Bu kart bir kişi değildir. Eşik dolunca aynı dikeydeki doğrulanmış mühürler burada açılır.
                    İsim ve profil uydurulmaz.
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {directory.experts.map((expert) => (
            <li key={expert.stampId}>
              <Card className="flex h-full flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {expert.verticalLabels.length > 0 ? expert.verticalLabels.join(" · ") : "Doğrulanmış rozet"}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">{expert.displayName}</h2>
                <p className="mt-1 text-sm text-[var(--foreground)]">{expert.title}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Doğrulanmış rozet: {expert.badgeCount}
                </p>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{expert.portfolioSummary}</p>
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

      <section className="mt-12 space-y-4" aria-labelledby="uzmanlar-faq">
        <h2 id="uzmanlar-faq" className="text-lg font-semibold tracking-tight">
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

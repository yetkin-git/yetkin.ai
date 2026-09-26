import type { Metadata } from "next";
import { KasaReturnPanel } from "@/components/kernel/kasa-return-panel";
import { pageMetadata } from "@/lib/copy/seo";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";

export const metadata: Metadata = pageMetadata({
  title: CUZDAN_SEN.kasaTitle,
  description: CUZDAN_SEN.kasaLead,
  path: "/kasa/donus",
  robots: { index: false, follow: false },
});

export default async function DronKasaReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = query.sonuc;
  const outcome = Array.isArray(raw) ? raw[0] : raw;
  const ok = outcome !== "fail";
  const rawCourse = query.kurs;
  const courseSlug = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {CUZDAN_SEN.kasaTitle}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]" suppressHydrationWarning>
        {ok ? "Ödeme" : CUZDAN_SEN.kasaTitle}
      </h1>
      <KasaReturnPanel ok={ok} courseSlug={courseSlug ?? null} />
    </main>
  );
}

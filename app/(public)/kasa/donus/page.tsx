import type { Metadata } from "next";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";

export const metadata: Metadata = {
  title: CUZDAN_SEN.kasaTitle,
  robots: { index: false, follow: false },
};

export default async function DronKasaReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = query.sonuc;
  const outcome = Array.isArray(raw) ? raw[0] : raw;
  const ok = outcome !== "fail";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {CUZDAN_SEN.kasaTitle}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{CUZDAN_SEN.kasaTitle}</h1>
      <p className="mt-4 text-sm text-[var(--foreground)]">
        {ok ? CUZDAN_SEN.kasaReturnOk : CUZDAN_SEN.kasaReturnFail}
      </p>
    </main>
  );
}

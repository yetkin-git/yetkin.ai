import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TezgahWorkbench } from "@/components/tezgah/workbench";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import { SIGNUP_FIRST_VALUE_PARAM } from "@/lib/kernel/auth/redirects";
import { tezgahRelocatedOsHref } from "@/lib/tezgah/catalog";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.tezgah,
  robots: { index: true, follow: true },
});

export default async function TezgahPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string | string[] }>;
}) {
  const query = await searchParams;
  const rawTool = Array.isArray(query.tool) ? query.tool[0] : query.tool;
  const moved = tezgahRelocatedOsHref(rawTool);
  if (moved) {
    redirect(moved);
  }
  // B-03: kayıt doğrulamasından gelen `?ilk=1` işareti. Değer ne olursa olsun
  // varlığı yeterli; sorgu içeriği güvenilmez girdidir, yalnız bayrak okunur.
  const queryBag = query as Record<string, string | string[] | undefined>;
  const rawFirst = queryBag[SIGNUP_FIRST_VALUE_PARAM];
  const firstVisit = (Array.isArray(rawFirst) ? rawFirst[0] : rawFirst) != null;
  const session = await getSession();
  const freelancerName = await loadTezgahFreelancerName(session);
  return (
    <RoomFrame className="space-y-3">
      <div className="flex items-end justify-between gap-3 print:hidden">
        <PageHeader
          eyebrow="AI Tezgâh"
          title={firstVisit ? "İlk çıktını al — tek alan yeter" : "Dakikalar içinde kullanıma hazır çıktı"}
          tight
          className="min-w-0"
        />
        <div id="tezgah-header-quota" className="shrink-0" />
      </div>
      {firstVisit ? (
        <p
          data-tezgah-first-visit=""
          className="rounded-[var(--radius-card)] border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-950 print:hidden"
        >
          Hoş geldin. Aşağıya müşteri ihtiyacını yaz, «Üret»e bas: kapsam, teslimat adımları ve
          teklif metnini hazır alacaksın. Hiçbir şeyi elle kurman gerekmez.
        </p>
      ) : null}
      <Suspense
        fallback={<p className="text-sm text-[var(--muted)] print:hidden">Tezgâh açılıyor</p>}
      >
        <TezgahWorkbench freelancerName={freelancerName} signedIn={session != null} />
      </Suspense>
    </RoomFrame>
  );
}

async function loadTezgahFreelancerName(session: Awaited<ReturnType<typeof getSession>>): Promise<string> {
  if (!session) {
    return "";
  }
  const board = await loadIdentityBoard(session.id);
  return (board?.user?.displayName ?? "").trim().slice(0, 80);
}

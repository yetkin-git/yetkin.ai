import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TezgahWorkbench } from "@/components/tezgah/workbench";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
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
  const session = await getSession();
  const freelancerName = await loadTezgahFreelancerName(session);
  return (
    <RoomFrame className="space-y-3">
      <div className="flex items-end justify-between gap-3 print:hidden">
        <PageHeader
          eyebrow="AI Tezgâh"
          title="Dakikalar içinde kullanıma hazır çıktı"
          tight
          className="min-w-0"
        />
        <div id="tezgah-header-quota" className="shrink-0" />
      </div>
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

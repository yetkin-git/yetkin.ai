import type { Metadata } from "next";
import { Suspense } from "react";
import { TezgahWorkbench } from "@/components/tezgah/workbench";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.tezgah,
  robots: { index: true, follow: true },
});

export default async function TezgahPage() {
  const freelancerName = await loadTezgahFreelancerName();
  return (
    <RoomFrame>
      <div className="print:hidden">
        <PageHeader
          eyebrow="AI Tezgâh"
          title="Müşterine bugün verebileceğin çıktı"
          description="Ürün kartı, teklif, hibe ön notu, site tetkiki, dijital dükkan, reklam paketi veya pazaryeri kataloğu. Misafire günde 1, ücretsiz kayıtla günde 3 üretim."
        />
      </div>
      <Suspense
        fallback={<p className="mt-6 text-sm text-[var(--muted)] print:hidden">Tezgâh açılıyor</p>}
      >
        <TezgahWorkbench freelancerName={freelancerName} />
      </Suspense>
    </RoomFrame>
  );
}

async function loadTezgahFreelancerName(): Promise<string> {
  const session = await getSession();
  if (!session) {
    return "";
  }
  const board = await loadIdentityBoard(session.id);
  return (board?.user?.displayName ?? "").trim().slice(0, 80);
}

import type { Metadata } from "next";
import { CheckoutForm } from "@/components/junior/checkout-form";
import { JUNIOR_SEO_BRAND, pageMetadata } from "@/lib/copy/seo";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { juniorElectivePicks } from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";
import { loadJuniorHome } from "@/lib/junior/load";
import { readJuniorYearlyPrice } from "@/lib/junior/price";
import { isJuniorCheckoutLocked } from "@/lib/kernel/security/junior-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: `Yıllık paket | ${JUNIOR_SEO_BRAND}`,
  description: "Junior yıllık paket ödeme ekranı. Veli girişi ve üç onay tamamlanmadan ödeme açılmaz.",
  path: "/junior/checkout",
  robots: { index: false, follow: false },
});

export default async function JuniorCheckoutPage() {
  const session = await getSession();
  const home = session ? await loadJuniorHome(session.id) : null;
  const picks = juniorElectivePicks();
  const selected = home?.selected?.selectedElectives ?? [];
  const titles = picks.filter((pick) => selected.includes(pick.slug)).map((pick) => pick.title);
  const active = home?.plan.status === "ACTIVE";
  const priceLabel = await readJuniorYearlyPrice()
    .then((price) => price?.label ?? null)
    .catch(() => null);
  const checkoutOpen = !isJuniorCheckoutLocked();
  const priceSentence = priceLabel
    ? `${priceLabel} karşılığında çekirdek derslerin kilitli konuları açılır.`
    : "Liste fiyatı katalogda yok. Tutar uydurulmaz.";
  const doorSentence = checkoutOpen
    ? "Ödeme ekranı, üç onay tamamlanmadan yüklenmez."
    : "Ödeme hattı henüz bağlanmadı.";

  return (
    <RoomFrame className="space-y-4">
      <PageHeader
        tight
        eyebrow="Junior kasası"
        title="Yıllık paket"
        description={`${priceSentence} Her çocuk profiline ${JUNIOR_ELECTIVE_QUOTA} seçmeli ders hakkı tanımlanır. ${doorSentence}`}
        actions={
          <LinkButton href="/junior" variant="outline" size="sm">
            Ders listesi
          </LinkButton>
        }
      />
      <section className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6">
        <p className="font-semibold">Sepet</p>
        <p>Junior yıllık paket — {priceLabel ?? "fiyat katalogda yok"}</p>
        <p className="text-[var(--muted)]">
          {titles.length > 0
            ? `Seçili dersler: ${titles.join(", ")}.`
            : "Henüz seçmeli ders seçilmedi. Paket açılınca üç ders hakkı durur. Seçimi odadan yapabilirsin."}
        </p>
      </section>
      {session && home ? (
        <CheckoutForm alreadyActive={active} checkoutOpen={checkoutOpen} />
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
          <p className="text-sm leading-6 text-[var(--muted)]">Ödeme için veli girişi gerekir.</p>
          <LinkButton href={buildCitizenLoginHref("/junior/checkout")} size="sm">
            Veli girişi
          </LinkButton>
        </section>
      )}
    </RoomFrame>
  );
}

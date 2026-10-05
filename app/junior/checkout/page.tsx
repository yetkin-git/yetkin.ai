import { CheckoutForm } from "@/components/junior/checkout-form";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { juniorElectivePicks } from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_QUOTA, JUNIOR_YEARLY_LIST_PRICE_LABEL } from "@/lib/junior/limits";
import { loadJuniorHome } from "@/lib/junior/load";

export const dynamic = "force-dynamic";

export default async function JuniorCheckoutPage() {
  const session = await getSession();
  const home = session ? await loadJuniorHome(session.id) : null;
  const picks = juniorElectivePicks();
  const selected = home?.selected?.selectedElectives ?? [];
  const titles = picks.filter((pick) => selected.includes(pick.slug)).map((pick) => pick.title);
  const active = home?.plan.status === "ACTIVE";

  return (
    <RoomFrame className="space-y-4">
      <PageHeader
        tight
        eyebrow="Junior kasası"
        title="Yıllık paket"
        description={`${JUNIOR_YEARLY_LIST_PRICE_LABEL} karşılığında çekirdek derslerin kilitli konuları açılır. Her çocuk profiline ${JUNIOR_ELECTIVE_QUOTA} seçmeli ders hakkı tanımlanır. Ödeme hattı henüz bağlanmadı.`}
        actions={
          <LinkButton href="/junior" variant="outline" size="sm">
            Ders listesi
          </LinkButton>
        }
      />
      <section className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6">
        <p className="font-semibold">Sepet</p>
        <p>Junior yıllık paket — {JUNIOR_YEARLY_LIST_PRICE_LABEL}</p>
        <p className="text-[var(--muted)]">
          {titles.length > 0
            ? `Seçili dersler: ${titles.join(", ")}.`
            : "Henüz seçmeli ders seçilmedi. Paket açılınca üç ders hakkı durur. Seçimi odadan yapabilirsin."}
        </p>
      </section>
      {session && home ? (
        <CheckoutForm alreadyActive={active} />
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

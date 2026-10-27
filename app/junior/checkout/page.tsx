import type { Metadata } from "next";
import { CheckoutForm } from "@/components/junior/checkout-form";
import { JUNIOR_SEO_BRAND, pageMetadata } from "@/lib/copy/seo";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { juniorElectivePicks } from "@/lib/junior/catalog";
import {
  JUNIOR_ELECTIVE_INTRO_LABEL,
  JUNIOR_ELECTIVE_QUOTA,
  juniorElectiveQuotaRightsHint,
} from "@/lib/junior/limits";
import { loadJuniorHome } from "@/lib/junior/load";
import { readJuniorYearlyPrice } from "@/lib/junior/price";
import { isJuniorAuditActor, isJuniorCheckoutLocked } from "@/lib/kernel/security/junior-gate";
import { JUNIOR_CHECKOUT_AUDIT_MESSAGE } from "@/lib/junior/checkout";

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
  const titles = picks
    .filter((pick) => selected.includes(pick.slug))
    .map((pick) => (pick.ready ? pick.title : `${pick.title} (Yakında, pakette açılmaz)`));
  const active = home?.plan.status === "ACTIVE";
  const priceLabel = await readJuniorYearlyPrice()
    .then((price) => price?.label ?? null)
    .catch(() => null);
  const review =
    session != null &&
    isJuniorAuditActor({
      id: session.id,
      email: session.email,
      emailConfirmedAt: session.emailConfirmedAt ?? null,
    });
  const checkoutOpen = !isJuniorCheckoutLocked();
  const priceSentence = !checkoutOpen
    ? priceLabel
      ? `${priceLabel} liste fiyatıdır. Satış kapalıdır; bu tutar tahsil edilmez.`
      : "Liste fiyatı katalogda yok. Satış kapalıdır. Tutar uydurulmaz."
    : priceLabel
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
      {review ? (
        <section
          className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6"
          data-junior-checkout-review=""
        >
          <p className="font-semibold">İnceleme modu</p>
          <p>{JUNIOR_CHECKOUT_AUDIT_MESSAGE}</p>
        </section>
      ) : null}
      <section className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6">
        <p className="font-semibold">Sepet</p>
        <p>
          Junior yıllık paket — {priceLabel ?? "fiyat katalogda yok"}
          {checkoutOpen ? "" : " · satış kapalı"}
        </p>
        <p className="text-[var(--muted)]">
          {titles.length > 0
            ? `Seçili dersler: ${titles.join(", ")}.`
            : `Henüz seçmeli ders seçilmedi. ${juniorElectiveQuotaRightsHint()} Seçimi odadan yapabilirsin.`}
        </p>
        <p className="text-[var(--muted)]">
          Çekirdek İngilizce, 6. Sınıf İngilizce kartıdır. Seçmeli kartlar «{JUNIOR_ELECTIVE_INTRO_LABEL}»
          kapsamındadır; yıllık seçmeli müfredat değildir. Seçmeli İngilizce bu sepete ve paket fiyatına girmez.
          Mühürü tamamlanmamış seçmeli dersler Yakında olarak görünür ve paket içinde açılmaz.
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

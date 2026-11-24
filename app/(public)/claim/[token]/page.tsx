import type { Metadata } from "next";
import { ClaimOrderForm } from "@/components/auth/claim-order-form";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import { pageMetadata } from "@/lib/copy/seo";
import { isClaimTokenShaped, loadClaimOrder } from "@/lib/tezgah/guest-claim";

/**
 * Faz 3 / §4.1 — `/claim/[token]` hesap sahiplenme sayfası.
 *
 * Misafir ödeme onaylandıktan sonra e-postadaki bağlantı buraya iner. Kullanıcı
 * şifresini belirler; hesap açılır, defter kaydı yazılır, Pro aboneliği etkinleşir.
 *
 * Dürüstlük: token tek kullanımlık ve sürelidir. Kullanılmış/süresi geçmiş token
 * "geçerli değil" der ve **hesap açmaz**. Ödeme onaylanmamışsa (PENDING) sayfa
 * "biraz sonra tekrar gel" der; uydurma "hazır" mesajı basılmaz.
 *
 * `index: false`: bu sayfa kişisel bir bağdır; arama motoruna girmemeli.
 */
export const metadata: Metadata = pageMetadata({
  title: "Hesabını aç",
  description: "Misafir ödemeni hesabına bağla ve Tezgâh Pro'yu aç.",
  path: "/claim",
  robots: { index: false, follow: false },
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto max-w-xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <LegalBackToHome />
        {children}
      </div>
    </main>
  );
}

export default async function ClaimOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isClaimTokenShaped(token)) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold tracking-tight">Bu bağlantı geçerli değil</h1>
        <Card>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Bağlantı eksik veya bozuk. E-postandaki bağlantının tamamını açtığından emin ol.
          </p>
          <div className="mt-4">
            <LinkButton href="/" variant="outline" size="sm">
              Ana sayfa
            </LinkButton>
          </div>
        </Card>
      </Shell>
    );
  }

  const claim = await loadClaimOrder(token);
  if (!claim.ok) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold tracking-tight">Hesap bağlantısı</h1>
        <Card>
          <p className="text-sm leading-6 text-[var(--muted)]">{claim.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/login" variant="outline" size="sm">
              Giriş yap
            </LinkButton>
            <LinkButton href="/iletisim" variant="outline" size="sm">
              Destek
            </LinkButton>
          </div>
        </Card>
      </Shell>
    );
  }

  const email = (claim.order.guestEmail ?? "").trim();
  return (
    <Shell>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
        Misafir ödeme
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Hesabını aç</h1>
      <p className="text-sm leading-6 text-[var(--muted)]">
        Ödemen alındı ve Tezgâh Pro erişimin hazır. Bir şifre belirle; hesabın açılsın,
        bakiyen cüzdanına yazılsın ve doğrudan Tezgâh&apos;a geç.
      </p>
      <Card>
        <ClaimOrderForm token={token} email={email} />
      </Card>
      <p className="text-xs leading-5 text-[var(--muted)]">
        Bu bağlantı tek kullanımlıktır. Şifreni belirledikten sonra burada bir daha açılmaz;
        girişini normal giriş ekranından yaparsın.
      </p>
    </Shell>
  );
}

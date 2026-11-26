import Link from "next/link";
import { BrandIcon } from "@/components/ui/brand-icon";
import { HomeAccountNav } from "@/components/public/home-account-nav";
import { YETKIN_BRAND } from "@/lib/copy/brand";

/**
 * Kamu sayfalarının ortak üst menüsü (M-03).
 *
 * Sorun: `app/(public)/layout.tsx` hiçbir üst menü basmıyordu. `/fiyatlandirma` →
 * `/hakkimizda` geçen kullanıcı navigasyonu kaybediyor, sayfanın en altına inip
 * 11 px'lik footer bağlarını arıyordu. İç bağlantı değeri (SEO) ve keşif (CRO)
 * aynı anda düşüyordu. Ana sayfa kendi `<header>`'ını taşıyordu — bu bileşen o
 * deseni **ortak** hâle getirir, böylece çift header doğmaz.
 *
 * Tasarım kararları:
 * - `sticky` değil `relative`: sabit footer zaten var; ikinci sabit katman
 *   mobilde içeriği yer. Menü sayfayla birlikte kayar, arama motoru için normal akış.
 * - `min-h-11` dokunma hedefi — mevcut ana sayfa bağlarıyla aynı erişilebilirlik.
 * - Hesap aksiyonları (`Giriş Yap` / `Ücretsiz Başla`) `HomeAccountNav`'dan gelir:
 *   `getSession()` Suspense içinde okunur, HTML kabuğu bloklanmaz.
 * - Etiketler tek yerde: bu dosya kopya metni taşımaz, `SEN_VOICE` okur.
 */

export const PUBLIC_TOP_BAR_PATHS = [
  { href: "/e-ticaret", label: "E-Ticaret" },
  { href: "/hibe", label: "YetkinHibe" },
  { href: "/tezgah", label: "AI Tezgâh" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/rehber", label: "Rehber" },
] as const;

const linkClassName =
  "inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]";

export function PublicTopBar() {
  return (
    <header
      data-public-top-bar=""
      className="relative z-10 flex shrink-0 flex-wrap items-center gap-1.5 px-6 pt-4"
    >
      <Link
        href="/"
        aria-label={`${YETKIN_BRAND} ana sayfa`}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl pr-1"
      >
        <BrandIcon width={32} height={32} className="h-8 w-8" />
        <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          {YETKIN_BRAND}
        </span>
      </Link>
      <nav aria-label="Kamu menüsü" className="flex flex-wrap items-center gap-0.5">
        {PUBLIC_TOP_BAR_PATHS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClassName}>
            {item.label}
          </Link>
        ))}
      </nav>
      <HomeAccountNav />
    </header>
  );
}

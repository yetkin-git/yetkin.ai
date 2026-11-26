import type { ReactNode } from "react";
import { PublicTopBar } from "@/components/public/public-top-bar";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";

/**
 * Kamu kabuğu (M-03).
 *
 * Üst menü **tek yerde**: `PublicTopBar`. Ana sayfa bu bileşeni kullanır ve kendi
 * `<header>`'ını basmaz — böylece çift header doğmaz. Diğer kamu sayfaları
 * (`/fiyatlandirma`, `/kurumsal`, `/rehber`, `/legal`, `/iletisim`, `/hakkimizda`,
 * `/sozluk`, `/tetkik`, `/career/vitrin`) da aynı navigasyonu görür.
 *
 * Üst menü `sticky` değildir: sabit footer zaten var; ikinci sabit katman mobilde
 * içeriği yer. Menü sayfayla kayar, içerik arama motoru için normal akışta kalır.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicTopBar />
      {/* Sabit LegalSiteFooter içeriğin üzerine binmesin diye yeterli alt boşluk. */}
      <div className="pb-32">{children}</div>
      <LegalSiteFooter />
    </>
  );
}

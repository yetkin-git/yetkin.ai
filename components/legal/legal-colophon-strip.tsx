import Link from "next/link";
import {
  LEGAL_FOOTER_LINKS,
  LEGAL_PAGE_TITLE,
} from "@/lib/copy/legal-launch";

/**
 * Ürün vitrini (Akademi / Kariyer / Freelancer) için satır içi yasal nav şeridi.
 * Kamu ön sayfalarındaki `LegalSiteFooter` fixed tabanın aksine sayfa akışında
 * durur; AppShell masaüstü sidebar'ı ve mobil çekmece ile çakışmaz.
 * Unvan / VKN / MERSİS / adres birincil görünümde yoktur; sözleşme katmanı
 * `/legal/*` metinlerindedir. Link SSOT'u `lib/copy/legal-launch.ts`'dir.
 */
export function LegalColophonStrip() {
  return (
    <footer
      data-legal-colophon-strip=""
      className="mx-auto mt-12 max-w-4xl border-t border-[var(--border)] px-2 pb-2 pt-4"
    >
      <nav
        aria-label={LEGAL_PAGE_TITLE}
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
      >
        {LEGAL_FOOTER_LINKS.map((link) => {
          const className =
            "whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-wide text-[var(--muted)] opacity-90 transition-opacity hover:opacity-100 hover:underline";
          if (link.href.startsWith("mailto:")) {
            return (
              <a key={link.href} href={link.href} title={link.title} className={className}>
                {link.label}
              </a>
            );
          }
          return (
            <Link key={link.href} href={link.href} title={link.title} className={className}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

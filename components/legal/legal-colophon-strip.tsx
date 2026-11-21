import Link from "next/link";
import { ObfuscatedEmailText } from "@/components/legal/obfuscated-email";
import {
  LEGAL_FOOTER_LINKS,
  LEGAL_PAGE_TITLE,
} from "@/lib/copy/legal-launch";
import {
  PLATFORM_DISCOVERY_LINKS,
  PLATFORM_DISCOVERY_NAV_LABEL,
} from "@/lib/copy/platform-discovery";

/**
 * Ürün vitrini (Akademi / Kariyer / Freelancer) için satır içi yasal nav şeridi.
 * Kamu ön sayfalarındaki `LegalSiteFooter` fixed tabanın aksine sayfa akışında
 * durur; AppShell masaüstü sidebar'ı ve mobil çekmece ile çakışmaz.
 * Unvan / VKN / MERSİS / adres birincil görünümde yoktur; sözleşme katmanı
 * `/legal/*` metinlerindedir. Link SSOT'u `lib/copy/legal-launch.ts`'dir.
 * Keşif bağları yasal sicilden ayrıdır (`lib/copy/platform-discovery.ts`).
 */
export function LegalColophonStrip({ compact = false }: { compact?: boolean }) {
  const linkClassName =
    "whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-wide text-[var(--muted)] opacity-90 transition-opacity hover:opacity-100 hover:underline";

  return (
    <footer
      data-legal-colophon-strip=""
      className={
        compact
          ? "mx-auto mt-4 max-w-4xl border-t border-[var(--border)] px-2 pb-2 pt-3"
          : "mx-auto mt-12 max-w-4xl border-t border-[var(--border)] px-2 pb-2 pt-4"
      }
    >
      <nav
        aria-label={PLATFORM_DISCOVERY_NAV_LABEL}
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
      >
        {PLATFORM_DISCOVERY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            title={link.title}
            prefetch={false}
            className={linkClassName}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <nav
        aria-label={LEGAL_PAGE_TITLE}
        className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
      >
        {LEGAL_FOOTER_LINKS.map((link) => {
          if (link.href.startsWith("mailto:")) {
            return (
              <a
                key={link.href}
                href={link.href.replace("@", "%40")}
                title="Destek"
                className={linkClassName}
                suppressHydrationWarning
              >
                <ObfuscatedEmailText email={link.label} />
              </a>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              prefetch={false}
              className={linkClassName}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

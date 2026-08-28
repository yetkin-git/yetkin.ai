import Link from "next/link";
import { LEGAL_FOOTER_LINKS, LEGAL_PAGE_TITLE } from "@/lib/copy/legal-launch";

/** PayTR vitrin — kamu ve auth sayfalarında yasal URL'ler kaydırmadan tabanda durur. */
export function LegalSiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--background)] from-35% to-transparent">
      <nav
        aria-label={LEGAL_PAGE_TITLE}
        className="pointer-events-auto mx-auto flex h-10 max-w-6xl items-center justify-center gap-x-0.5 overflow-x-auto px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 sm:gap-x-1"
      >
        {LEGAL_FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            title={link.title}
            className="shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-wide text-[var(--muted)] opacity-55 transition-opacity hover:opacity-100 hover:underline sm:px-2.5 sm:text-xs"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

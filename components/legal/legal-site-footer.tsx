import Link from "next/link";
import {
  LEGAL_FOOTER_LINKS,
  LEGAL_PAGE_TITLE,
} from "@/lib/copy/legal-launch";

/** Kamu ön sayfalarında (/ , /legal/*, /iletisim) yalnızca yasal nav + destek e-postası. */
export function LegalSiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--background)] from-25% to-transparent">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col items-center px-3 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
        <nav
          aria-label={LEGAL_PAGE_TITLE}
          className="flex max-w-full items-center justify-center gap-x-0.5 overflow-x-auto sm:gap-x-1"
        >
          {LEGAL_FOOTER_LINKS.map((link) => {
            const className =
              "shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-wide text-[var(--muted)] opacity-90 transition-opacity hover:opacity-100 hover:underline sm:px-2.5 sm:text-xs";
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
      </div>
    </footer>
  );
}

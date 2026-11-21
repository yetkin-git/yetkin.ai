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

const linkClassName =
  "shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium tracking-wide text-[var(--muted)] opacity-90 transition-opacity hover:opacity-100 hover:underline sm:px-2.5 sm:text-xs";

/** Kamu ön sayfalarında (/ , /legal/*, /iletisim) keşif + yasal nav + destek e-postası. */
export function LegalSiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--background)] from-25% to-transparent">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col items-center gap-0.5 px-3 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
        <nav
          aria-label={PLATFORM_DISCOVERY_NAV_LABEL}
          className="flex max-w-full flex-wrap items-center justify-center gap-x-0.5 gap-y-0.5 sm:gap-x-1"
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
          className="flex max-w-full items-center justify-center gap-x-0.5 overflow-x-auto sm:gap-x-1"
        >
          <Link
            href="/kurumsal"
            title="Kurumsal teklif"
            prefetch={false}
            className={linkClassName}
          >
            Kurumsal
          </Link>
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
      </div>
    </footer>
  );
}

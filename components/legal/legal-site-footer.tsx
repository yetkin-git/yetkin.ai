import Link from "next/link";
import { SecurePaymentMarks } from "@/components/legal/secure-payment-marks";
import {
  LEGAL_ENTITY,
  LEGAL_ENTITY_COLOPHON,
  LEGAL_FOOTER_LINKS,
  LEGAL_PAGE_TITLE,
  LEGAL_SUPPORT_EMAIL,
  LEGAL_SUPPORT_MAILTO,
} from "@/lib/copy/legal-launch";

/** Yalnızca kamu ön sayfalarında (/, /legal/*, /iletisim) yasal künye tabanda durur. */
export function LegalSiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--background)] from-25% to-transparent">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col items-center gap-1.5 px-3 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
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
        <p
          data-legal-entity-colophon=""
          className="max-w-4xl text-center text-[10px] leading-snug text-[var(--muted)] opacity-90 sm:text-[11px]"
        >
          {LEGAL_ENTITY.tradeName} · VKN {LEGAL_ENTITY.vkn} · MERSİS {LEGAL_ENTITY.mersis} · {LEGAL_ENTITY.address} ·{" "}
          <a href={LEGAL_SUPPORT_MAILTO} className="underline-offset-2 hover:underline">
            {LEGAL_SUPPORT_EMAIL}
          </a>
        </p>
        <span className="sr-only">{LEGAL_ENTITY_COLOPHON}</span>
        <SecurePaymentMarks compact />
      </div>
    </footer>
  );
}

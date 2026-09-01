import Link from "next/link";
import { BrandIcon } from "@/components/ui/brand-icon";
import { IconChevronLeft } from "@/components/ui/icons";
import { LEGAL_HOME_CTA, LEGAL_HOME_HREF } from "@/lib/copy/legal-launch";

/** Hukuk rozetinin üstü — platforma sabit, görünür çıkış. */
export function LegalBackToHome() {
  return (
    <Link
      href={LEGAL_HOME_HREF}
      data-legal-home=""
      className="group -ml-1 inline-flex w-fit items-center gap-2.5 rounded-xl px-1 py-1 text-sm font-semibold tracking-tight text-[var(--muted)] transition hover:text-[var(--safir-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir)]"
    >
      <BrandIcon className="shrink-0" />
      <span className="inline-flex items-center gap-1">
        <IconChevronLeft className="h-3.5 w-3.5 transition duration-150 group-hover:-translate-x-0.5" />
        {LEGAL_HOME_CTA}
      </span>
    </Link>
  );
}
